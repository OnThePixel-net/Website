"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import type { LinkProps } from "next/link";
import { LocaleLink } from "@/components/LocaleLink";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-10 px-0 sm:hidden bg-gray-950" aria-label={t.nav.openMenu}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <MobileLink
          onOpenChange={setOpen}
          href="/"
          className="flex items-center"
        >
          <span className="font-bold">OnThePixel.net</span>
        </MobileLink>
        <div className="flex flex-col gap-3 mt-3">
          <MobileLink onOpenChange={setOpen} href="/leaderboard">
            {t.nav.leaderboard}
          </MobileLink>
          <MobileLink onOpenChange={setOpen} href="/stats">
            {t.nav.statistics}
          </MobileLink>
          <MobileLink onOpenChange={setOpen} href="/team">
            {t.nav.team}
          </MobileLink>
          <MobileLink onOpenChange={setOpen} href="/creators">
            {t.nav.creators}
          </MobileLink>
          <MobileLink onOpenChange={setOpen} href="/apply">
            {t.nav.apply}
          </MobileLink>
          <LocaleLink href="https://discord.onthepixel.net">
            {t.nav.discord}
          </LocaleLink>
          <LocaleLink href="https://x.com/onthepixelnet">
            {t.nav.twitter}
          </LocaleLink>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends Omit<LinkProps, "href"> {
  /** Locale-free, root-relative path — LocaleLink adds the prefix. */
  href: string;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  children,
  className,
  ...props
}: MobileLinkProps) {
  return (
    <LocaleLink
      href={href}
      // The sheet has to close on navigation; the link itself does the
      // navigating, so this only flips the panel shut.
      onClick={() => onOpenChange?.(false)}
      className={className}
      {...props}
    >
      {children}
    </LocaleLink>
  );
}
