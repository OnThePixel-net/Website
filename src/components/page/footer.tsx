"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  IconBrandX,
  IconBrandDiscord,
  IconBrandTwitch,
  IconBrandYoutube,
} from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="py-12 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 hidden md:block">
            <div className="flex items-center mb-4">
              <Link href={"/"}>
                <Image
                  className="text-3xl font-bold mr-2"
                  src={"/logo.png"}
                  alt="OnThePixel.net"
                  width={40}
                  height={40}
                />
              </Link>
            </div>
            <h2 className="text-xl font-bold mb-2">OnThePixel.net</h2>
            <Link
              href="https://status.onthepixel.net"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex items-center mb-4 w-auto bg-white/5 max-w-32 pr-1 rounded-lg pl-2 py-2 hover:bg-white/10 group transition-all">
                <span className="relative flex h-3 w-3 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm text-gray-400 group-hover:text-gray-300">
                  System Status
                </span>
              </div>
            </Link>
            <div className="text-sm mb-4">Follow Us</div>
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
            <h3 className="font-semibold mb-2">OnThePixel</h3>
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
                  href="/tntrun"
                  className="text-gray-400 hover:text-green-500"
                >
                  TNT Run
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Resources</h3>
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
            <h3 className="font-semibold mb-2">Follow Us</h3>
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
        <div className="md:col-span-2 block md:hidden mt-12">
          <div className="flex items-center mb-4">
            <Link href={"/"}>
              <Image
                className="text-3xl font-bold mr-2"
                src={"/logo.png"}
                alt="OnThePixel.net"
                width={40}
                height={40}
              />
            </Link>
          </div>
          <h2 className="text-xl font-bold mb-2">OnThePixel.net</h2>
          <div className="flex items-center mb-4 w-auto bg-white/5 max-w-32 pr-1 rounded-lg pl-2 py-2">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-400">System Status</span>
          </div>
          <div className="text-sm mb-4">Follow Us</div>
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
        <div className="mt-8 pt-8 border-t w-full border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            Copyright &copy; 2022-{new Date().getFullYear()} OnThePixel.net -
            All Rights Reserved. - Not affiliated with Mojang or Microsoft!
          </p>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors"
          >
            Back to Top
          </Button>
        </div>
      </div>
    </footer>
  );
}
