import React from "react";
import type { Metadata } from "next";
import CreatorsDashboard from "./creators-dashboard";

export const metadata: Metadata = {
  title: "Creators Management – Admin Dashboard",
  robots: { index: false },
};

export default function DashboardCreatorsPage() {
  return <CreatorsDashboard />;
}
