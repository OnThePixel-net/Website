/**
 * Local development sign-in.
 *
 * Lets a developer open the dashboard by picking a role instead of running a
 * full Discord / Pocket ID round trip. It is a development tool only, so it is
 * fenced off by several independent barriers:
 *
 *  1. {@link DEV_LOGIN_ENABLED} requires BOTH a non-production build and an
 *     explicit `AUTH_DEV_LOGIN=1` opt-in. Either condition alone is never
 *     enough — a stray env variable or a stray `NODE_ENV` cannot open it.
 *  2. If a production build is nevertheless started with `AUTH_DEV_LOGIN` set,
 *     this module throws while loading and takes the process down with it. A
 *     silent fallback would leave a misconfigured production quietly wide open;
 *     failing loudly is the whole point.
 *  3. {@link DEV_ROLES} is built behind a literal `process.env.NODE_ENV`
 *     comparison. Bundlers inline that value and fold the branch away, so the
 *     role list is not part of a production build at all.
 *
 * There is no Pocket ID instance locally, so the roles below are a static
 * stand-in modelled on the `Team: OTP` groups the team management works with
 * (`friendlyName` / `weight` / `prefix`, see `src/lib/pocketid.ts`) and on the
 * application positions seeded in `src/lib/db/migrate.ts`.
 */

import { prefixColor } from "@/lib/pocketid";
import type { SessionRole } from "@/lib/session-role";
import {
  LEVEL_DELETE,
  NO_PERMISSIONS,
  LEVEL_NONE,
  LEVEL_READ,
  LEVEL_WRITE,
  uniformPermissions,
  type PermissionSet,
} from "@/lib/permissions";

/** Provider id of the development credentials provider. */
export const DEV_LOGIN_PROVIDER_ID = "dev-role";

/** Name of the credential field carrying the picked role id. */
export const DEV_ROLE_CREDENTIAL = "role";

// Barrier 2: a production deployment that still carries `AUTH_DEV_LOGIN` is a
// misconfiguration, not something to paper over. Throwing at module load makes
// it fail on startup instead of silently shipping a password-less login.
if (process.env.NODE_ENV === "production" && process.env.AUTH_DEV_LOGIN) {
  throw new Error(
    "AUTH_DEV_LOGIN is set in a production environment. The development role " +
      "login must never be reachable in production — unset AUTH_DEV_LOGIN.",
  );
}

/**
 * Barrier 1: both conditions must hold. Written as literal `process.env`
 * comparisons (instead of being derived from a helper) so the bundler can fold
 * the expression to `false` in a production build and drop everything guarded
 * by it. This must never be exposed through a `NEXT_PUBLIC_` variable: those
 * are baked into the client bundle at build time and would turn a local
 * configuration mistake into a production one.
 */
export const DEV_LOGIN_ENABLED =
  process.env.NODE_ENV !== "production" && process.env.AUTH_DEV_LOGIN === "1";

/** A role that can be picked on the local login page. */
export interface DevRole {
  /** Stable id — also the credential value posted by the login page. */
  id: string;
  /** Display label, mirrors a Pocket ID group's `friendlyName`. */
  friendlyName: string;
  /** Minecraft-style prefix; `prefixColor()` derives the display colour. */
  prefix: string;
  /** Group weight — the highest one wins as a member's primary rank. */
  weight: number;
  /** Short hint shown next to the role in the picker. */
  description: string;
  /** Whether the role stands for a member of a `Team: OTP` group. */
  teamMember: boolean;
  /**
   * The per-area levels this stand-in grants, mirroring the `Permission-*`
   * claims a real Pocket ID group carries. The list below deliberately spreads
   * these out — full rights, partial rights, read-only and none at all — so the
   * whole ladder can be clicked through locally without a Pocket ID.
   */
  permissions: PermissionSet;
  /** Stand-in Discord id, so the session looks like a real one. */
  discordId: string;
}

/**
 * The static role list. The array literal sits behind a literal `NODE_ENV`
 * check so it is dropped from a production build entirely — see barrier 3.
 */
export const DEV_ROLES: readonly DevRole[] =
  process.env.NODE_ENV === "production"
    ? []
    : [
        {
          id: "admin",
          friendlyName: "Admin",
          prefix: "&c[Admin] ",
          weight: 100,
          description: "Alle Bereiche, inkl. Löschen",
          teamMember: true,
          discordId: "900000000000000001",
          permissions: uniformPermissions(LEVEL_DELETE),
        },
        {
          id: "developer",
          friendlyName: "Java Developer",
          prefix: "&b[Dev] ",
          weight: 80,
          description: "News/Creators voll, Team nur lesen",
          teamMember: true,
          discordId: "900000000000000002",
          permissions: {
            news: LEVEL_DELETE,
            creators: LEVEL_DELETE,
            team: LEVEL_READ,
            apply: LEVEL_WRITE,
          },
        },
        {
          id: "builder",
          friendlyName: "Builder",
          prefix: "&a[Builder] ",
          weight: 60,
          description: "Überall nur lesen",
          teamMember: true,
          discordId: "900000000000000003",
          permissions: {
            news: LEVEL_READ,
            creators: LEVEL_READ,
            team: LEVEL_READ,
            apply: LEVEL_READ,
          },
        },
        {
          id: "supporter",
          friendlyName: "Supporter",
          prefix: "&e[Supporter] ",
          weight: 40,
          description: "Bewerbungen schreiben, News lesen",
          teamMember: true,
          discordId: "900000000000000004",
          permissions: {
            news: LEVEL_READ,
            creators: LEVEL_NONE,
            team: LEVEL_NONE,
            apply: LEVEL_WRITE,
          },
        },
        {
          // The rank the whole per-area model exists for: writes articles,
          // must never touch the team roster. Everything outside news is 0, so
          // its navigation shows a single entry and the other three areas do
          // not exist for it at all.
          id: "editor",
          friendlyName: "Redakteur",
          prefix: "&d[Redaktion] ",
          weight: 30,
          description: "Nur News, schreiben ohne löschen",
          teamMember: true,
          discordId: "900000000000000006",
          permissions: {
            news: LEVEL_WRITE,
            creators: LEVEL_NONE,
            team: LEVEL_NONE,
            apply: LEVEL_NONE,
          },
        },
        {
          id: "outsider",
          friendlyName: "No team role",
          prefix: "&7",
          weight: 0,
          description: "Kein Zugriff — zeigt „Access Denied“",
          teamMember: false,
          discordId: "900000000000000005",
          permissions: NO_PERMISSIONS,
        },
      ];

/**
 * Reduce a role to the {@link SessionRole} the session carries.
 *
 * Same shape the production path produces from a Pocket ID group, so a locally
 * signed-in developer sees exactly what a real team member sees — including
 * `weight` and the colour derived from the Minecraft-style prefix. That is the
 * whole point of the dev roles mirroring the `Team: OTP` group fields.
 */
export function toSessionRole(role: DevRole): SessionRole {
  return {
    id: role.id,
    friendlyName: role.friendlyName,
    weight: role.weight,
    color: prefixColor(role.prefix),
    teamMember: role.teamMember,
  };
}

/**
 * Look up a role by the id posted from the login page. Returns `undefined` for
 * anything unknown — in a production build `DEV_ROLES` is empty, so this can
 * only ever return `undefined` there.
 */
export function findDevRole(id: unknown): DevRole | undefined {
  if (typeof id !== "string") return undefined;
  return DEV_ROLES.find((role) => role.id === id);
}
