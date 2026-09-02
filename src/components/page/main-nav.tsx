"use client";
import { LocaleLink } from "@/components/LocaleLink";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/LanguageProvider";
import { stripLocalePrefix } from "@/lib/i18n/paths";

export function MainNav() {
  // Compared against locale-free hrefs, so the locale prefix has to go:
  // "/de/team/" and "/team/" are the same entry and must highlight alike.
  const pathname = stripLocalePrefix(usePathname());
  const t = useTranslations();
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <LocaleLink href="/" className="mr-6 flex items-center space-x-2">
        <span className="font-bold">OnThePixel.net</span>
      </LocaleLink>
      <LocaleLink
        href="/leaderboard"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname.startsWith("/leaderboard")
            ? "text-foreground"
            : "text-foreground/60",
        )}
      >
        {t.nav.leaderboard}
      </LocaleLink>
      <LocaleLink
        href="/stats"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname.startsWith("/stats")
            ? "text-foreground"
            : "text-foreground/60",
        )}
      >
        {t.nav.statistics}
      </LocaleLink>
      <LocaleLink
        href="/team"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname === "/team/" ? "text-foreground" : "text-foreground/60",
        )}
      >
        {t.nav.team}
      </LocaleLink>
      <LocaleLink
        href="/creators"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname === "/creators/" ? "text-foreground" : "text-foreground/60",
        )}
      >
        {t.nav.creators}
      </LocaleLink>
      <LocaleLink
        href="/apply"
        className={cn(
          "hidden text-sm font-medium transition-colors hover:text-primary sm:inline-block",
          pathname.startsWith("/apply") ? "text-foreground" : "text-foreground/60",
        )}
      >
        {t.nav.apply}
      </LocaleLink>
    </nav>
  );
}
