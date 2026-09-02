import NextAuth, { DefaultSession } from "next-auth";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import type { JWT } from "next-auth/jwt";
import {
  ADMIN_RECHECK_BACKOFF_MS,
  ADMIN_RECHECK_INTERVAL_MS,
  claimRecheckSlot,
  DISCORD_PROVIDER_ID,
  OIDC_PROVIDER_ID,
  resolveAdminAccess,
  type AdminAccessInput,
} from "@/lib/admin-access";
import {
  DEV_LOGIN_PROVIDER_ID,
  DEV_ROLE_CREDENTIAL,
  findDevRole,
  toSessionRole,
} from "@/lib/dev-auth";
import type { SessionRole } from "@/lib/session-role";
import {
  coercePermissions,
  hasAnyPermission,
  NO_PERMISSIONS,
  type PermissionSet,
} from "@/lib/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      discordId?: string;
      /**
       * Whether this account may use the admin dashboard at all — i.e. whether
       * {@link Session.user.permissions} grants at least one area. Decided once
       * at sign-in (see `src/lib/admin-access.ts`) and always written by the
       * `session` callback below, so `undefined` only ever appears on a token
       * minted before this flag existed — and is treated as "no".
       */
      isAdmin?: boolean;
      /**
       * What this account may do, per dashboard area (`news`, `creators`,
       * `team`, `apply`): 0 none, 1 read, 2 write, 3 delete. Folded from the
       * `Permission-*` claims of every `Team: OTP` group the account is in,
       * highest level per area — or, for the `ADMIN_EMAILS` emergency path, 3
       * everywhere. Always written by the `session` callback, defaulting to
       * "nothing", so a token from before this existed grants nothing.
       */
      permissions?: PermissionSet;
      /**
       * The account's role: its highest-weight `Team: OTP` group in Pocket ID,
       * or the picked stand-in role of a development sign-in. One shape for
       * both paths, so the UI never has to tell them apart. Absent when no
       * role could be determined — including for the `ADMIN_EMAILS` emergency
       * path, which deliberately never asks Pocket ID.
       */
      role?: SessionRole;
    } & DefaultSession["user"];
  }

  interface User {
    discordId?: string;
    isAdmin?: boolean;
    permissions?: PermissionSet;
    role?: SessionRole;
  }
}

const providers: Provider[] = [Discord];

