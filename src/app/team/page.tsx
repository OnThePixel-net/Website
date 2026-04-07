import React from "react";
import Team from "@/components/page/team";
import TopPage from "@/components/page/top";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team — OnThePixel.net",
  description: "Meet the people behind OnThePixel.net — our developers, builders, supporters and more.",
};

export default function Home() {
  return (
    <section className="min-h-screen bg-gray-950">
      <TopPage />
      <Team />
    </section>
  );
}
