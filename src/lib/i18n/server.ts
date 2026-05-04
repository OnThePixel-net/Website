import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  isLocale,
  Locale,
  LOCALE_COOKIE,
  translations,
} from "./translations";

const LOCALE_HEADER = "x-otp-locale";

export async function getServerLocale(): Promise<Locale> {
  const headerStore = await headers();
  const headerLocale = headerStore.get(LOCALE_HEADER);
  if (isLocale(headerLocale)) return headerLocale;

  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

export async function getServerTranslations() {
  const locale = await getServerLocale();
  return { locale, t: translations[locale] };
}
