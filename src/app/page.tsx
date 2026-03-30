import React from "react";
import Header from "@/components/page/header";
import Trailer from "@/components/page/trailer";
import Team from "@/components/page/team";
import News from "@/components/page/news";

export default function Home() {
  return (
    <>
      <Header />
      <Trailer />
      <News />
      <Team />
    </>
  );
}
