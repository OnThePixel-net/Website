"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FaCopy } from "react-icons/fa6";

export default function Header() {
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
  return (
    <div
      key="1"
      className="relative flex min-h-screen flex-col items-center justify-center text-white"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          alt="Background Image"
          className="h-full w-full object-cover brightness-75 filter"
          height="1080"
          src="/bg.png"
          width="1920"
        />
        <div className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
      </div>
      <main className="flex flex-col items-center">
        <div className="relative mb-4">
          <Image
            alt="Logo"
            height="100"
            src="/logo.png"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="250"
          />
        </div>
        <h1
          className="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl"
          style={{
            color: "#fff",
            textShadow: "0 0 15px #fff",
          }}
        >
          OnThePixel.net
        </h1>
        <p className="mb-8 text-center">Join now - Don&#39;t play alone!</p>
        <div className="flex space-x-4">
          <Link href="/leaderboard">
            <Button className="flex h-12 w-36 items-center bg-green-700 px-4 py-2 text-lg text-white transition-transform duration-500 hover:scale-105 sm:w-40 sm:px-6 sm:text-xl md:w-48 md:text-2xl">
              LEADERBOARD
            </Button>
          </Link>
          <Button
            className="flex size-12 items-center rounded bg-green-700 px-4 py-2"
            onClick={() => copyToClipboard("OnThePixel.net")}
          >
            <FaCopy className="size-20 text-white" />
          </Button>
          <Link href="https://discord.onthepixel.net">
            <Button className="flex h-12 w-36 items-center bg-green-700 px-4 py-2 text-lg text-white transition-transform duration-500 hover:scale-105 sm:w-40 sm:px-6 sm:text-xl md:w-48 md:text-2xl">
              DISCORD
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
