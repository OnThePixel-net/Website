import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function NotFound() {
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
          src="/bg.png"
          style={{
            aspectRatio: "1920/1080",
            objectFit: "cover",
          }}
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
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
          style={{
            color: "#fff",
            textShadow: "0 0 15px #fff",
          }}
        >
          404
        </h1>
        <p className="mb-8 text-center">
          Some things aren&apos;t meant to last forever.
        </p>
        <div className="flex space-x-4">
          <Link href="/">
            <Button className="bg-green-700 text-white text-lg sm:text-xl md:text-2xl px-4 sm:px-6 py-2 flex items-center w-36 sm:w-40 md:w-48 h-12 hover:scale-105 transition-transform duration-500">
              HOME
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
