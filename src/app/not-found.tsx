import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function NotFound() {
  return (
    <>
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
      <div className="text-white min-h-screen flex flex-col items-center justify-center z-10">
        <Image
          src="/logo.png"
          width={200}
          height={200}
          alt={"Logo"}
          className="mb-8 w-48 h-48"
        />
        <h1 className="text-4xl sm:text-6xl font-bold mb-4">404</h1>
        <p className="text-xl sm:text-2xl mb-8">
          Some things aren&apos;t meant to last forever.
        </p>
        <Link href="/">
          <Button className="bg-[#22c55e] text-white">Go Home</Button>
        </Link>
      </div>
    </>
  );
}
