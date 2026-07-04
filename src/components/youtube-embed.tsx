"use client";
import { useState, useEffect } from "react";
import { CirclePlay } from "lucide-react";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

function getYoutubeConsent(): boolean {
  try {
    const prefs = localStorage.getItem("va-preferences");
    if (!prefs) return false;
    return !!JSON.parse(prefs).youtube;
  } catch {
    return false;
  }
}

function saveYoutubeConsent() {
  try {
    const prefs = localStorage.getItem("va-preferences");
    let p: Record<string, boolean> = {};
    if (prefs) p = JSON.parse(prefs);
    p.youtube = true;
    localStorage.setItem("va-preferences", JSON.stringify(p));
    if (!localStorage.getItem("cookie-consent")) {
      localStorage.setItem("cookie-consent", "custom");
    }
    window.dispatchEvent(new Event("youtube-consent-changed"));
  } catch {}
}

export default function YoutubeEmbed({ videoId }: { videoId: string }) {
  const t = useTranslations();
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    setAccepted(getYoutubeConsent());
    const handler = () => setAccepted(getYoutubeConsent());
    window.addEventListener("youtube-consent-changed", handler);
    return () => window.removeEventListener("youtube-consent-changed", handler);
  }, []);

  const accept = () => {
    saveYoutubeConsent();
    setAccepted(true);
  };

  if (accepted === null) {
    return (
      <div className="overflow-hidden rounded-xl border border-white/5">
        <div className="aspect-video w-full bg-black/40 animate-pulse" />
      </div>
    );
  }

  if (!accepted) {
    return (
      <div className="overflow-hidden rounded-xl border border-white/8">
        <div className="relative aspect-video w-full bg-gray-900 flex flex-col items-center justify-center gap-4 p-6 text-center"
          style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)" }}>
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle at 50% 40%, rgba(255,0,0,0.4) 0%, transparent 60%)" }} />
          <div className="relative flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600/15 ring-1 ring-red-500/30">
              <CirclePlay className="h-7 w-7 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                {t.youtubeEmbed.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/40 max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {t.youtubeEmbed.description}
              </p>
            </div>
            <button
              onClick={accept}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30 hover:bg-red-500 transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {t.youtubeEmbed.accept}
            </button>
            <a
              href="/privacy#youtube"
              className="text-[11px] text-white/20 hover:text-white/50 transition-colors underline underline-offset-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t.youtubeEmbed.learnMore}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/5">
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="YouTube video"
        />
      </div>
    </div>
  );
}
