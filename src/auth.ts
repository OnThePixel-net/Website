import NextAuth, { DefaultSession } from "next-auth";
import Discord from "next-auth/providers/discord";

declare module "next-auth" {
  interface Session {
    user: {
      discordId?: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Discord],
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
