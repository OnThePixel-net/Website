import React from "react";
import Header from "@/components/page/header";
import Trailer from "@/components/page/trailer";
import Team from "@/components/page/team";
import ChangeLog from "@/components/page/changelog";

export default function Home() {
  return (
    <>
      <Header />
      <Trailer />
      <Team />
      <ChangeLog />
    </>
  );
}
