"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAnalytics } from "@/hooks/use-analytics";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

type CookieSettingsProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CookieSettings({ isOpen, onClose }: CookieSettingsProps) {
  const t = useTranslations();
  const { preferences, updatePreferences, resetPreferences } = useAnalytics();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(preferences.analytics);
  
  if (!isOpen) return null;

  const handleSave = () => {
    updatePreferences({ analytics: analyticsEnabled });
    onClose();
  };

  const handleReset = () => {
    resetPreferences();
    setAnalyticsEnabled(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-green-700/30 bg-gray-900">
        <CardHeader>
          <CardTitle>{t.cookieSettings.title}</CardTitle>
          <CardDescription>{t.cookieSettings.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="essential" className="text-base font-medium">{t.cookieSettings.essentialLabel}</Label>
                <p className="text-sm text-gray-400">{t.cookieSettings.essentialDesc}</p>
              </div>
              <Switch id="essential" checked disabled />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics" className="text-base font-medium">{t.cookieSettings.analyticsLabel}</Label>
                <p className="text-sm text-gray-400">{t.cookieSettings.analyticsDesc}</p>
              </div>
              <Switch
                id="analytics"
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
              />
            </div>
          </div>

          <div className="rounded-md bg-gray-800/50 p-4">
            <h4 className="font-medium mb-2">{t.cookieSettings.howWeUseTitle}</h4>
            <p className="text-sm text-gray-400">{t.cookieSettings.howWeUseText}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} className="border-gray-700 hover:bg-gray-800">
            {t.cookieSettings.reset}
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="border-gray-700 hover:bg-gray-800">
              {t.cookieSettings.cancel}
            </Button>
            <Button onClick={handleSave} className="bg-green-700 hover:bg-green-600">
              {t.cookieSettings.save}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
