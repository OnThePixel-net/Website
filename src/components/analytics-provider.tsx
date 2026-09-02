"use client";
import React from "react";
import Script from "next/script";
import CookieConsent from "@/components/cookie-consent";
import { useAnalytics } from "@/hooks/use-analytics";

const UMAMI_SRC = "https://analytics.intern.onthepixel.net/script.js";
const UMAMI_WEBSITE_ID = "2362b4d0-3dea-4b1e-b3f8-86b0af3e4bd1";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { preferences, isLoaded } = useAnalytics();
  const analyticsAllowed = isLoaded && preferences.analytics;

  return (
    <>
      {children}
      {/*
        Umami. Loaded only once the visitor has actually consented to
        analytics — it used to sit unconditionally in the document <head>,
        which meant it ran before (and regardless of) the cookie banner.
      */}
      {analyticsAllowed && (
        <Script
          src={UMAMI_SRC}
          data-website-id={UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
      )}
      <CookieConsent />
    </>
  );
}
