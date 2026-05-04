export const SUPPORTED_LOCALES = ["en", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "otp.locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

export const DIRECTUS_LOCALES: Record<Locale, string> = {
  en: "en-US",
  de: "de-DE",
};

export const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  de: "de-DE",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

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
      loading: "Loading...",
      back: "Back",
      home: "Home",
      learnMore: "Learn more",
      comingSoon: "Coming Soon",
      live: "Live",
      tryAgain: "Try again",
    },
    news: {
      heading: "NEWS",
      empty: "No news available at the moment.",
      backToNews: "Back to News",
      notFoundTitle: "News — OnThePixel.net",
      englishOnly: "This article is only available in English.",
      readInEnglish: "Click here to read it in English.",
    },
    error: {
      heading: "Something went wrong",
      description:
        "An unexpected error occurred. Try again or return to the home page.",
      goHome: "Go home",
    },
    notFound: {
      tagline: "Some things aren't meant to last forever.",
      home: "HOME",
    },
    leaderboards: {
      heading: "LEADERBOARDS",
      intro:
        "Compete with others and climb the rankings across all game modes on OnThePixel.net.",
      view: "View leaderboard",
      soon: "SOON",
      pixelsTitle: "Pixels",
      pixelsDesc: "The richest players ranked by their total Pixel balance.",
      buildffaTitle: "BuildFFA",
      buildffaDesc:
        "Top builders ranked by kills, deaths, and K/D ratio in the arena.",
      duelsTitle: "Duels",
      duelsDesc: "Best duelists ranked by wins, losses, and K/D ratio.",
      bedwarsTitle: "BedWars",
      bedwarsDesc: "Players ranked by score, kills, and bed destructions.",
      tntrunTitle: "TNTRun",
      tntrunDesc:
        "Players ranked by survival time and scores in TNTRun rounds.",
    },
    leaderboardDuels: {
      heading: "DUELS LEADERBOARD",
      intro:
        "The best duelists on OnThePixel.net, ranked by wins. Challenge yourself to reach the top!",
      title: "Top Duels Players",
      description:
        "Players are ranked based on their total wins in Duels matches.",
      colWins: "Wins",
      colLosses: "Losses",
      colTotalGames: "Total Games",
      colKD: "K/D Ratio",
    },
    leaderboardBuildFFA: {
      heading: "BUILDFFA LEADERBOARD",
      intro: "The top BuildFFA players. Build, fight, and dominate the arena!",
      title: "BuildFFA Champions",
      description:
        "Players are ranked based on their kills, deaths, and overall performance in BuildFFA matches.",
      colKills: "Kills",
      colDeaths: "Deaths",
      colKD: "K/D Ratio",
    },
    leaderboardBedwars: {
      heading: "BEDWARS LEADERBOARD",
      intro:
        "The top BedWars players on OnThePixel.net, ranked by score. Compete with others and reach the top!",
      title: "BedWars Ranking",
      description:
        "Players are ranked based on their overall performance in BedWars matches.",
      colBalance: "Balance",
    },
    leaderboardParkour: {
      heading: "PARKOUR LEADERBOARD",
      intro:
        "The fastest parkour runners on OnThePixel.net. Challenge yourself to beat these records!",
      title: "Parkour Masters",
      description:
        "Players are ranked based on their completion time and course difficulty.",
      colBestTime: "Best Time",
      colCompletions: "Completions",
      colDifficulty: "Highest Diff.",
      colCheckpoints: "Checkpoints",
    },
    leaderboardPixels: {
      heading: "PIXELS LEADERBOARD",
      intro:
        "The richest players on OnThePixel.net. Earn Pixels by playing games and completing challenges!",
      title: "Top 10 Pixel Rankings",
      description:
        "The richest players on OnThePixel.net ranked by their total Pixels.",
      colPixels: "Pixels",
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
      loading: "Lädt...",
      back: "Zurück",
      home: "Startseite",
      learnMore: "Mehr erfahren",
      comingSoon: "Demnächst",
      live: "Live",
      tryAgain: "Erneut versuchen",
    },
    news: {
      heading: "NEUIGKEITEN",
      empty: "Aktuell sind keine Neuigkeiten verfügbar.",
      backToNews: "Zurück zu den Neuigkeiten",
      notFoundTitle: "Neuigkeiten — OnThePixel.net",
      englishOnly: "Dieser Artikel ist nur auf Englisch verfügbar.",
      readInEnglish: "Klicke hier, um ihn auf Englisch zu lesen.",
    },
    error: {
      heading: "Etwas ist schiefgelaufen",
      description:
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut oder kehre zur Startseite zurück.",
      goHome: "Zur Startseite",
    },
    notFound: {
      tagline: "Manche Dinge sind nicht für die Ewigkeit bestimmt.",
      home: "STARTSEITE",
    },
    leaderboards: {
      heading: "BESTENLISTEN",
      intro:
        "Messe dich mit anderen und steige in den Ranglisten aller Spielmodi auf OnThePixel.net auf.",
      view: "Bestenliste ansehen",
      soon: "BALD",
      pixelsTitle: "Pixels",
      pixelsDesc:
        "Die wohlhabendsten Spieler, sortiert nach ihrem gesamten Pixel-Guthaben.",
      buildffaTitle: "BuildFFA",
      buildffaDesc:
        "Top-Builder, sortiert nach Kills, Toden und K/D-Verhältnis in der Arena.",
      duelsTitle: "Duels",
      duelsDesc:
        "Die besten Duellanten, sortiert nach Siegen, Niederlagen und K/D-Verhältnis.",
      bedwarsTitle: "BedWars",
      bedwarsDesc:
        "Spieler, sortiert nach Punkten, Kills und zerstörten Betten.",
      tntrunTitle: "TNTRun",
      tntrunDesc:
        "Spieler, sortiert nach Überlebenszeit und Punkten in TNTRun-Runden.",
    },
    leaderboardDuels: {
      heading: "DUELS-BESTENLISTE",
      intro:
        "Die besten Duellanten auf OnThePixel.net, sortiert nach Siegen. Erreiche die Spitze!",
      title: "Top-Duels-Spieler",
      description:
        "Spieler werden anhand ihrer Gesamtsiege in Duels-Matches sortiert.",
      colWins: "Siege",
      colLosses: "Niederlagen",
      colTotalGames: "Spiele gesamt",
      colKD: "K/D-Verhältnis",
    },
    leaderboardBuildFFA: {
      heading: "BUILDFFA-BESTENLISTE",
      intro:
        "Die besten BuildFFA-Spieler. Bauen, kämpfen und die Arena dominieren!",
      title: "BuildFFA-Champions",
      description:
        "Spieler werden anhand ihrer Kills, Tode und Gesamtleistung in BuildFFA-Matches sortiert.",
      colKills: "Kills",
      colDeaths: "Tode",
      colKD: "K/D-Verhältnis",
    },
    leaderboardBedwars: {
      heading: "BEDWARS-BESTENLISTE",
      intro:
        "Die besten BedWars-Spieler auf OnThePixel.net, sortiert nach Punkten. Messe dich mit anderen und erreiche die Spitze!",
      title: "BedWars-Rangliste",
      description:
        "Spieler werden anhand ihrer Gesamtleistung in BedWars-Matches sortiert.",
      colBalance: "Guthaben",
    },
    leaderboardParkour: {
      heading: "PARKOUR-BESTENLISTE",
      intro:
        "Die schnellsten Parkour-Läufer auf OnThePixel.net. Versuche, diese Rekorde zu brechen!",
      title: "Parkour-Meister",
      description:
        "Spieler werden anhand ihrer Bestzeit und der Schwierigkeit der Strecke sortiert.",
      colBestTime: "Bestzeit",
      colCompletions: "Abschlüsse",
      colDifficulty: "Höchste Schw.",
      colCheckpoints: "Checkpoints",
    },
    leaderboardPixels: {
      heading: "PIXELS-BESTENLISTE",
      intro:
        "Die wohlhabendsten Spieler auf OnThePixel.net. Verdiene Pixels, indem du spielst und Herausforderungen meisterst!",
      title: "Top-10-Pixel-Rangliste",
      description:
        "Die wohlhabendsten Spieler auf OnThePixel.net, sortiert nach ihrem gesamten Pixel-Guthaben.",
      colPixels: "Pixels",
    },
  },
} as const;

export type Translations = (typeof translations)[Locale];
