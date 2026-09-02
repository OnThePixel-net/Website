import React from "react";
import type { Metadata } from "next";
import ApplyDashboard from "./apply-dashboard";
import AdminPageGuard from "../admin-page-guard";

export const metadata: Metadata = {
  title: "Bewerbungen – Admin Dashboard",
  robots: { index: false },
};

export default function DashboardApplyPage() {
  return (
    <AdminPageGuard area="apply">
      <ApplyDashboard />
    </AdminPageGuard>
  );
}
