"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaCopy } from "react-icons/fa6";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Balancer } from "react-wrap-balancer";

export default function TNTRun() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      key="1"
      className="relative min-h-screen flex flex-col items-center justify-center text-white"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          alt="Background Image"
          className="object-cover w-full h-full filter brightness-75"
          height="1080"
          src="/tntrun.png"
          width="1920"
        />
        <div className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
      </div>
      <main className="flex flex-col items-center">
        <Card className="p-4 aspect-video mx-8">
          <CardHeader className="text-center">
            <CardTitle
              className="text-4xl sm:text-5xl md:text-6xl font-bold"
              style={{
                color: "#fff",
                textShadow: "0 0 15px #fff",
              }}
            >
              TNT Run
            </CardTitle>
            <CardDescription className="text-center">
              by OnThePixel.net
            </CardDescription>
          </CardHeader>

          <h2 className="text-2xl text-bold text-center">
            <Balancer>
              Race against time as the floor crumbles beneath your feet!
            </Balancer>
          </h2>
          <CardFooter className="mt-8">
            <Button
              onClick={() => copyToClipboard("play.tntrun.de")}
              className="mx-auto bg-green-700 text-white text-lg sm:text-xl md:text-2xl px-4 sm:px-6 py-2 flex items-center w-36 sm:w-40 md:w-48 h-12 hover:scale-105 transition-transform duration-500"
            >
              <FaCopy className="text-white size-6 mr-2" /> <span>Copy IP</span>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
