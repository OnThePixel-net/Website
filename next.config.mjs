/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  trailingSlash: true,
  // Keep trailing-slash canonicalisation for pages, but suppress Next's
  // automatic 308 redirect. Otherwise /api/auth/callback/oidc is redirected
  // to /api/auth/callback/oidc/, which does not match the redirect URI
  // registered at the OIDC provider (Pocket ID) and breaks the callback.
  //
  // Because that switch is global, it would also leave /about and /about/
  // both answering 200 (duplicate content). The redirect is therefore
  // reimplemented in src/proxy.ts, where it can be limited to pages and
  // skip /api/* and static files entirely. Do not remove it here without
  // removing it there too.
  skipTrailingSlashRedirect: true,
  images: {
    loader: "imgix",
    path: "https://cdn.onthepixel.net/",
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
