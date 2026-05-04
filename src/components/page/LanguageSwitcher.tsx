"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  Locale,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
} from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{t.common.language}</span>
      <select
        aria-label={t.common.language}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="cursor-pointer rounded-md border border-gray-700 bg-gray-950 px-2 py-1 text-xs font-medium text-foreground/80 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {loc.toUpperCase()} — {LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
    </label>
  );
}
