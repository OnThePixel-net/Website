export const navLinks = [
  { href: "/", title: "Home" },
  { href: "/team", title: "Team" },
  { href: "/leaderboard", title: "Leaderboard" },
  { href: "/dashboard", title: "Dashboard", requiresAuth: true },
];

export const dashboardLinks = [
  { href: "/account", title: "Account" },
  { href: "/account/settings", title: "Settings" },
  { href: "/account/billing", title: "Billing" },
  { href: "/support", title: "Support" },
  { href: "/support/contact", title: "Contact" },
];

export const footerLinks = [
  {
    group: "social",
    links: [
      {
        href: "https://discord.onthepixel.net/",
        title: "Discord",
        icon: "FaDiscord",
      },
      {
        href: "https://twitter.com/@onthepixelnet",
        title: "Twitter",
        in: "FaTwitter",
      },
      {
        href: "https://youtube.com/@thebestminecraftserver",
        title: "YouTube",
        icon: "FaYoutube",
      },
    ],
  },
  {
    group: "navigation",
    links: [
      { href: "/", title: "Home" },
      { href: "/shop", title: "Shop" },
      { href: "/team", title: "Team" },
      { href: "/leaderboard", title: "Leaderboard" },
      { href: "/impressum", title: "Impressum" },
    ],
  },
  {
    group: "resources",
    links: [
      { href: "/resources/docs", title: "Documentation" },
      { href: "/resources/tutorials", title: "Tutorials" },
      { href: "/resources/blog", title: "Blog" },
    ],
  },
];
