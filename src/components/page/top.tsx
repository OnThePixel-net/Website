import React from "react";
import Image from "next/image";

export default function TopPage() {
  return (
    <section className="relative">
      <div className="relative">
        {/*
          Purely decorative page banner: it carries no information the page
          does not already state, and the gradients on top of it are part of
          the same ornament. An empty alt keeps it out of the accessibility
          tree instead of announcing a meaningless description.
        */}
        <Image
          alt=""
          className="h-64 w-full object-cover brightness-75 filter"
          src="/67971722-5ba1-4e3d-8788-c5a6ccbe042e"
          width={1920}
          height={256}
          sizes="100vw"
        />
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 h-full w-full bg-gradient-to-b from-transparent via-transparent to-gray-950"></div>
          <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-l from-transparent via-transparent to-gray-950"></div>
          <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-transparent to-gray-950"></div>
        </div>
      </div>
    </section>
  );
}
