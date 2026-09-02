// English dictionary. Loaded on the server only (see ./index.ts); the active
// locale is handed to the client through <LanguageProvider dictionary={...}>,
// so no client bundle ever contains both languages.
export const en = {
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
    sectionGames: "Games",
    bedWars: "BedWars",
    buildFFA: "BuildFFA",
    tntRun: "TNT Run",
    sideQuests: "Sidequests",
    sectionResources: "Resources",
    leaderboard: "Leaderboard",
    statistics: "Statistics",
    status: "Status",
    api: "API",
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
    developerDesc: "Develop plugins and features for our Minecraft server.",
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
    intro:
      "Fill out the form below — we'll get back to you as soon as possible.",
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
    descriptionGithub: "Link to your GitHub profile or any other portfolio",
    labelMotivation: "Why do you want to join?",
    placeholderMotivation:
      "Tell us about your Java/Spigot experience and what you'd like to contribute...",
  },
  supporterForm: {
    labelUsername: "Minecraft Username",
    placeholderUsername: "Your current IGN",
    labelWhy: "Why do you want to be a Supporter?",
    placeholderWhy: "Tell us why you'd like to join the support team...",
    labelExperience: "Previous Experience",
    placeholderExperience:
      "Have you been a moderator or supporter before? Describe your experience...",
  },
  discordLogin: {
    backToPositions: "Back to Positions",
    title: "Discord Login Required",
    messageBefore: "To apply as ",
    messageAfter: ", you first need to sign in with your Discord account.",
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
  apiDocs: {
    metaTitle: "API Documentation",
    metaDescription:
      "Public read-only REST API of OnThePixel.net — news, creators and open positions as JSON. No authentication required, CORS open to everyone.",
    heading: "API DOCUMENTATION",
    intro:
      "OnThePixel.net exposes a small read-only REST API. It serves the news, the creators and the open positions you can also see on this website, and it is open to anyone who wants to display that data somewhere else. Every endpoint answers with JSON and only supports GET, plus OPTIONS for CORS preflight requests.",
    overview: {
      heading: "Getting started",
      baseUrlLabel: "Base URL",
      authHeading: "Authentication",
      authText:
        "None. Every endpoint on this page is public and read-only — there is no API key, no token and no account you have to sign up for.",
      corsHeading: "CORS",
      corsText:
        "All responses are sent with the header Access-Control-Allow-Origin: *, so the API can be called straight from a browser. Preflight requests are answered by OPTIONS with 204 No Content.",
      fairUseHeading: "Fair use",
      fairUseText:
        "There is no hard rate limit, and we would like to keep it that way. Please keep your request rate moderate and cache the responses on your side — the Cache-Control header of each endpoint is a good hint at how often the data actually changes.",
      errorsHeading: "Errors",
      errorsText:
        "Errors use the same envelope everywhere: a single error property holding a message, sent with the status code listed for the endpoint.",
    },
    labels: {
      parameters: "Query parameters",
      exampleRequest: "Example request",
      exampleResponse: "Example response",
      single: "Single item",
      statusCodes: "Status codes",
      caching: "Caching and headers",
      colParameter: "Parameter",
      colType: "Type",
      colDefault: "Default",
      colDescription: "Description",
      colStatus: "Status",
      colMeaning: "Meaning",
      none: "none",
    },
    news: {
      heading: "News",
      description:
        "Returns the published news articles, newest first by publication date. Each article carries its base text plus a translations object keyed by language code (for example de) with the translated title, short description and content.",
      paramLimit:
        "Maximum number of articles to return. Values above 100 are capped at 100.",
      paramOffset:
        "Number of articles to skip, for paging through the list.",
      paramSlug:
        "Return a single article by its slug instead of a list. limit and offset are ignored in that case.",
      singleText:
        "With slug the response holds a single object instead of an array, and no meta block.",
      status200: "Success.",
      status404: "Only with slug: no article exists for that slug.",
      status500: "Unexpected error while reading the data.",
      caching:
        "The list response is sent with Cache-Control: public, s-maxage=30, stale-while-revalidate=120. The single-article response is sent without a Cache-Control header. Every response, errors included, carries Access-Control-Allow-Origin: *.",
    },
    creators: {
      heading: "Creators",
      description:
        "Returns the community creators featured on the site, in the same order they are shown there, each with their Minecraft UUID and their channel links. By default the payload keeps the field names of the legacy CMS so existing consumers keep working.",
      paramLimit:
        "Maximum number of creators to return. Values above 200 are capped at 200. Ignored when uuid or name is set.",
      paramOffset:
        "Number of creators to skip. Ignored when uuid or name is set.",
      paramUuid:
        "Return a single creator by Minecraft UUID. Accepted with or without dashes.",
      paramName:
        "Return a single creator by name, matched case-insensitively.",
      paramFormat:
        "Set to raw to receive the internal shape (id, name, minecraftUuid, sortOrder, channels) instead of the default CMS shape.",
      fieldsText:
        "Minecraft_username holds the creator's Minecraft UUID — the avatar services used on this site accept it in place of a name. Icons is the platform key; the keys used by the site are youtube, twitch, tiktok, instagram, x_twitter, discord, whatsapp and website.",
      rawHeading: "Raw format",
      rawText:
        "With format=raw the same creators are returned in the shape they are stored in:",
      singleText:
        "With uuid or name the response holds a single object instead of an array, and no meta block. format=raw applies here as well.",
      status200: "Success.",
      status404:
        "Only with uuid or name: no creator matched. A uuid that is not a valid Minecraft UUID matches nothing and returns 404 as well.",
      status500: "Unexpected error while reading the data.",
      caching:
        "Successful responses are sent with Cache-Control: public, s-maxage=60, stale-while-revalidate=300. Every response, errors included, carries Access-Control-Allow-Origin: *.",
    },
    apply: {
      heading: "Open positions",
      description:
        "Returns the positions you can apply for, in the order the apply page shows them, together with their current status. status is either open or closed.",
      paramSlug:
        "Return a single position by its slug, matched case-insensitively.",
      singleText:
        "With slug the response holds a single object instead of an array.",
      status200: "Success.",
      status404: "Only with slug: no position exists for that slug.",
      status500: "Unexpected error while reading the data.",
      caching:
        "Successful responses are sent with Cache-Control: public, s-maxage=30, stale-while-revalidate=120. Every response, errors included, carries Access-Control-Allow-Origin: *.",
      note: "This endpoint only reports which positions are currently open. Submitting an application is not part of the public API — that happens through the apply pages on this website and requires a signed-in Discord account.",
    },
  },
} as const;
