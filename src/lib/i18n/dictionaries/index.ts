import type { Locale, Translations } from "../translations";
import { de } from "./de";
import { en } from "./en";

// Server-only entry point: it pulls in every dictionary, so it must never be
// imported from a client component. Client components receive the dictionary
// of the active locale as a prop from the root layout instead.
const dictionaries: Record<Locale, Translations> = { en, de };

export function getDictionary(locale: Locale): Translations {
  return dictionaries[locale];
}
