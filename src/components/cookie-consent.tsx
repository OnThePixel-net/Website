"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCookieBite } from "react-icons/fa";
import CookieSettings from "@/components/cookie-settings";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

export default function CookieConsent() {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem("cookie-consent");
    if (!hasConsent) {
      // Show banner after a small delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    // Enable Vercel Analytics
    window.localStorage.setItem("va-preferences", JSON.stringify({ analytics: true }));
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    // Disable Vercel Analytics
    window.localStorage.setItem("va-preferences", JSON.stringify({ analytics: false }));
    setIsVisible(false);
  };

  const handleCustomize = () => {
    // Show the cookie settings dialog
    setShowSettings(true);
  };

  // Handle close of settings modal
  const handleCloseSettings = () => {
    setShowSettings(false);
    setIsVisible(false);
  };

  if (!isVisible && !showSettings) return null;

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
          <Card className="mx-auto max-w-3xl border-green-700/30 bg-gray-900/95 backdrop-blur shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl">
                <FaCookieBite className="mr-2 text-green-500" />
                {t.cookieConsent.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300">
              <p>{t.cookieConsent.paragraph1}</p>
              <p className="mt-2">{t.cookieConsent.paragraph2}</p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0 pt-2">
              <Button
                variant="outline"
                onClick={handleDecline}
                className="w-full sm:w-auto border-gray-700 hover:bg-gray-800 hover:text-white"
              >
                {t.cookieConsent.decline}
              </Button>
              <Button
                variant="outline"
                onClick={handleCustomize}
                className="w-full sm:w-auto border-gray-700 hover:bg-gray-800 hover:text-white"
              >
                {t.cookieConsent.customize}
              </Button>
              <Button
                onClick={handleAccept}
                className="w-full sm:w-auto bg-green-700 hover:bg-green-600 text-white"
              >
                {t.cookieConsent.acceptAll}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {showSettings && (
        <CookieSettings isOpen={showSettings} onClose={handleCloseSettings} />
      )}
    </>
  );
}
