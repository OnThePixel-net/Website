"use client";

/**
 * The signed-in account's level for one dashboard area, in a Client Component.
 *
 * The levels ride on the session (see `src/auth.ts`), so this is a session read
 * and costs no request. It exists so the four dashboard bodies do not each
 * repeat the `useSession()` + `permissionLevel()` pair — and, more importantly,
 * so they all read the level the same fail-closed way: while the session is
 * still loading, and for a session that predates this feature, the answer is
 * {@link LEVEL_NONE}, i.e. the write and delete controls stay hidden until the level
 * is actually known.
 *
 * This is presentation only. Hiding a button is user guidance, not a security
 * boundary — `requirePermission()` in `src/lib/authz.ts` is what actually
 * refuses the request.
 */

import { useSession } from "next-auth/react";
import {
  permissionLevel,
  type PermissionArea,
  type PermissionLevel,
} from "@/lib/permissions";

export function usePermissionLevel(area: PermissionArea): PermissionLevel {
  const { data: session } = useSession();
  return permissionLevel(session?.user?.permissions, area);
}
