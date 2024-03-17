import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Component() {
  return (
    <div
      key="1"
      className="relative min-h-screen flex flex-col items-center justify-center text-white">
      <div className="absolute inset-0 z-[-1]">
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
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
      </div>
      <main className="flex flex-col items-center">
        <div className="relative mb-4">
          <Image
            alt="Small Round Image"
            height="100"
            src="/logo.png"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="250"
          />
        </div>
        <h1 className="text-6xl font-bold mb-4">OnThePixel.net</h1>
        <p className="mb-8 text-center">Join now - Don&#39;t play alone!</p>
        <div className="flex space-x-4">
          <Button className="bg-[#bd1e59] px-6 py-2 rounded">VOUCHER</Button>
          <Button className="bg-[#bd1e59] px-6 py-2 rounded flex items-center">
            <GiftIcon className="mr-2" />
            SHOP
          </Button>
        </div>
      </main>
    </div>
  );
}

function CircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function GiftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect width="20" height="5" x="2" y="7" />
      <line x1="12" x2="12" y1="22" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

{
  /* 
  
    function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
  
  <a
          className="header_content__btn"
          style={{
            cursor: "pointer",
            padding: "5.25px 0",
            width: 50,
            transform: "translateY(-1.75px)",
          }}
          onClick={() => copyToClipboard("OnThePixel.net")}> */
}
