"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  LEVEL_READ,
  hasAnyPermission,
  hasPermission,
  type PermissionArea,
} from "@/lib/permissions";
import AccessDenied from "./access-denied";

/**
 * Client-side dashboard guard.
 *
 * This is presentation only — it decides what the browser shows, never what the
 * server allows. The real gates are `admin-page-guard.tsx` (rendering) and
 * `requireAdmin()` in `src/lib/authz.ts` (the API routes); this one exists so
 * the page does not flash content while the session loads.
 *
 * It reads `session.user.permissions`, the per-area levels
 * `src/lib/admin-access.ts` derives from the account's Pocket ID groups, and
 * asks for {@link LEVEL_READ} in `area` (or for a level anywhere, when no area is
 * given). It used to compare `session.user.discordId` against
 * `NEXT_PUBLIC_ADMIN_DISCORD_IDS`, which had two problems: a `NEXT_PUBLIC_`
 * variable is baked into this bundle at build time, so it published the admins'
 * Discord ids to every visitor — and it could not see Pocket ID sign-ins at
 * all, since those carry no Discord id.
 */
export default function AuthGuard({
  area,
  children,
}: {
  area?: PermissionArea;
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    redirect("/dashboard/login");
  }

  // Fail-closed: an absent permission set reads as 0 everywhere, so a session
  // predating this feature (or any future provider without an authorisation
  // rule) lands here rather than slipping through. Development sign-ins go
  // through the same levels, so the deliberately right-less dev role still
  // produces this denied state locally.
  const allowed = area
    ? hasPermission(session.user?.permissions, area, LEVEL_READ)
    : hasAnyPermission(session.user?.permissions);

  if (!allowed) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
