export const SUPPORTED_LOCALES = ["en", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

export const translations = {
  en: {
    nav: {
      leaderboard: "Leaderboard",
      statistics: "Statistics",
      team: "Team",
      creators: "Creators",
      apply: "Apply",
      discord: "Discord",
      twitter: "Twitter",
      openMenu: "Open menu",
    },
    hero: {
      tagline: "Join now - Don't play alone!",
      leaderboard: "LEADERBOARD",
      discord: "DISCORD",
      copyAddress: "Copy server address",
    },
    footer: {
      followUs: "Follow Us",
      sectionOnThePixel: "OnThePixel",
      aboutUs: "About us",
      meetTheTeam: "Meet the Team",
      creators: "Creators",
      tntRun: "TNT Run",
      sectionResources: "Resources",
      leaderboard: "Leaderboard",
      statistics: "Statistics",
      status: "Status",
      imprint: "Imprint",
      privacy: "Privacy Policy",
      sectionFollowUs: "Follow Us",
      copyright:
        "All Rights Reserved. - Not affiliated with Mojang or Microsoft!",
      backToTop: "Back to Top",
    },
    common: {
      language: "Language",
    },
  },
  de: {
    nav: {
      leaderboard: "Bestenliste",
      statistics: "Statistiken",
      team: "Team",
      creators: "Creators",
      apply: "Bewerben",
      discord: "Discord",
      twitter: "Twitter",
      openMenu: "Menü öffnen",
    },
    hero: {
      tagline: "Tritt jetzt bei - Spiele nicht allein!",
      leaderboard: "BESTENLISTE",
      discord: "DISCORD",
      copyAddress: "Serveradresse kopieren",
    },
    footer: {
      followUs: "Folge uns",
      sectionOnThePixel: "OnThePixel",
      aboutUs: "Über uns",
      meetTheTeam: "Lerne das Team kennen",
      creators: "Creators",
      tntRun: "TNT Run",
      sectionResources: "Ressourcen",
      leaderboard: "Bestenliste",
      statistics: "Statistiken",
      status: "Status",
      imprint: "Impressum",
      privacy: "Datenschutz",
      sectionFollowUs: "Folge uns",
      copyright:
        "Alle Rechte vorbehalten. - Nicht mit Mojang oder Microsoft verbunden!",
      backToTop: "Nach oben",
    },
    common: {
      language: "Sprache",
    },
  },
} as const;

export type Translations = (typeof translations)[Locale];
