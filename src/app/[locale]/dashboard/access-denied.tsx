import React from "react";

/**
 * The "you may not be here" state of the dashboard.
 *
 * Extracted so the server-side guard (`admin-page-guard.tsx`) and the
 * client-side one (`auth-guard.tsx`) render the exact same thing — the view is
 * unchanged from when it lived inside the client guard. Deliberately free of
 * hooks and of a "use client" directive, so it works as a Server Component and
 * still renders fine when a Client Component imports it.
 */
export default function AccessDenied() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-xl font-bold text-white">Access Denied</p>
      <p className="text-sm text-white/40">You do not have permission to access the admin dashboard.</p>
    </div>
  );
}
