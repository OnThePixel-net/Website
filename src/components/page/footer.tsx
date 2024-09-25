import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram } from "lucide-react";
import { RiDiscordLine } from "react-icons/ri";

export default function Footer() {
  return (
    <footer className="py-12 bg-gray-950">
      <div className="container flex flex-col items-center gap-8 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <Image
              src="/logo.png"
              width={32}
              height={32}
              alt="Logo"
              className="h-8 w-8"
              style={{ aspectRatio: "32/32", objectFit: "cover" }}
            />
            <span className="text-lg font-bold">OnThePixel.net</span>
          </Link>
          <div className="flex gap-4">
            <Link
              href="https://discord.onthepixel.net"
              className="text-muted-foreground hover:text-green-500"
              prefetch={false}
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="https://discord.onthepixel.net"
              className="text-muted-foreground hover:text-green-500"
              prefetch={false}
            >
              <RiDiscordLine className="h-6 w-6" />
              <span className="sr-only">Discord</span>
            </Link>
            <Link
              href="https://www.instagram.com/onthepixel_net/"
              className="text-muted-foreground hover:text-green-500"
              prefetch={false}
            >
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">OnThePixel</h4>
            <ul className="space-y-1">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Team
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Pages</h4>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/leaderboard"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="/stats"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Statistics
                </Link>
              </li>
              <li>
                <Link
                  href="/tntrun"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  TNTRun
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/imprint"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Imprint
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Follow Us</h4>
            <ul className="space-y-1">
              <li>
                <Link
                  href="https://x.com/onthepixelnet"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="https://whatsapp.com/channel/0029VaA61GG84Om2YFUGV92N"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  WhatsApp
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.tiktok.com/@onthepixel"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  TikTok
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.instagram.com/onthepixel_net/"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-dashed border-t-slate-800 border-t-2 w-full my-4"></div>
      <div className="text-sm -mb-8 pl-4">
        <p>
          Copyright &copy; 2022-{new Date().getFullYear()} OnThePixel.net - All
          Rights Reserved. - Not affiliated with Mojang or Microsoft!
        </p>
      </div>
    </footer>
  );
}
