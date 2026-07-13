import NextAuth, { DefaultSession } from "next-auth";
import Discord from "next-auth/providers/discord";
import type { Provider } from "next-auth/providers";

declare module "next-auth" {
  interface Session {
    user: {
      discordId?: string;
    } & DefaultSession["user"];
  }
}

const providers: Provider[] = [Discord];

if (
  process.env.OIDC_CLIENT_ID &&
  process.env.OIDC_CLIENT_SECRET &&
  process.env.OIDC_ISSUER
) {
  providers.push({
    id: "oidc",
    name: process.env.OIDC_PROVIDER_NAME ?? "SSO",
    type: "oidc",
    issuer: process.env.OIDC_ISSUER,
    clientId: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    // Explicitly send all three checks. Without this, the custom provider
    // falls back to "pkce" only, so the authorize URL omits `state` and
    // `nonce` and Pocket ID rejects the request with `invalid_state`.
    checks: ["pkce", "state", "nonce"],
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers,
  pages: {
    signIn: "/dashboard/login",
  },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account?.provider === "discord" && profile) {
        token.discordId = (profile as { id: string }).id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.discordId) {
        session.user.discordId = token.discordId as string;
      }
      return session;
    },
  },
});
