"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import CookieSettingsButton from "@/components/cookie-settings-button";
import {
  IconBrandX,
  IconBrandDiscord,
  IconBrandTwitch,
  IconBrandYoutube,
} from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="px-4 py-12 md:px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="hidden md:col-span-2 md:block">
            <div className="mb-4 flex items-center">
              <Link href={"/"}>
                <Image
                  className="mr-2 text-3xl font-bold"
                  src={"/logo.png"}
                  alt="OnThePixel.net"
                  width={40}
                  height={40}
                />
              </Link>
            </div>
            <h2 className="mb-2 text-xl font-bold">OnThePixel.net®</h2>
            <div className="mb-4 text-sm">Follow Us</div>
            <div className="flex space-x-4">
              <Link
                href="https://x.com/onthepixelnet"
                rel="noopener noreferrer"
                target="_blank"
                className="text-gray-400 hover:text-green-500"
              >
                <IconBrandX size={20} />
              </Link>
              <Link
                href="https://discord.com/invite/Dpx3eK9t3z"
                rel="noopener noreferrer"
                target="_blank"
                className="text-gray-400 hover:text-green-500"
              >
                <IconBrandDiscord size={20} />
              </Link>
              <Link
                href="https://twitch.tv/onthepixel"
                rel="noopener noreferrer"
                target="_blank"
                className="text-gray-400 hover:text-green-500"
              >
                <IconBrandTwitch size={20} />
              </Link>
              <Link
                href="https://youtube.com/@thebestminecraftserver"
                rel="noopener noreferrer"
                target="_blank"
                className="text-gray-400 hover:text-green-500"
              >
                <IconBrandYoutube size={20} />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">OnThePixel</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-green-500"
                >
                  About us
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-gray-400 hover:text-green-500"
                >
                  Meet the Team
                </Link>
              </li>
              <li>
                <Link
                  href="/creators"
                  className="text-gray-400 hover:text-green-500"
                >  
                  Creators
                </Link>
              </li>
              <li>
                <Link
                  href="/tntrun"
                  className="text-gray-400 hover:text-green-500"
                >
                  TNT Run
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/leaderboard"
                  className="text-gray-400 hover:text-green-500"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="/statistics"
                  className="text-gray-400 hover:text-green-500"
                >
                  Statistics
                </Link>
              </li>
              <li>
                <Link
                  href="https://status.onthepixel.net"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  Status
                </Link>
              </li>
              <li>
                <Link
                  href="/imprint"
                  className="text-gray-400 hover:text-green-500"
                >
                  Imprint
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-green-500"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Follow Us</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://youtube.com/@thebestminecraftserver"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  YouTube
                </Link>
              </li>
              <li>
                <Link
                  href="https://twitch.tv/onthepixel"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  Twitch
                </Link>
              </li>
              <li>
                <Link
                  href="https://discord.com/invite/Dpx3eK9t3z"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  Discord
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.tiktok.com/@onthepixel"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  TikTok
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.instagram.com/onthepixel_net"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href="https://x.com/onthepixelnet"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  Twitter
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 block md:col-span-2 md:hidden">
          <div className="mb-4 flex items-center">
            <Link href={"/"}>
              <Image
                className="mr-2 text-3xl font-bold"
                src={"/logo.png"}
                alt="OnThePixel.net"
                width={40}
                height={40}
              />
            </Link>
          </div>
          <h2 className="mb-2 text-xl font-bold">OnThePixel.net®</h2>
          <div className="mb-4 text-sm">Follow Us</div>
          <div className="flex space-x-4">
            <Link
              href="https://x.com/onthepixelnet"
              rel="noopener noreferrer"
              target="_blank"
              className="text-gray-400 hover:text-green-500"
            >
              <IconBrandX size={20} />
            </Link>
            <Link
              href="https://discord.com/invite/Dpx3eK9t3z"
              rel="noopener noreferrer"
              target="_blank"
              className="text-gray-400 hover:text-green-500"
            >
              <IconBrandDiscord size={20} />
            </Link>
            <Link
              href="https://twitch.tv/onthepixel"
              rel="noopener noreferrer"
              target="_blank"
              className="text-gray-400 hover:text-green-500"
            >
              <IconBrandTwitch size={20} />
            </Link>
            <Link
              href="https://youtube.com/@thebestminecraftserver"
              rel="noopener noreferrer"
              target="_blank"
              className="text-gray-400 hover:text-green-500"
            >
              <IconBrandYoutube size={20} />
            </Link>
          </div>
        </div>
        <div className="mt-8 flex w-full flex-col items-center justify-between border-t border-slate-800 pt-8 md:flex-row">
          <p className="mb-4 text-sm text-gray-400 md:mb-0">
            Copyright &copy; 2022-{new Date().getFullYear()} OnThePixel.net® -
            All Rights Reserved. - Not affiliated with Mojang or Microsoft!
            <CookieSettingsButton />
          </p>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-full bg-white px-6 py-2 font-semibold text-black transition-colors hover:bg-gray-200"
          >
            Back to Top
          </Button>
        </div>
      </div>
    </footer>
  );
}
