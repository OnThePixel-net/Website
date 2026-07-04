"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaCookieBite } from "react-icons/fa";
import { X } from "lucide-react";
import CookieSettings from "@/components/cookie-settings";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

export default function CookieConsent() {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem("cookie-consent");
    if (!hasConsent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissBanner = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
    }, 220);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    window.localStorage.setItem(
      "va-preferences",
      JSON.stringify({ analytics: true, youtube: true, twitch: true }),
    );
    window.dispatchEvent(new Event("youtube-consent-changed"));
    window.dispatchEvent(new Event("twitch-consent-changed"));
    dismissBanner();
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    window.localStorage.setItem(
      "va-preferences",
      JSON.stringify({ analytics: false, youtube: false, twitch: false }),
    );
    window.dispatchEvent(new Event("youtube-consent-changed"));
    window.dispatchEvent(new Event("twitch-consent-changed"));
    dismissBanner();
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    if (localStorage.getItem("cookie-consent")) {
      dismissBanner();
    }
  };

  useEffect(() => {
    if (!isVisible || showSettings) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDecline();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, showSettings]);

  if (!isVisible && !showSettings) return null;

  return (
    <>
      {isVisible && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          className={`fixed inset-x-0 bottom-0 z-50 p-3 sm:p-6 ${
            isLeaving
              ? "animate-out fade-out slide-out-to-bottom-4 duration-200"
              : "animate-in fade-in slide-in-from-bottom-4 duration-300"
          }`}
        >
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-green-700/40 bg-gray-900/95 shadow-2xl shadow-black/40 ring-1 ring-green-500/10 backdrop-blur-md">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-green-500/60 to-transparent" />
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/30">
                <FaCookieBite className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h2
                    id="cookie-consent-title"
                    className="text-lg font-semibold text-white sm:text-xl"
                  >
                    {t.cookieConsent.title}
                  </h2>
                  <button
                    type="button"
                    onClick={handleDecline}
                    aria-label={t.cookieConsent.decline}
                    className="-m-1 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div
                  id="cookie-consent-desc"
                  className="mt-2 space-y-2 text-sm leading-relaxed text-gray-300"
                >
                  <p>{t.cookieConsent.paragraph1}</p>
                  <p>
                    {t.cookieConsent.paragraph2}{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-green-400 underline-offset-2 hover:underline"
                    >
                      {t.footer.privacy}
                    </Link>
                    .
                  </p>
                </div>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                  <Button
                    variant="ghost"
                    onClick={handleDecline}
                    className="w-full text-gray-300 hover:bg-gray-800 hover:text-white sm:w-auto"
                  >
                    {t.cookieConsent.decline}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCustomize}
                    className="w-full border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white sm:w-auto"
                  >
                    {t.cookieConsent.customize}
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="w-full bg-green-600 text-white shadow-lg shadow-green-900/30 hover:bg-green-500 sm:w-auto"
                  >
                    {t.cookieConsent.acceptAll}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <CookieSettings isOpen={showSettings} onClose={handleCloseSettings} />
      )}
    </>
  );
}
