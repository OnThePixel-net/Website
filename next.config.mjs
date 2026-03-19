/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    loader: "imgix",
    path: "https://cdn.deinedomain.de/",
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
