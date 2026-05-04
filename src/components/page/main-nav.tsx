"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

export function MainNav() {
  const pathname = usePathname();
  const t = useTranslations();
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
        {t.nav.leaderboard}
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
        {t.nav.statistics}
      </Link>
      <Link
        href="/team"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname === "/team" ? "text-foreground" : "text-foreground/60",
        )}
      >
        {t.nav.team}
      </Link>
      <Link
        href="/creators"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname === "/creators" ? "text-foreground" : "text-foreground/60",
        )}
      >
        {t.nav.creators}
      </Link>
      <Link
        href="/apply"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname.startsWith("/apply") ? "text-foreground" : "text-foreground/60",
        )}
      >
        {t.nav.apply}
      </Link>
    </nav>
  );
}
