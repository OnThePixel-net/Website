"use client";
import { useState, useEffect } from "react";

type AnalyticsPreferences = {
  analytics: boolean;
  youtube: boolean;
};

export function useAnalytics() {
  const [preferences, setPreferences] = useState<AnalyticsPreferences>({ analytics: false, youtube: false });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load preferences on client-side
    const loadPreferences = () => {
      try {
        const savedPrefs = localStorage.getItem("va-preferences");
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs));
        }
      } catch (err) {
        console.error("Error loading analytics preferences:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const updatePreferences = (newPrefs: Partial<AnalyticsPreferences>) => {
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);
    localStorage.setItem("va-preferences", JSON.stringify(updatedPrefs));
    
    // You could also emit an event or call a function to update analytics settings
    if (updatedPrefs.analytics === false) {
      // Code to disable analytics tracking
      console.log("Analytics tracking disabled");
    }
  };

  const resetPreferences = () => {
    localStorage.removeItem("va-preferences");
    localStorage.removeItem("cookie-consent");
    setPreferences({ analytics: false, youtube: false });
    window.dispatchEvent(new Event("youtube-consent-changed"));
  };

  return {
    preferences,
    isLoaded,
    updatePreferences,
    resetPreferences,
  };
}
