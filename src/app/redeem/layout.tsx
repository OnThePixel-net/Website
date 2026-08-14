import type { Metadata } from "next";

// Redeem is a transactional utility page (code entry), not a landing page —
// keep it out of the search index while still allowing crawlers to follow
// links away from it.
export const metadata: Metadata = {
  title: "Redeem",
  robots: { index: false, follow: true },
};

export default function RedeemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
