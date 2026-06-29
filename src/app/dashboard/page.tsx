import React from "react";
import type { Metadata } from "next";
import DashboardOverview from "./overview";

export const metadata: Metadata = {
  title: "Admin Dashboard – OnThePixel",
  robots: { index: false },
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
