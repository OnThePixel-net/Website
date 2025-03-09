"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="font-bold">OnThePixel.net</span>
      </Link>
      <Link
        href="/leaderboard"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname.startsWith("/leaderboard")
            ? "text-foreground"
            : "text-foreground/60",
        )}
      >
        Leaderboard
      </Link>
      <Link
        href="/stats"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname.startsWith("/stats")
            ? "text-foreground"
            : "text-foreground/60",
        )}
      >
        Statistics
      </Link>
      <Link
        href="/team"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname === "/team" ? "text-foreground" : "text-foreground/60",
        )}
      >
        Team
      </Link>
      <Link
        href="/creators"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname === "/creators" ? "text-foreground" : "text-foreground/60",
        )}
      >
        Creators
      </Link>
    </nav>
  );
}
