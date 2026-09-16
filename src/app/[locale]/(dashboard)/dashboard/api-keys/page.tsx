import React from "react";
import type { Metadata } from "next";
import ApiKeysDashboard from "./api-keys-dashboard";
import AdminPageGuard from "../admin-page-guard";

export const metadata: Metadata = {
  title: "API-Keys – Admin Dashboard",
  robots: { index: false },
};

// Handing out a credential is team administration, so this page shares the
// `team` area rather than introducing a fifth one — same reasoning as the rank
// editor next door, and the same practical rule: a key can never carry more
// than its creator holds. Level 1 may look at the list and read the API
// reference, level 2 may mint and revoke.
export default function DashboardApiKeysPage() {
  return (
    <AdminPageGuard area="team">
      <ApiKeysDashboard />
    </AdminPageGuard>
  );
}
