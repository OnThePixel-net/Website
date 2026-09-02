import React from "react";
import type { Metadata } from "next";
import NewsDashboard from "./news-dashboard";
import AdminPageGuard from "../admin-page-guard";

export const metadata: Metadata = {
  title: "News Management – Admin Dashboard",
  robots: { index: false },
};

export default function DashboardNewsPage() {
  return (
    <AdminPageGuard area="news">
      <NewsDashboard />
    </AdminPageGuard>
  );
}
