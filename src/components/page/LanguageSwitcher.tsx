"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  Locale,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
} from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length > 0 &&
    (SUPPORTED_LOCALES as readonly string[]).includes(segments[0])
  ) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    const cleanPath = stripLocalePrefix(pathname || "/");
    const target =
      cleanPath === "/" ? `/${next}` : `/${next}${cleanPath}`;
    router.push(target);
    router.refresh();
  };

  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{t.common.language}</span>
      <select
        aria-label={t.common.language}
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className="cursor-pointer rounded-md border border-gray-700 bg-gray-950 px-2 py-1 text-xs font-medium text-gray-400 hover:text-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
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
