"use client";
import { navLinks } from "@/config/links";
import SignIn from "@/components/auth/SignIn";
import { getUserAuth } from "@/lib/auth/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default async function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="pt-4 text-base text-gray-300 md:flex md:justify-between md:pt-0">
      {navLinks.map((link) => {
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`md:p-4 py-2 block transition ${
                pathname === link.href
                  ? "hover:text-green-300"
                  : "hover:text-white"
              } 
                      ${pathname === link.href ? "text-green-500" : ""}`}
            >
              {link.title}
            </Link>
          </li>
        );
      })}
      <li>
        <SignIn />
      </li>
    </ul>
  );
}
