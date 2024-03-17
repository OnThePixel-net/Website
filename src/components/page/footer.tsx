import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Footer() {
  return (
    <footer className="py-10 px-4 border-[#333]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <PiggyBankIcon className="text-green-500 h-12 w-12 mb-4" />
          <div className="flex space-x-4">
            <FacebookIcon className="h-6 w-6" />
            <YoutubeIcon className="h-6 w-6" />
            <DiscIcon className="h-6 w-6" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Social Media</h3>
          <nav className="flex flex-col space-y-2">
            <Link
              className="hover:text-green-500"
              href="https://twitter.com/@onthepixelnet">
              Twitter
            </Link>
            <Link
              className="hover:text-green-500"
              href="https://youtube.com/@thebestminecraftserver">
              YouTube
            </Link>
            <Link
              className="hover:text-green-500"
              href="https://discord.onthepixel.net">
              Discord
            </Link>
          </nav>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Navigation</h3>
          <nav className="flex flex-col space-y-2">
            <Link className="hover:text-green-500" href="#">
              Home
            </Link>
            <Link className="hover:text-green-500" href="#">
              Shop
            </Link>
            <Link className="hover:text-green-500" href="#">
              Rules
            </Link>
            <Link className="hover:text-green-500" href="#">
              Team
            </Link>
            <Link className="hover:text-green-500" href="#">
              Leaderboard
            </Link>
          </nav>
        </div>
        <div className="text-sm">
          <p>COPYRIGHT 2023 OnThePixel.net</p>
          <p>
            The OnThePixel.net server is in no way associated with Mojang AB.
          </p>
          <p>Project created by the new OnThePixel team with help species</p>
        </div>
      </div>
    </footer>
  );
}

function DiscIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function PiggyBankIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z" />
      <path d="M2 9v1c0 1.1.9 2 2 2h1" />
      <path d="M16 11h0" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}
