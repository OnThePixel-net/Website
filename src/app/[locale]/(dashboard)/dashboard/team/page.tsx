import React from "react";
import type { Metadata } from "next";
import TeamDashboard from "./team-dashboard";
import AdminPageGuard from "../admin-page-guard";

export const metadata: Metadata = {
  title: "Team Management – Admin Dashboard",
  robots: { index: false },
};

export default function DashboardTeamPage() {
  return (
    <AdminPageGuard area="team">
      <TeamDashboard />
    </AdminPageGuard>
  );
}
