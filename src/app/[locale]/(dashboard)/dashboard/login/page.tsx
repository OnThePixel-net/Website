import React from "react";
import type { Metadata } from "next";
import { DEV_LOGIN_ENABLED, DEV_ROLES } from "@/lib/dev-auth";
import { compareRanked, prefixColor } from "@/lib/pocketid";
import LoginClient, { type DevRoleOption } from "./login-client";

export const metadata: Metadata = {
  title: "Sign In – Admin Dashboard",
  robots: { index: false },
};

/**
 * Whether the development role picker may render is decided here, on the
 * server: this page is a Server Component and can read the plain (non-public)
 * env flag. A `NEXT_PUBLIC_` variable would be inlined into the client bundle
 * at build time, so a configuration mistake could ship the picker to
 * production unnoticed. When the dev login is off, the list stays empty and
 * the page renders exactly as before.
 */
function devRoleOptions(): DevRoleOption[] {
  if (!DEV_LOGIN_ENABLED) return [];

  return (
    DEV_ROLES.slice()
      // Same ordering the team views use for real groups: highest weight
      // first, ties A→Z by the label the picker renders, then by id.
      .sort((a, b) =>
        compareRanked(
          { weight: a.weight, name: a.friendlyName, id: a.id },
          { weight: b.weight, name: b.friendlyName, id: b.id },
        ),
      )
      .map((role) => ({
        id: role.id,
        label: role.friendlyName,
        description: role.description,
        color: prefixColor(role.prefix),
      }))
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  return (
    <LoginClient searchParams={searchParams} devRoles={devRoleOptions()} />
  );
}
