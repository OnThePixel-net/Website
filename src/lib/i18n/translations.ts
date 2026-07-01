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
      notTranslatedTitle: "Article not available in your language",
      notTranslatedText:
        "This article hasn't been translated yet. Would you like to read the English version?",
      readInEnglishButton: "Read in English",
      goBack: "Go back",
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
    leaderboardTable: {
      colHash: "#",
      colPlayer: "Player",
      empty: "No players found.",
      loadError: "Failed to load leaderboard data. Please try again later.",
    },
    apply: {
      heading: "JOIN OUR TEAM",
      intro:
        "Become part of the OnThePixel.net team! Click on an open position to apply.",
      empty: "No positions available at the moment.",
      open: "OPEN",
      closed: "CLOSED",
      applyNow: "Apply now",
      builderDesc:
        "Create stunning worlds and game maps for our Minecraft server.",
      supporterDesc:
        "Help players with questions, handle support tickets and keep the server friendly.",
      developerDesc:
        "Develop plugins and features for our Minecraft server.",
    },
    applyClosed: {
      backToPositions: "Back to Positions",
      titleSuffix: "Applications Closed",
      message:
        "We're not currently accepting {position} applications. Check back later or follow us on Discord for updates.",
      viewAll: "View All Positions",
    },
    applicationForm: {
      backToPositions: "Back to Positions",
      titleSuffix: "Application",
      intro: "Fill out the form below — we'll get back to you as soon as possible.",
      discordVerified: "Discord verified",
      discordRequired: "Discord login required",
      login: "Login",
      required: "Required",
      securityVerification: "Security Verification",
      submitting: "Submitting...",
      submit: "Submit Application",
      submittedTitle: "Application Submitted!",
      submittedMessage:
        "Thank you for your interest! We'll review your application and get back to you as soon as possible.",
      backToHome: "Back to Home",
      errors: {
        loginRequired: "Please login with Discord first.",
        fillField: "Please fill out: {label}",
        captchaRequired: "Please complete the captcha verification.",
        captchaError: "Captcha error. Please try again.",
        submitFailed: "Failed to submit. Please try again.",
      },
    },
    builderForm: {
      labelUsername: "Minecraft Username",
      placeholderUsername: "Your current IGN",
      labelPortfolio: "Portfolio Links",
      placeholderPortfolio:
        "Links to your builds (PMC, Imgur, Planet Minecraft...)",
      descriptionPortfolio: "Share links where we can see your work",
      labelMotivation: "Why do you want to join?",
      placeholderMotivation:
        "Tell us about yourself and why you want to be part of the team...",
    },
    developerForm: {
      labelUsername: "Minecraft Username",
      placeholderUsername: "Your current IGN",
      labelGithub: "GitHub / Portfolio",
      placeholderGithub: "https://github.com/yourname",
      descriptionGithub:
        "Link to your GitHub profile or any other portfolio",
      labelMotivation: "Why do you want to join?",
      placeholderMotivation:
        "Tell us about your Java/Spigot experience and what you'd like to contribute...",
    },
    supporterForm: {
      labelUsername: "Minecraft Username",
      placeholderUsername: "Your current IGN",
      labelWhy: "Why do you want to be a Supporter?",
      placeholderWhy:
        "Tell us why you'd like to join the support team...",
      labelExperience: "Previous Experience",
      placeholderExperience:
        "Have you been a moderator or supporter before? Describe your experience...",
    },
    discordLogin: {
      backToPositions: "Back to Positions",
      title: "Discord Login Required",
      messageBefore: "To apply as ",
      messageAfter:
        ", you first need to sign in with your Discord account.",
      signIn: "Sign in with Discord",
    },
    headerAuth: {
      logout: "Logout",
      login: "Login",
    },
    redeem: {
      backToHome: "Back to Home",
      title: "Redeem a Code",
      intro: "Enter your code and Minecraft username to claim your reward.",
      discordVerified: "Discord verified",
      discordOptional: "Optional: Link your Discord",
      login: "Login",
      labelCode: "Code",
      placeholderCode: "e.g. PIXEL-XXXX-XXXX",
      labelUsername: "Minecraft Username",
      placeholderUsername: "YourMinecraftName",
      labelSecurity: "Security Verification",
      required: "Required",
      submitting: "Redeeming...",
      submit: "Redeem Code",
      submittedTitle: "Code redeemed successfully!",
      submittedMessage:
        "Your code has been redeemed. The reward will be credited to your account shortly.",
      errors: {
        codeRequired: "Please enter your redemption code.",
        usernameRequired: "Please enter your Minecraft username.",
        captchaRequired: "Please complete the captcha verification.",
        captchaError: "Captcha error. Please try again.",
        submitFailed: "Failed to redeem. Please try again.",
      },
    },
    sidequests: {
      heading: "OUR SIDE QUESTS",
      intro:
        "Explore the exciting projects and initiatives that power OnThePixel.net. From cutting-edge security solutions to performance optimizations, discover the technology that makes our server exceptional.",
      empty: "No side quests found.",
      technologies: "Technologies:",
      viewProject: "View Project",
      contributeTitle: "Want to Contribute?",
      contributeText:
        "Are you a talented developer interested in contributing to OnThePixel's projects? We're always looking for passionate individuals to join our development team. Apply now and become part of the team!",
      applyNow: "Apply Now",
      statusCompleted: "Completed",
      statusInProgress: "In Progress",
      statusPlanned: "Planned",
    },
    team: {
      heading: "TEAM",
      empty: "No team members available.",
      memberFallback: "MEMBER",
      joinTitle: "Want to join the team?",
      joinText:
        "We're always looking for passionate people to help build OnThePixel.net.",
      applyNow: "Apply now",
    },
    creators: {
      heading: "CREATORS",
      liveNow: "LIVE NOW",
      live: "LIVE",
      watching: "watching",
      watchStream: "Watch Stream",
      allCreators: "ALL CREATORS",
      creatorRole: "CREATOR",
      followers: "Followers",
      empty: "No creators available.",
      onPlatform: "{name} on {platform}",
    },
    playerStatistics: {
      heading: "STATISTICS",
      intro: "Search for any player on OnThePixel.net",
      placeholder: "Minecraft username...",
      search: "Search",
      genericError: "Something went wrong. Please try again.",
      notFoundTitle: "Player not found",
      notFoundText:
        "{name} has never played on OnThePixel.net, or the username is incorrect.",
      emptyTitle: "Search for a player",
      emptyText: "Enter a Minecraft username above to see their stats",
      memberFallback: "Member",
      firstJoined: "First joined",
      lastOnline: "Last online",
      playtime: "Playtime",
      balance: "Balance",
      bedwarsTitle: "BedWars",
      duelsTitle: "Duels",
      tntrunTitle: "TNT Run",
      buildffaTitle: "BuildFFA",
      comingSoonBadge: "Coming Soon",
      comingSoonText: "Statistics not yet available",
      elo: "ELO",
      wins: "Wins",
      losses: "Losses",
      gamesPlayed: "Games Played",
      winRate: "Win Rate",
      kdRatio: "K/D Ratio",
      winStreak: "Win Streak",
      kills: "Kills",
      deaths: "Deaths",
      viewAllKits: "View all {count} kits",
    },
    cookieConsent: {
      title: "Cookie Consent",
      paragraph1:
        "OnThePixel.net uses cookies and similar technologies to enhance your browsing experience, analyze site traffic, and provide personalized content.",
      paragraph2:
        'By clicking "Accept All", you consent to the use of cookies on our website. You can change your preferences at any time by clicking "Customize" or manage your preferences in your browser settings.',
      decline: "Decline",
      customize: "Customize",
      acceptAll: "Accept All",
    },
    cookieSettings: {
      title: "Cookie Settings",
      description: "Manage your cookie preferences",
      essentialLabel: "Essential Cookies",
      essentialDesc:
        "Required for the website to function properly. Cannot be disabled.",
      analyticsLabel: "Analytics Cookies",
      analyticsDesc:
        "Help us understand how visitors interact with our website.",
      youtubeLabel: "YouTube & Embedded Media",
      youtubeDesc:
        "Required to play embedded YouTube videos. Google/YouTube may set cookies and track your usage.",
      twitchLabel: "Twitch Live Streams",
      twitchDesc:
        "Required to display embedded Twitch streams on the Creators page. Twitch/Amazon may set cookies and track your usage.",
      howWeUseTitle: "How we use cookies",
      howWeUseText:
        "OnThePixel.net uses cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. We use Vercel Analytics to collect information about how visitors use our website. This data is anonymized and helps us improve our services.",
      reset: "Reset Preferences",
      cancel: "Cancel",
      save: "Save Preferences",
      buttonLabel: "Cookie Settings",
      alwaysActive: "Always Active",
    },
    youtubeEmbed: {
      title: "YouTube Video",
      description:
        "To play this video, YouTube cookies will be set. Google may track your usage across sites.",
      accept: "Load video & accept cookies",
      learnMore: "Learn more in our Privacy Policy",
    },
    twitchEmbed: {
      title: "Twitch Live Stream",
      description:
        "To show this stream, Twitch cookies will be set. Amazon/Twitch may track your usage across sites.",
      accept: "Load stream & accept cookies",
      learnMore: "Learn more in our Privacy Policy",
    },
    playercount: {
      online: "Online players",
    },
    duelsKits: {
      back: "Back to {name}'s Stats",
      headingSuffix: "DUELS",
      kitsPlayed: "{count} kits played",
      totalGames: "{count} total games",
      elo: "ELO",
      winRate: "Win Rate",
      winsLosses: "Wins / Losses",
      bestStreak: "Best Streak",
      kits: "KITS",
      notYetPlayed: "NOT YET PLAYED",
      bestStreakLine: "Best streak: {value}",
      games: "games",
      noGamesYet: "No games yet",
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
      notTranslatedTitle: "Artikel in deiner Sprache nicht verfügbar",
      notTranslatedText:
        "Dieser Artikel wurde noch nicht übersetzt. Möchtest du die englische Version lesen?",
      readInEnglishButton: "Auf Englisch lesen",
      goBack: "Zurück",
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
    leaderboardTable: {
      colHash: "#",
      colPlayer: "Spieler",
      empty: "Keine Spieler gefunden.",
      loadError:
        "Bestenliste konnte nicht geladen werden. Bitte versuche es später erneut.",
    },
    apply: {
      heading: "WERDE TEIL DES TEAMS",
      intro:
        "Werde Teil des OnThePixel.net-Teams! Klicke auf eine offene Position, um dich zu bewerben.",
      empty: "Aktuell sind keine Stellen verfügbar.",
      open: "OFFEN",
      closed: "GESCHLOSSEN",
      applyNow: "Jetzt bewerben",
      builderDesc:
        "Erschaffe beeindruckende Welten und Spielkarten für unseren Minecraft-Server.",
      supporterDesc:
        "Hilf Spielern bei Fragen, bearbeite Support-Tickets und sorge für eine freundliche Atmosphäre auf dem Server.",
      developerDesc:
        "Entwickle Plugins und Funktionen für unseren Minecraft-Server.",
    },
    applyClosed: {
      backToPositions: "Zurück zu den Positionen",
      titleSuffix: "Bewerbungen geschlossen",
      message:
        "Wir nehmen aktuell keine Bewerbungen für die Position {position} an. Schaue später noch einmal vorbei oder folge uns auf Discord für Neuigkeiten.",
      viewAll: "Alle Positionen ansehen",
    },
    applicationForm: {
      backToPositions: "Zurück zu den Positionen",
      titleSuffix: "Bewerbung",
      intro:
        "Fülle das Formular unten aus — wir melden uns so schnell wie möglich bei dir.",
      discordVerified: "Discord verifiziert",
      discordRequired: "Discord-Anmeldung erforderlich",
      login: "Anmelden",
      required: "Pflichtfeld",
      securityVerification: "Sicherheitsüberprüfung",
      submitting: "Wird gesendet...",
      submit: "Bewerbung absenden",
      submittedTitle: "Bewerbung gesendet!",
      submittedMessage:
        "Vielen Dank für dein Interesse! Wir prüfen deine Bewerbung und melden uns so schnell wie möglich bei dir.",
      backToHome: "Zurück zur Startseite",
      errors: {
        loginRequired: "Bitte melde dich zuerst mit Discord an.",
        fillField: "Bitte fülle das Feld aus: {label}",
        captchaRequired: "Bitte schließe die Captcha-Überprüfung ab.",
        captchaError: "Captcha-Fehler. Bitte versuche es erneut.",
        submitFailed:
          "Senden fehlgeschlagen. Bitte versuche es erneut.",
      },
    },
    builderForm: {
      labelUsername: "Minecraft-Benutzername",
      placeholderUsername: "Dein aktueller Benutzername",
      labelPortfolio: "Portfolio-Links",
      placeholderPortfolio:
        "Links zu deinen Bauten (PMC, Imgur, Planet Minecraft...)",
      descriptionPortfolio: "Teile Links, unter denen wir deine Arbeit ansehen können",
      labelMotivation: "Warum möchtest du beitreten?",
      placeholderMotivation:
        "Erzähle uns etwas über dich und warum du Teil des Teams werden möchtest...",
    },
    developerForm: {
      labelUsername: "Minecraft-Benutzername",
      placeholderUsername: "Dein aktueller Benutzername",
      labelGithub: "GitHub / Portfolio",
      placeholderGithub: "https://github.com/deinname",
      descriptionGithub:
        "Link zu deinem GitHub-Profil oder einem anderen Portfolio",
      labelMotivation: "Warum möchtest du beitreten?",
      placeholderMotivation:
        "Erzähle uns von deiner Erfahrung mit Java/Spigot und was du beitragen möchtest...",
    },
    supporterForm: {
      labelUsername: "Minecraft-Benutzername",
      placeholderUsername: "Dein aktueller Benutzername",
      labelWhy: "Warum möchtest du Supporter werden?",
      placeholderWhy:
        "Erzähle uns, warum du dem Support-Team beitreten möchtest...",
      labelExperience: "Bisherige Erfahrung",
      placeholderExperience:
        "Warst du bereits Moderator oder Supporter? Beschreibe deine Erfahrung...",
    },
    discordLogin: {
      backToPositions: "Zurück zu den Positionen",
      title: "Discord-Anmeldung erforderlich",
      messageBefore: "Um dich als ",
      messageAfter:
        " zu bewerben, musst du dich zuerst mit deinem Discord-Konto anmelden.",
      signIn: "Mit Discord anmelden",
    },
    headerAuth: {
      logout: "Abmelden",
      login: "Anmelden",
    },
    redeem: {
      backToHome: "Zurück zur Startseite",
      title: "Code einlösen",
      intro:
        "Gib deinen Code und deinen Minecraft-Benutzernamen ein, um deine Belohnung zu erhalten.",
      discordVerified: "Discord verifiziert",
      discordOptional: "Optional: Discord verknüpfen",
      login: "Anmelden",
      labelCode: "Code",
      placeholderCode: "z. B. PIXEL-XXXX-XXXX",
      labelUsername: "Minecraft-Benutzername",
      placeholderUsername: "DeinMinecraftName",
      labelSecurity: "Sicherheitsüberprüfung",
      required: "Pflichtfeld",
      submitting: "Wird eingelöst...",
      submit: "Code einlösen",
      submittedTitle: "Code erfolgreich eingelöst!",
      submittedMessage:
        "Dein Code wurde eingelöst. Die Belohnung wird in Kürze deinem Konto gutgeschrieben.",
      errors: {
        codeRequired: "Bitte gib deinen Einlösecode ein.",
        usernameRequired: "Bitte gib deinen Minecraft-Benutzernamen ein.",
        captchaRequired: "Bitte schließe die Captcha-Überprüfung ab.",
        captchaError: "Captcha-Fehler. Bitte versuche es erneut.",
        submitFailed:
          "Einlösen fehlgeschlagen. Bitte versuche es erneut.",
      },
    },
    sidequests: {
      heading: "UNSERE SIDE QUESTS",
      intro:
        "Entdecke die spannenden Projekte und Initiativen hinter OnThePixel.net. Von modernen Sicherheitslösungen bis zu Performance-Optimierungen — sieh dir die Technik an, die unseren Server besonders macht.",
      empty: "Keine Side Quests gefunden.",
      technologies: "Technologien:",
      viewProject: "Projekt ansehen",
      contributeTitle: "Möchtest du mitwirken?",
      contributeText:
        "Bist du eine talentierte Entwicklerin oder ein talentierter Entwickler und möchtest zu den Projekten von OnThePixel beitragen? Wir sind immer auf der Suche nach engagierten Personen für unser Entwicklerteam. Bewirb dich jetzt und werde Teil des Teams!",
      applyNow: "Jetzt bewerben",
      statusCompleted: "Abgeschlossen",
      statusInProgress: "In Bearbeitung",
      statusPlanned: "Geplant",
    },
    team: {
      heading: "TEAM",
      empty: "Aktuell sind keine Teammitglieder verfügbar.",
      memberFallback: "MITGLIED",
      joinTitle: "Möchtest du dem Team beitreten?",
      joinText:
        "Wir sind immer auf der Suche nach engagierten Menschen, die OnThePixel.net mitgestalten möchten.",
      applyNow: "Jetzt bewerben",
    },
    creators: {
      heading: "CREATORS",
      liveNow: "JETZT LIVE",
      live: "LIVE",
      watching: "Zuschauer",
      watchStream: "Stream ansehen",
      allCreators: "ALLE CREATORS",
      creatorRole: "CREATOR",
      followers: "Follower",
      empty: "Aktuell sind keine Creators verfügbar.",
      onPlatform: "{name} auf {platform}",
    },
    playerStatistics: {
      heading: "STATISTIKEN",
      intro: "Suche nach einem beliebigen Spieler auf OnThePixel.net",
      placeholder: "Minecraft-Benutzername...",
      search: "Suchen",
      genericError:
        "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
      notFoundTitle: "Spieler nicht gefunden",
      notFoundText:
        "{name} hat noch nie auf OnThePixel.net gespielt oder der Benutzername ist falsch.",
      emptyTitle: "Suche nach einem Spieler",
      emptyText:
        "Gib oben einen Minecraft-Benutzernamen ein, um die Statistiken zu sehen",
      memberFallback: "Mitglied",
      firstJoined: "Erstmals beigetreten",
      lastOnline: "Zuletzt online",
      playtime: "Spielzeit",
      balance: "Guthaben",
      bedwarsTitle: "BedWars",
      duelsTitle: "Duels",
      tntrunTitle: "TNT Run",
      buildffaTitle: "BuildFFA",
      comingSoonBadge: "Demnächst",
      comingSoonText: "Statistiken sind noch nicht verfügbar",
      elo: "ELO",
      wins: "Siege",
      losses: "Niederlagen",
      gamesPlayed: "Gespielte Spiele",
      winRate: "Siegquote",
      kdRatio: "K/D-Verhältnis",
      winStreak: "Siegesserie",
      kills: "Kills",
      deaths: "Tode",
      viewAllKits: "Alle {count} Kits ansehen",
    },
    cookieConsent: {
      title: "Cookie-Hinweis",
      paragraph1:
        "OnThePixel.net verwendet Cookies und ähnliche Technologien, um dein Surferlebnis zu verbessern, den Datenverkehr zu analysieren und personalisierte Inhalte bereitzustellen.",
      paragraph2:
        'Mit einem Klick auf „Alle akzeptieren" stimmst du der Verwendung von Cookies auf unserer Website zu. Du kannst deine Einstellungen jederzeit über „Anpassen" ändern oder in deinen Browser-Einstellungen verwalten.',
      decline: "Ablehnen",
      customize: "Anpassen",
      acceptAll: "Alle akzeptieren",
    },
    cookieSettings: {
      title: "Cookie-Einstellungen",
      description: "Verwalte deine Cookie-Einstellungen",
      essentialLabel: "Essentielle Cookies",
      essentialDesc:
        "Erforderlich, damit die Website ordnungsgemäß funktioniert. Können nicht deaktiviert werden.",
      analyticsLabel: "Analyse-Cookies",
      analyticsDesc:
        "Helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.",
      youtubeLabel: "YouTube & Eingebettete Medien",
      youtubeDesc:
        "Erforderlich zum Abspielen eingebetteter YouTube-Videos. Google/YouTube kann dabei Cookies setzen und dein Nutzungsverhalten verfolgen.",
      twitchLabel: "Twitch Live-Streams",
      twitchDesc:
        "Erforderlich zur Anzeige eingebetteter Twitch-Streams auf der Creators-Seite. Twitch/Amazon kann dabei Cookies setzen und dein Nutzungsverhalten verfolgen.",
      howWeUseTitle: "Wie wir Cookies verwenden",
      howWeUseText:
        "OnThePixel.net verwendet Cookies, um dein Erlebnis zu verbessern, die Website-Nutzung zu analysieren und unsere Marketing-Aktivitäten zu unterstützen. Wir nutzen Vercel Analytics, um Informationen darüber zu erfassen, wie Besucher unsere Website nutzen. Diese Daten werden anonymisiert und helfen uns, unseren Service zu verbessern.",
      reset: "Einstellungen zurücksetzen",
      cancel: "Abbrechen",
      save: "Einstellungen speichern",
      buttonLabel: "Cookie-Einstellungen",
      alwaysActive: "Immer aktiv",
    },
    youtubeEmbed: {
      title: "YouTube-Video",
      description:
        "Zum Abspielen dieses Videos werden YouTube-Cookies gesetzt. Google kann dein Nutzungsverhalten seitenübergreifend verfolgen.",
      accept: "Video laden & Cookies akzeptieren",
      learnMore: "Mehr in unserer Datenschutzerklärung",
    },
    twitchEmbed: {
      title: "Twitch Live-Stream",
      description:
        "Zur Anzeige dieses Streams werden Twitch-Cookies gesetzt. Amazon/Twitch kann dein Nutzungsverhalten seitenübergreifend verfolgen.",
      accept: "Stream laden & Cookies akzeptieren",
      learnMore: "Mehr in unserer Datenschutzerklärung",
    },
    playercount: {
      online: "Spieler online",
    },
    duelsKits: {
      back: "Zurück zu den Stats von {name}",
      headingSuffix: "DUELS",
      kitsPlayed: "{count} Kits gespielt",
      totalGames: "{count} Spiele insgesamt",
      elo: "ELO",
      winRate: "Siegquote",
      winsLosses: "Siege / Niederlagen",
      bestStreak: "Beste Serie",
      kits: "KITS",
      notYetPlayed: "NOCH NICHT GESPIELT",
      bestStreakLine: "Beste Serie: {value}",
      games: "Spiele",
      noGamesYet: "Noch keine Spiele",
    },
  },
} as const;

export type Translations = (typeof translations)[Locale];
