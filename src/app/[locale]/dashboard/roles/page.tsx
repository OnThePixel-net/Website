import React from "react";
import type { Metadata } from "next";
import RolesDashboard from "./roles-dashboard";
import AdminPageGuard from "../admin-page-guard";

export const metadata: Metadata = {
  title: "Rollen – Admin Dashboard",
  robots: { index: false },
};

// Ranks are part of team administration, so this page shares the `team` area
// rather than introducing a fifth one: the levels edited here are exactly the
// four the model has, and gating their editor behind a level of its own would
// be circular. Level 1 may look, level 2 may change — see `roles-dashboard`.
export default function DashboardRolesPage() {
  return (
    <AdminPageGuard area="team">
      <RolesDashboard />
    </AdminPageGuard>
  );
}
