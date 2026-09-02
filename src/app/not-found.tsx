import "./globals.css";
import NotFoundScreen from "@/components/page/NotFoundScreen";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/paths";
import { DEFAULT_LOCALE } from "@/lib/i18n/translations";

/**
 * The 404 for URLs that matched no route at all.
 *
 * Next uses the *root* not-found for those, and the root of this app is the
 * `[locale]` segment — so this file sits outside it and gets a minimal layout
 * of Next's own making: no locale, and none of the layout's chrome. It
 * therefore pulls in the stylesheet itself and answers in the default locale,
 * which is the only sensible choice for a URL that carried no language.
 *
 * The locale-aware counterpart is app/[locale]/(site)/not-found.tsx, which
 * handles pages that matched a locale and then called `notFound()`.
 */
export default function RootNotFound() {
  const t = getDictionary(DEFAULT_LOCALE);

  return (
    <div className="bg-gray-950">
      <NotFoundScreen
        tagline={t.notFound.tagline}
        homeLabel={t.notFound.home}
        homeHref={localizePath(DEFAULT_LOCALE, "/")}
      />
    </div>
  );
}
