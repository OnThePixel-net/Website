"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaCog } from "react-icons/fa";
import CookieSettings from "@/components/cookie-settings";

export default function CookieSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-400 hover:text-green-500"
      >
        <FaCog className="mr-1 h-3 w-3" /> Cookie Settings
      </Button>
      <CookieSettings isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
