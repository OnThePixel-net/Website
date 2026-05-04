import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  isLocale,
  Locale,
  LOCALE_COOKIE,
  translations,
} from "./translations";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

export async function getServerTranslations() {
  const locale = await getServerLocale();
  return { locale, t: translations[locale] };
}
