import React from "react";
import type { Metadata } from "next";
import NewsDashboard from "./news-dashboard";

export const metadata: Metadata = {
  title: "News Management – Admin Dashboard",
  robots: { index: false },
};

export default function DashboardNewsPage() {
  return <NewsDashboard />;
}
