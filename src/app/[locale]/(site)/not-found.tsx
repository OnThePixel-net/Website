"use client";

import NotFoundScreen from "@/components/page/NotFoundScreen";
import { useLocale } from "@/components/LocaleLink";
import { useTranslations } from "@/lib/i18n/LanguageProvider";
import { localizePath } from "@/lib/i18n/paths";

/**
 * The 404 for URLs that did match a locale but whose page then bailed out —
 * a news slug that does not exist, for instance. It lives in the (site) route
 * group and therefore renders inside (site)/layout.tsx, so it keeps the
 * header, the footer and the visitor's language.
 *
 * URLs that match no route at all never reach this file: Next answers those
 * from `app/not-found.tsx`, outside the [locale] segment.
 */
export default function NotFound() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <NotFoundScreen
      tagline={t.notFound.tagline}
      homeLabel={t.notFound.home}
      homeHref={localizePath(locale, "/")}
    />
  );
}
