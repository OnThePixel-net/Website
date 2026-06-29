"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const ADMIN_DISCORD_IDS = (process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    redirect("/api/auth/signin");
  }

  const discordId = (session.user as { discordId?: string })?.discordId;
  if (ADMIN_DISCORD_IDS.length > 0 && discordId && !ADMIN_DISCORD_IDS.includes(discordId)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-xl font-bold text-white">Access Denied</p>
        <p className="text-sm text-white/40">You do not have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return <>{children}</>;
}
