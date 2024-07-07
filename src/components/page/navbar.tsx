"use client";
import React, { useEffect } from "react";
import PlayerCount from "@/components/page/playercount";
import NavLinks from "@/components/page/navlinks";

export default function NavBar() {
  useEffect(() => {
    const button = document.querySelector("#menu-button");
    const menu = document.querySelector("#menu");
    if (!button || !menu) return;

    const toggleMenu = () => {
      menu.classList.toggle("hidden");
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menu &&
        !menu.contains(event.target as Node) &&
        !button.contains(event.target as Node)
      ) {
        menu.classList.add("hidden");
      }
    };

    button.addEventListener("click", toggleMenu);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      button.removeEventListener("click", toggleMenu);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed w-full z-10 navbar-blur">
      <nav className="flex flex-wrap items-center justify-between w-full py-2 md:py-0 px-4 text-lg text-gray-300 bg-opacity-50 bg-[#1b1818]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          id="menu-button"
          className="h-6 w-6 cursor-pointer md:hidden block"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <PlayerCount />
        <div
          className="hidden w-full md:flex md:items-center md:w-auto"
          id="menu"
        >
          <NavLinks />
        </div>
      </nav>
    </header>
  );
}
