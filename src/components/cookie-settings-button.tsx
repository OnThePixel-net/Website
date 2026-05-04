"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaCog } from "react-icons/fa";
import CookieSettings from "@/components/cookie-settings";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

export default function CookieSettingsButton() {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-400 hover:text-green-500"
      >
        <FaCog className="mr-1 h-3 w-3" /> {t.cookieSettings.buttonLabel}
      </Button>
      <CookieSettings isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
