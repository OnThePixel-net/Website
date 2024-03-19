import React from "react";
import Image from "next/image";

export default function TopPage() {
  return (
    <section className="relative">
      <div className="pt-[56px] relative">
        <Image
          alt="Background Image"
          className="object-cover w-full h-64 filter brightness-75"
          src="/top.png"
          width={1920}
          height={256}
        />
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-gray-950"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-transparent via-transparent to-gray-950"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-transparent to-gray-950"></div>
        </div>
      </div>
    </section>
  );
}
