import React from "react";
import type { Metadata } from "next";
import CreatorsDashboard from "./creators-dashboard";
import AdminPageGuard from "../admin-page-guard";

export const metadata: Metadata = {
  title: "Creators Management – Admin Dashboard",
  robots: { index: false },
};

export default function DashboardCreatorsPage() {
  return (
    <AdminPageGuard area="creators">
      <CreatorsDashboard />
    </AdminPageGuard>
  );
}
