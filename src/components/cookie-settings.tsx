"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAnalytics } from "@/hooks/use-analytics";

type CookieSettingsProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CookieSettings({ isOpen, onClose }: CookieSettingsProps) {
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
          <CardTitle>Cookie Settings</CardTitle>
          <CardDescription>Manage your cookie preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="essential" className="text-base font-medium">Essential Cookies</Label>
                <p className="text-sm text-gray-400">Required for the website to function properly. Cannot be disabled.</p>
              </div>
              <Switch id="essential" checked disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics" className="text-base font-medium">Analytics Cookies</Label>
                <p className="text-sm text-gray-400">Help us understand how visitors interact with our website.</p>
              </div>
              <Switch 
                id="analytics" 
                checked={analyticsEnabled} 
                onCheckedChange={setAnalyticsEnabled} 
              />
            </div>
          </div>
          
          <div className="rounded-md bg-gray-800/50 p-4">
            <h4 className="font-medium mb-2">How we use cookies</h4>
            <p className="text-sm text-gray-400">
              OnThePixel.net uses cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
              We use Vercel Analytics to collect information about how visitors use our website. This data is anonymized and helps us improve our services.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} className="border-gray-700 hover:bg-gray-800">
            Reset Preferences
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="border-gray-700 hover:bg-gray-800">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-green-700 hover:bg-green-600">
              Save Preferences
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
