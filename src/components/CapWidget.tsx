"use client";

import React, { useEffect, useImperativeHandle, useRef } from "react";
import type { CapWidget as CapWidgetElement } from "@cap.js/widget";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * The Cap captcha checkbox (https://trycap.dev).
 *
 * `<cap-widget>` is a web component; the package registers it when it is
 * imported, which touches `window`, so the import happens in an effect rather
 * than at module level. It talks to `/cap/api/`, which this site forwards to
 * the Cap container (see `lib/captcha.ts`).
 */

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "cap-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "data-cap-api-endpoint"?: string;
        "data-cap-lang"?: string;
        "data-cap-hidden-field-name"?: string;
      };
    }
  }
}

/** Same-origin endpoint the widget posts `challenge` and `redeem` to. */
const CAP_API_ENDPOINT = "/cap/api/";

/**
 * The widget's WebAssembly solvers, served from `public/cap/` instead of the
 * jsdelivr default so the captcha makes no third-party request at all. They
 * are the files of `@cap.js/wasm@0.0.8`, the version the widget pins; update
 * them together with `@cap.js/widget`.
 */
const CAP_WASM_URL = "/cap/cap_wasm_bg.wasm";
const CAP_HASHWX_URL = "/cap/hashwx.wasm";

export interface CapWidgetHandle {
  /** Clear the widget after a failed submission; its token is spent. */
  reset: () => void;
}

/** Dark colours matching the site's form fields. */
const DARK_THEME = {
  "--cap-background": "rgba(255, 255, 255, 0.05)",
  "--cap-border-color": "rgba(255, 255, 255, 0.1)",
  "--cap-color": "#ffffff",
  "--cap-checkbox-background": "rgba(255, 255, 255, 0.05)",
  "--cap-checkbox-border": "1px solid rgba(255, 255, 255, 0.25)",
  "--cap-spinner-color": "#22c55e",
  "--cap-spinner-background-color": "rgba(255, 255, 255, 0.1)",
  "--cap-border-radius": "8px",
} as React.CSSProperties;

const CapWidget = React.forwardRef<
  CapWidgetHandle,
  {
    onSolve: (token: string) => void;
    /** The token expired or the widget was reset. */
    onReset: () => void;
    onError: () => void;
  }
>(function CapWidget({ onSolve, onReset, onError }, ref) {
  const { locale } = useLanguage();
  const elementRef = useRef<CapWidgetElement | null>(null);

  // The latest callbacks, so the listeners below are attached only once.
  const handlers = useRef({ onSolve, onReset, onError });
  useEffect(() => {
    handlers.current = { onSolve, onReset, onError };
  });

  useImperativeHandle(ref, () => ({
    reset: () => elementRef.current?.reset?.(),
  }));

  useEffect(() => {
    window.CAP_CUSTOM_WASM_URL = CAP_WASM_URL;
    window.CAP_CUSTOM_HASHWX_URL = CAP_HASHWX_URL;
    import("@cap.js/widget").catch((e) => {
      console.error("[captcha] loading the Cap widget failed:", e);
      handlers.current.onError();
    });

    const element = elementRef.current;
    if (!element) return;

    const solve = (e: Event) =>
      handlers.current.onSolve(
        (e as CustomEvent<{ token: string }>).detail.token,
      );
    const reset = () => handlers.current.onReset();
    const error = () => handlers.current.onError();

    element.addEventListener("solve", solve);
    element.addEventListener("reset", reset);
    element.addEventListener("error", error);
    return () => {
      element.removeEventListener("solve", solve);
      element.removeEventListener("reset", reset);
      element.removeEventListener("error", error);
    };
  }, []);

  return (
    <cap-widget
      ref={(el: HTMLElement | null) => {
        elementRef.current = el as CapWidgetElement | null;
      }}
      data-cap-api-endpoint={CAP_API_ENDPOINT}
      data-cap-lang={locale}
      style={DARK_THEME}
    />
  );
});

export default CapWidget;
