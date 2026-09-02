"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { Locale, LOCALE_COOKIE, Translations } from "./translations";

const STORAGE_KEY = "otp.locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

type LanguageContextValue = {
  locale: Locale;
  /** Records the visitor's choice; navigating is what actually changes it. */
  rememberLocale: (locale: Locale) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function writeRememberedLocale(locale: Locale) {
  if (typeof document !== "undefined") {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore storage errors
  }
}

/**
 * Makes the locale of the current route available to client components.
 *
 * The locale is not state: it is the `[locale]` route segment, handed down by
 * the root layout. A copy in `useState` would be a second source of truth that
 * drifts apart the moment the layout re-renders under a different segment — so
 * the prop is passed straight through, and switching language is a navigation
 * rather than a state update.
 *
 * `rememberLocale` only writes the visitor's choice down (cookie plus
 * localStorage). Nothing on the server reads it back: the URL alone decides
 * which language a page renders in, which is what lets those pages be
 * prerendered and cached.
 */
export function LanguageProvider({
  children,
  locale,
  dictionary,
}: {
  children: React.ReactNode;
  locale: Locale;
  // Dictionary of the active locale, resolved on the server. Only this one
  // language is shipped to the client, instead of both ending up in every
  // client bundle.
  dictionary: Translations;
}) {
  const rememberLocale = useCallback(
    (next: Locale) => writeRememberedLocale(next),
    [],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, rememberLocale, t: dictionary }),
    [locale, rememberLocale, dictionary],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

export function useTranslations(): Translations {
  return useLanguage().t;
}
