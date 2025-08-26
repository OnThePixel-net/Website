import React from "react";
import Creators from "@/components/page/creators";
import TopPage from "@/components/page/top";

export default function Home() {
  return (
    <section className="min-h-screen bg-gray-950">
      <TopPage />
      <Creators />
    </section>
  );
}
