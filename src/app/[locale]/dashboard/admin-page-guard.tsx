import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  LEVEL_READ,
  hasAnyPermission,
  hasPermission,
  type PermissionArea,
} from "@/lib/permissions";
import AccessDenied from "./access-denied";

/**
 * Server-side gate around a dashboard page.
 *
 * Until now the only thing standing between a visitor and the dashboard UI was
 * a Client Component — i.e. the markup was sent to the browser first and hidden
 * afterwards. Wrapping the page bodies here means an unauthorised request never
 * receives the dashboard at all.
 *
 * It sits inside each page rather than in `layout.tsx` on purpose. The layout
 * is a Client Component (it owns the sidebar's open/closed state) and it also
 * wraps `/dashboard/login`, which must stay reachable while signed out; turning
 * it into a Server Component would mean either restructuring the route tree
 * with a route group, or a redirect loop on the login page. Five one-line page
 * wrappers achieve the same thing without moving a single file.
 *
 * The client guard inside the page bodies stays as well: it prevents a content
 * flash while `useSession()` resolves, and defence in depth is cheap here.
 *
 * `area` names which dashboard area the page belongs to; the page then needs
 * {@link LEVEL_READ} in it. Without an `area` — only the overview — it is enough to
 * have a level anywhere, because the overview shows exactly the tiles the
 * account is allowed to see (see `overview.tsx`).
 */
export default async function AdminPageGuard({
  area,
  children,
}: {
  area?: PermissionArea;
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    // Same target as the client guard, so behaviour is unchanged for a signed-
    // out visitor: English lives at the root, and `src/proxy.ts` maps it onto
    // the `[locale]` tree.
    redirect("/dashboard/login");
  }

  // Fail-closed: an absent permission set reads as 0 everywhere, so a token
  // from before this feature existed, or a provider without an authorisation
  // rule, lands here rather than slipping through. Same rule the API side
  // applies in `requirePermission()`.
  const allowed = area
    ? hasPermission(session.user.permissions, area, LEVEL_READ)
    : hasAnyPermission(session.user.permissions);

  if (!allowed) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
