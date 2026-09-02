"use client";

/**
 * The pieces the Team and Rollen dashboards both need.
 *
 * Rank (Pocket ID group) management lives on `/dashboard/roles`, the member
 * roster on `/dashboard/team`. The two are split because they are separate
 * jobs, but the roster still has to *offer* the ranks — the create dialog picks
 * one, the edit dialog toggles several — so the shape they are read in, and the
 * small labelled-field wrapper both pages' dialogs are built from, live here
 * instead of being copied into each page.
 */

import React from "react";
import type { PermissionSet } from "@/lib/permissions";

/** An OTP rank, as `/api/dashboard/team` serves it. */
export interface Group {
  id: string;
  friendlyName: string;
  name?: string;
  prefix?: string;
  weight?: string;
  /** Discord role handed to members of this rank ("" when unmapped). */
  discordRoleId?: string;
  /** True for the one rank whose Discord role creators receive. */
  isCreatorRank?: boolean;
  /** Dashboard levels members of this rank get, per area (see permissions.ts). */
  permissions?: PermissionSet;
}

/** A labelled form row, as used by every dialog on both pages. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/40">{label}</label>
      {children}
    </div>
  );
}
