import React from "react";
import type { Metadata } from "next";
import DashboardOverview from "./overview";
import AdminPageGuard from "./admin-page-guard";

export const metadata: Metadata = {
  title: "Admin Dashboard – OnThePixel",
  robots: { index: false },
};

export default function DashboardPage() {
  return (
    <AdminPageGuard>
      <DashboardOverview />
    </AdminPageGuard>
  );
}
