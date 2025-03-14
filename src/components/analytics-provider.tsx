"use client";
import React from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import CookieConsent from "@/components/cookie-consent";
import { useAnalytics } from "@/hooks/use-analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { preferences, isLoaded } = useAnalytics();

  return (
    <>
      {children}
      {isLoaded && preferences.analytics && <VercelAnalytics />}
      <CookieConsent />
    </>
  );
}
