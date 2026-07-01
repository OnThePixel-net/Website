"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAnalytics } from "@/hooks/use-analytics";
import { useTranslations } from "@/lib/i18n/LanguageProvider";
import { FaCookieBite } from "react-icons/fa";
import { X } from "lucide-react";

type CookieSettingsProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CookieSettings({ isOpen, onClose }: CookieSettingsProps) {
  const t = useTranslations();
  const { preferences, updatePreferences, resetPreferences } = useAnalytics();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(preferences.analytics);
  const [youtubeEnabled, setYoutubeEnabled] = useState(preferences.youtube);
  const [twitchEnabled, setTwitchEnabled] = useState(preferences.twitch);

  useEffect(() => {
    if (isOpen) {
      setAnalyticsEnabled(preferences.analytics);
      setYoutubeEnabled(preferences.youtube);
      setTwitchEnabled(preferences.twitch);
    }
  }, [isOpen, preferences.analytics, preferences.youtube, preferences.twitch]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    updatePreferences({ analytics: analyticsEnabled, youtube: youtubeEnabled, twitch: twitchEnabled });
    localStorage.setItem("cookie-consent", (analyticsEnabled || youtubeEnabled || twitchEnabled) ? "custom" : "declined");
    window.dispatchEvent(new Event("youtube-consent-changed"));
    window.dispatchEvent(new Event("twitch-consent-changed"));
    onClose();
  };

  const handleReset = () => {
    resetPreferences();
    setAnalyticsEnabled(false);
    setYoutubeEnabled(false);
    setTwitchEnabled(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-settings-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-green-700/40 bg-gray-900 shadow-2xl shadow-black/50 ring-1 ring-green-500/10 animate-in zoom-in-95 fade-in slide-in-from-bottom-2 duration-200"
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-green-500/60 to-transparent" />
        <div className="flex items-start justify-between gap-3 p-6 pb-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/30">
              <FaCookieBite className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h2
                id="cookie-settings-title"
                className="text-lg font-semibold text-white"
              >
                {t.cookieSettings.title}
              </h2>
              <p className="text-sm text-gray-400">
                {t.cookieSettings.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t.cookieSettings.cancel}
            className="-m-1 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 pb-2">
          <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Label htmlFor="essential" className="text-base font-medium text-white">
                    {t.cookieSettings.essentialLabel}
                  </Label>
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-green-400 ring-1 ring-green-500/30">
                    {t.cookieSettings.alwaysActive}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  {t.cookieSettings.essentialDesc}
                </p>
              </div>
              <Switch id="essential" checked disabled />
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4 transition-colors hover:border-gray-700">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Label htmlFor="analytics" className="text-base font-medium text-white">
                  {t.cookieSettings.analyticsLabel}
                </Label>
                <p className="mt-1 text-sm text-gray-400">
                  {t.cookieSettings.analyticsDesc}
                </p>
              </div>
              <Switch
                id="analytics"
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4 transition-colors hover:border-gray-700">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Label htmlFor="youtube" className="text-base font-medium text-white">
                  {t.cookieSettings.youtubeLabel}
                </Label>
                <p className="mt-1 text-sm text-gray-400">
                  {t.cookieSettings.youtubeDesc}
                </p>
              </div>
              <Switch
                id="youtube"
                checked={youtubeEnabled}
                onCheckedChange={setYoutubeEnabled}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4 transition-colors hover:border-gray-700">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Label htmlFor="twitch" className="text-base font-medium text-white">
                  {t.cookieSettings.twitchLabel}
                </Label>
                <p className="mt-1 text-sm text-gray-400">
                  {t.cookieSettings.twitchDesc}
                </p>
              </div>
              <Switch
                id="twitch"
                checked={twitchEnabled}
                onCheckedChange={setTwitchEnabled}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-800/30 p-4 ring-1 ring-gray-800">
            <h4 className="mb-1 text-sm font-medium text-white">
              {t.cookieSettings.howWeUseTitle}
            </h4>
            <p className="text-sm text-gray-400">
              {t.cookieSettings.howWeUseText}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-800 bg-gray-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            {t.cookieSettings.reset}
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              {t.cookieSettings.cancel}
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 text-white shadow-lg shadow-green-900/30 hover:bg-green-500"
            >
              {t.cookieSettings.save}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
