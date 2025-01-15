import React from "react";
import Team from "@/components/page/team";
import TopPage from "@/components/page/top";

export default function Home() {
  return (
    <section className="min-h-screen bg-gray-950">
      <TopPage />
      <Team />
    </section>
  );
}