if (
  process.env.OIDC_CLIENT_ID &&
  process.env.OIDC_CLIENT_SECRET &&
  process.env.OIDC_ISSUER
) {
  providers.push({
    id: OIDC_PROVIDER_ID,
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

// Development-only role login. The guard repeats the two conditions of
// `DEV_LOGIN_ENABLED` as literal `process.env` comparisons on purpose: the
// bundler inlines `NODE_ENV`, folds the whole condition to `false` and drops
// this block — including the `Credentials` provider — from a production build,
// which a helper call could not guarantee. `src/lib/dev-auth.ts` additionally
// throws while loading if a production build ever sees `AUTH_DEV_LOGIN`.
if (
  process.env.NODE_ENV !== "production" &&
  process.env.AUTH_DEV_LOGIN === "1"
) {
  providers.push(
    Credentials({
      id: DEV_LOGIN_PROVIDER_ID,
      name: "Development role",
      credentials: {
        [DEV_ROLE_CREDENTIAL]: { label: "Role" },
      },
      authorize(credentials) {
        const role = findDevRole(credentials?.[DEV_ROLE_CREDENTIAL]);
        if (!role) return null;

        return {
          id: `${DEV_LOGIN_PROVIDER_ID}:${role.id}`,
          name: `${role.friendlyName} (dev)`,
          email: `${role.id}@dev.local`,
          discordId: role.discordId,
          role: toSessionRole(role),
          permissions: role.permissions,
        };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers,
  pages: {
    signIn: "/dashboard/login",
  },
  callbacks: {
    /**
     * `account` and `profile` are only present on the sign-in call; every later
     * invocation gets the already-minted token and nothing else. The dashboard
     * authorisation is therefore decided here — once, with the provider's own
     * claims at hand — and carried on the token, instead of being re-derived
     * from Pocket ID on every request. It is re-checked periodically so a
     * removed team member loses access within
     * {@link ADMIN_RECHECK_INTERVAL_MS} rather than at their next sign-in.
     */
    async jwt({ token, account, profile, user }) {
      // Development sign-in: rights and role come from the picked role alone —
      // no env list, no Pocket ID (there is none locally). Only ever reached
      // when the dev provider is registered, which cannot happen in a
      // production build, and the "No team role" option keeps producing a
      // genuinely denied session to test against.
      if (account?.provider === DEV_LOGIN_PROVIDER_ID && user) {
        token.discordId = user.discordId;
        token.role = user.role;
        // Same rule as production: access follows from the levels, so the
        // deliberately right-less dev role still produces a denied session.
        token.permissions = user.permissions ?? NO_PERMISSIONS;
        token.isAdmin = hasAnyPermission(user.permissions);
        token.devLogin = true;
        return token;
      }
      // …and a development session must never be re-checked against Pocket ID
      // either, on any later call.
      if (token.devLogin) return token;

      if (account) {
        if (account.provider === DISCORD_PROVIDER_ID && profile) {
          token.discordId = (profile as { id: string }).id;
        }

        const claims = (profile ?? {}) as Record<string, unknown>;
        const claim = (key: string) =>
          typeof claims[key] === "string" ? (claims[key] as string) : undefined;

        // Remembered so the periodic re-check below can identify the account
        // again without the sign-in claims, which are long gone by then.
        token.authProvider = account.provider;
        // For an OIDC provider `providerAccountId` *is* the `sub` claim; the
        // explicit fallback keeps this working for any provider that fills
        // only one of the two.
        token.subject = account.providerAccountId ?? claim("sub");
        token.username = claim("preferred_username") ?? claim("username");
        if (!token.email) token.email = claim("email") ?? user?.email;

        await applyAdminDecision(token, true);
        return token;
      }

      // No `account`: an ordinary session read. Re-check only when the stored
      // decision has gone stale AND this instance has not just asked Pocket ID
      // about this account (see `claimRecheckSlot`).
      const nextCheckAt =
        typeof token.adminCheckAt === "number" ? token.adminCheckAt : 0;
      if (Date.now() < nextCheckAt) return token;
      if (typeof token.authProvider !== "string") return token;
      if (!claimRecheckSlot(recheckKey(token))) return token;

      await applyAdminDecision(token, false);
      return token;
    },
    session({ session, token }) {
      if (token.discordId) {
        session.user.discordId = token.discordId as string;
      }
      if (token.role) {
        session.user.role = token.role as SessionRole;
      }
      // Both written unconditionally, and both fail-closed: a token from before
      // these existed carries `undefined`, which must come out as "not an
      // admin" / "no rights anywhere" rather than as an "unknown" a caller
      // might misread. `coercePermissions` re-parses each area with the same
      // rule a group claim gets, because what comes back off a JWT is JSON.
      session.user.isAdmin = token.isAdmin === true;
      session.user.permissions = coercePermissions(token.permissions);
      return session;
    },
  },
});

/** Stable per-account key for the in-process re-check throttle. */
function recheckKey(token: JWT): string {
  return `${String(token.authProvider)}:${String(
    token.subject ?? token.discordId ?? token.email ?? token.sub ?? "?",
  )}`;
}

/**
 * Ask Pocket ID whether this account may use the dashboard and write the answer
 * onto the token.
 *
 * `isSignIn` decides what an unreachable Pocket ID means, and the difference
 * matters:
 *  - at sign-in there is no earlier decision, and granting rights that cannot
 *    be proven is precisely the hole this whole change closes → no rights;
 *  - on a re-check the previous decision stands, so an admin already at work is
 *    not thrown out by an upstream hiccup — but the next attempt is scheduled
 *    for {@link ADMIN_RECHECK_BACKOFF_MS} instead of the full interval, so the
 *    stale decision is not trusted a minute longer than necessary.
 */
async function applyAdminDecision(
  token: JWT,
  isSignIn: boolean,
): Promise<void> {
  const input: AdminAccessInput = {
    provider: String(token.authProvider ?? ""),
    discordId:
      typeof token.discordId === "string" ? token.discordId : undefined,
    email: typeof token.email === "string" ? token.email : undefined,
    // After the first successful resolution this is the Pocket ID user id, so
    // later lookups hit the id branch of `matchPocketUser` directly.
    subject: typeof token.subject === "string" ? token.subject : undefined,
    username: typeof token.username === "string" ? token.username : undefined,
  };

  const result = await resolveAdminAccess(input);

  if (result.status === "unavailable") {
    if (isSignIn) {
      token.isAdmin = false;
      token.permissions = NO_PERMISSIONS;
      token.role = undefined;
    }
    token.adminCheckAt = Date.now() + ADMIN_RECHECK_BACKOFF_MS;
    return;
  }

  token.isAdmin = result.isAdmin;
  token.permissions = result.permissions;
  token.role = result.role;
  if (result.pocketUserId) token.subject = result.pocketUserId;
  token.adminCheckAt = Date.now() + ADMIN_RECHECK_INTERVAL_MS;
}
