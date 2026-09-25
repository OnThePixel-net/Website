import React from "react";
import type { Metadata } from "next";
import BugsDashboard from "./bugs-dashboard";
import AdminPageGuard from "../admin-page-guard";

export const metadata: Metadata = {
  title: "Bug-Reports – Admin Dashboard",
  robots: { index: false },
};

export default function DashboardBugsPage() {
  return (
    <AdminPageGuard area="bugs">
      <BugsDashboard />
    </AdminPageGuard>
  );
}
