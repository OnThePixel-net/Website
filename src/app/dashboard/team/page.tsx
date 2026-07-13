import React from "react";
import type { Metadata } from "next";
import TeamDashboard from "./team-dashboard";

export const metadata: Metadata = {
  title: "Team Management – Admin Dashboard",
  robots: { index: false },
};

export default function DashboardTeamPage() {
  return <TeamDashboard />;
}
