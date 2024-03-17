import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FaTwitter, FaDiscord, FaYoutube } from "react-icons/fa";
import { BsBoxes } from "react-icons/bs";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="py-10 px-4 border-[#333] bg-gray-950">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Image
            src="/logo.png"
            className="text-green-500 h-12 w-12 mb-4"
            width={250}
            height={250}
            alt="Logo"
          />
          <div className="flex space-x-4">
            <FaTwitter className="h-6 w-6" />
            <FaYoutube className="h-6 w-6" />
            <FaDiscord className="h-6 w-6" />
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
          <p>Project created by the new OnThePixel team</p>
        </div>
      </div>
    </footer>
  );
}
