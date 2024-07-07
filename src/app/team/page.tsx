import React from "react";
import Team from "@/components/page/team";
import TopPage from "@/components/page/top";

export default function Home() {
  return (
    <div className="h-screen">
      <TopPage />
      <Team />
    </div>
  );
}
