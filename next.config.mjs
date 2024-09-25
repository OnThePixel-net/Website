/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "minotar.net",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "vzge.me",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/whatsapp",
        destination: "https://whatsapp.com/channel/0029VaA61GG84Om2YFUGV92N",
        permanent: false,
      },
      {
        source: "/twitter",
        destination: "https://x.com/onthepixelnet",
        permanent: false,
      },
      {
        source: "/discord",
        destination: "https://discord.onthepixel.net",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
