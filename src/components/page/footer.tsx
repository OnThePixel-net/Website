import React from "react";
import Link from "next/link";
import { FaTwitter, FaDiscord, FaYoutube } from "react-icons/fa";
import { BsBoxes } from "react-icons/bs";
import Image from "next/image";
import { footerLinks } from "@/config/links";

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
            <Link
              href={"https://twitter.com/@onthepixel?mx=1"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter className="size-6 hover:text-green-500 transition" />
            </Link>
            <Link
              href={"https://youtube.com/@thebestminecraftserver"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube className="size-6 hover:text-green-500 transition" />
            </Link>
            <Link
              href={"https://discord.onthepixel.net"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDiscord className="size-6 hover:text-green-500 transition " />
            </Link>
          </div>
        </div>
        {footerLinks.map((section) => (
          <div key={section.group}>
            <h3 className="text-xl font-semibold mb-4">
              {section.group.charAt(0).toUpperCase() + section.group.slice(1)}
            </h3>
            <nav className="flex flex-col space-y-2">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-green-500 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
      <div className="border-dashed border-t-slate-800 border-t-2 w-full my-4"></div>
      <div className="text-sm text-right whitespace-nowrap -mb-4">
        <p>
          Copyright &copy; 2022-{new Date().getFullYear()} OnThePixel.net - All
          Rights Reserved. - Not affiliated with Mojang or Microsoft!
        </p>
      </div>
    </footer>
  );
}
