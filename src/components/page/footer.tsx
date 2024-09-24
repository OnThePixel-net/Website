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
              href="#"
              className="text-muted-foreground hover:text-green-500"
              prefetch={false}
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-green-500"
              prefetch={false}
            >
              <RiDiscordLine className="h-6 w-6" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link
              href="#"
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
            <h4 className="text-sm font-semibold">Company</h4>
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
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Products</h4>
            <ul className="space-y-1">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Integrations
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-1">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Follow Us</h4>
            <ul className="space-y-1">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-green-500"
                  prefetch={false}
                >
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link
                  href="#"
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
