"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { Cap as CapInstance } from "@cap.js/widget";
import { Check, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

/**
 * The captcha checkbox of the public forms, powered by Cap
 * (https://trycap.dev).
 *
 * Cap is used in its programmatic mode: the package creates an invisible
 * `<cap-widget>` that does the proof-of-work, and everything the visitor sees
 * is drawn here, in the site's own style. The package touches `window` when it
 * loads, so it is imported on first use rather than at module level. It talks
 * to `/cap/api/`, which this site forwards to the Cap container (see
 * `lib/captcha.ts`).
 */

/** Same-origin endpoint the solver posts `challenge` and `redeem` to. */
const CAP_API_ENDPOINT = "/cap/api/";

/**
 * The solver's WebAssembly files, served from `public/cap/` instead of the
 * jsdelivr default so the captcha makes no third-party request at all. They
 * are the files of `@cap.js/wasm@0.0.8`, the version the widget pins; update
 * them together with `@cap.js/widget`.
 */
const CAP_WASM_URL = "/cap/cap_wasm_bg.wasm";
const CAP_HASHWX_URL = "/cap/hashwx.wasm";

type Phase = "idle" | "verifying" | "verified" | "error";

export interface CapWidgetHandle {
  /** Clear the checkbox after a failed submission; its token is spent. */
  reset: () => void;
}

/** Load the package once and hand back its `Cap` class. */
let capClass: Promise<typeof CapInstance> | null = null;
function loadCap(): Promise<typeof CapInstance> {
  if (!capClass) {
    window.CAP_CUSTOM_WASM_URL = CAP_WASM_URL;
    window.CAP_CUSTOM_HASHWX_URL = CAP_HASHWX_URL;
    window.CAP_SILENT = true;
    capClass = import("@cap.js/widget")
      .then(() => window.Cap)
      .catch((e) => {
        capClass = null;
        throw e;
      });
  }
  return capClass;
}

const CapWidget = React.forwardRef<
  CapWidgetHandle,
  {
    onSolve: (token: string) => void;
    /** The token expired or the checkbox was reset. */
    onReset: () => void;
    onError: () => void;
  }
>(function CapWidget({ onSolve, onReset, onError }, ref) {
  const t = useTranslations();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const capRef = useRef<CapInstance | null>(null);

  // The latest callbacks, so the Cap listeners are attached only once.
  const handlers = useRef({ onSolve, onReset, onError });
  useEffect(() => {
    handlers.current = { onSolve, onReset, onError };
  });

  const fail = useCallback(() => {
    setPhase("error");
    handlers.current.onError();
  }, []);

  const getCap = useCallback(async (): Promise<CapInstance> => {
    if (capRef.current) return capRef.current;
    const Cap = await loadCap();
    const cap = new Cap({ apiEndpoint: CAP_API_ENDPOINT });
    cap.addEventListener("progress", (e) =>
      setProgress(Math.round(e.detail.progress)),
    );
    cap.addEventListener("solve", (e) => {
      setPhase("verified");
      handlers.current.onSolve(e.detail.token);
    });
    cap.addEventListener("error", () => fail());
    // Fired when the token expires, too — the checkbox is then unticked again.
    cap.addEventListener("reset", () => {
      setPhase("idle");
      setProgress(0);
      handlers.current.onReset();
    });
    capRef.current = cap;
    return cap;
  }, [fail]);

  // The invisible widget lives on <html>; take it along when the form goes.
  useEffect(
    () => () => {
      capRef.current?.widget.remove();
      capRef.current = null;
    },
    [],
  );

  useImperativeHandle(ref, () => ({
    reset: () => {
      capRef.current?.reset();
      setPhase("idle");
      setProgress(0);
    },
  }));

  const start = async () => {
    if (phase === "verifying" || phase === "verified") return;
    setPhase("verifying");
    setProgress(0);
    try {
      const cap = await getCap();
      const result = await cap.solve();
      if (!result?.success) fail();
    } catch (e) {
      console.error("[captcha] solving failed:", e);
      fail();
    }
  };

  const label =
    phase === "verifying"
      ? t.captcha.verifying
      : phase === "verified"
        ? t.captcha.verified
        : phase === "error"
          ? t.captcha.error
          : t.captcha.verify;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={phase === "verified"}
      aria-busy={phase === "verifying"}
      aria-label={label}
      onClick={start}
      disabled={phase === "verified"}
      className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-lg border px-4 py-3.5 text-left transition-colors ${
        phase === "verified"
          ? "cursor-default border-green-500/40 bg-green-500/10"
          : phase === "error"
            ? "border-red-700/50 bg-red-900/20 hover:border-red-500/60"
            : "border-white/10 bg-white/5 hover:border-green-500/50"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all ${
          phase === "verified"
            ? "scale-110 border-green-500 bg-green-500 text-black"
            : phase === "error"
              ? "border-red-500/60 text-red-400"
              : phase === "verifying"
                ? "border-green-500/50 text-green-400"
                : "border-white/25 bg-white/5 group-hover:border-green-500/60"
        }`}
      >
        {phase === "verifying" && <Loader2 size={16} className="animate-spin" />}
        {phase === "verified" && <Check size={18} strokeWidth={3} />}
        {phase === "error" && <RotateCcw size={15} />}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-medium ${
            phase === "verified"
              ? "text-green-400"
              : phase === "error"
                ? "text-red-400"
                : "text-white"
          }`}
        >
          {label}
          {phase === "verifying" && (
            <span className="ml-1.5 tabular-nums text-gray-500">
              {progress}%
            </span>
          )}
        </span>
        <span className="block text-xs text-gray-500">{t.captcha.hint}</span>
      </span>

      <ShieldCheck
        size={22}
        className={`shrink-0 ${
          phase === "verified" ? "text-green-500" : "text-white/20"
        }`}
      />

      {phase === "verifying" && (
        <span
          className="absolute bottom-0 left-0 h-0.5 bg-green-500 transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      )}
    </button>
  );
});

export default CapWidget;
