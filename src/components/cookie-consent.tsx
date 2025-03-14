"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCookieBite } from "react-icons/fa";
import CookieSettings from "@/components/cookie-settings";

export default function CookieConsent() {
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
                Cookie Consent
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300">
              <p>
                OnThePixel.net uses cookies and similar technologies to enhance your browsing experience, analyze site traffic, 
                and provide personalized content.
              </p>
              <p className="mt-2">
                By clicking "Accept All", you consent to the use of cookies on our website. You can change your preferences 
                at any time by clicking "Customize" or manage your preferences in your browser settings.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0 pt-2">
              <Button 
                variant="outline" 
                onClick={handleDecline}
                className="w-full sm:w-auto border-gray-700 hover:bg-gray-800 hover:text-white"
              >
                Decline
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCustomize}
                className="w-full sm:w-auto border-gray-700 hover:bg-gray-800 hover:text-white"
              >
                Customize
              </Button>
              <Button 
                onClick={handleAccept}
                className="w-full sm:w-auto bg-green-700 hover:bg-green-600 text-white"
              >
                Accept All
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
