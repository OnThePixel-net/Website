"use client";
import { useState, useEffect } from "react";
import { FaTwitch } from "react-icons/fa";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

function getTwitchConsent(): boolean {
  try {
    const prefs = localStorage.getItem("va-preferences");
    if (!prefs) return false;
    return !!JSON.parse(prefs).twitch;
  } catch {
    return false;
  }
}

function saveTwitchConsent() {
  try {
    const prefs = localStorage.getItem("va-preferences");
    let p: Record<string, boolean> = {};
    if (prefs) p = JSON.parse(prefs);
    p.twitch = true;
    localStorage.setItem("va-preferences", JSON.stringify(p));
    if (!localStorage.getItem("cookie-consent")) {
      localStorage.setItem("cookie-consent", "custom");
    }
    window.dispatchEvent(new Event("twitch-consent-changed"));
  } catch {}
}

export default function TwitchEmbed({ channel }: { channel: string }) {
  const t = useTranslations();
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    setAccepted(getTwitchConsent());
    const handler = () => setAccepted(getTwitchConsent());
    window.addEventListener("twitch-consent-changed", handler);
    return () => window.removeEventListener("twitch-consent-changed", handler);
  }, []);

  const accept = () => {
    saveTwitchConsent();
    setAccepted(true);
  };

  const hostname = typeof window !== "undefined" ? window.location.hostname : "onthepixel.net";
  const embedUrl = `https://player.twitch.tv/?channel=${channel}&parent=${hostname}&autoplay=false`;

  if (accepted === null) {
    return <div className="aspect-video w-full bg-black/40 animate-pulse" />;
  }

  if (!accepted) {
    return (
      <div className="relative aspect-video w-full flex flex-col items-center justify-center gap-4 p-6 text-center"
        style={{ background: "linear-gradient(135deg, #0f0a18 0%, #1a1028 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 50% 40%, rgba(145,71,255,0.6) 0%, transparent 60%)" }} />
        <div className="relative flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600/15 ring-1 ring-purple-500/30">
            <FaTwitch className="h-7 w-7 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              {t.twitchEmbed.title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/40 max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {t.twitchEmbed.description}
            </p>
          </div>
          <button
            onClick={accept}
            className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 hover:bg-purple-500 transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {t.twitchEmbed.accept}
          </button>
          <a
            href="/privacy#twitch"
            className="text-[11px] text-white/20 hover:text-white/50 transition-colors underline underline-offset-2"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t.twitchEmbed.learnMore}
          </a>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={embedUrl}
      className="w-full h-full absolute inset-0"
      allowFullScreen
    />
  );
}
