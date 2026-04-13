"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useSession, signIn } from "next-auth/react";

const DiscordIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
  </svg>
);

export default function RedeemPage() {
  const { data: session } = useSession();
  const [code, setCode] = useState("");
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError("Please enter your redemption code.");
      return;
    }

    if (!minecraftUsername.trim()) {
      setError("Please enter your Minecraft username.");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the captcha verification.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/redeem/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          minecraftUsername: minecraftUsername.trim(),
          captchaToken,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || `Error ${response.status}`);
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to redeem. Please try again."
      );
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="bg-gray-950 min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Code erfolgreich eingelöst!</h1>
          <p className="text-gray-400 mb-8">
            Dein Code wurde erfolgreich eingelöst. Die Belohnung wird bald auf deinem Konto gutgeschrieben.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-950 min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto">
          <Link
            href="/"
            className="inline-block mb-6 text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
          >
            ← Zurück zur Startseite
          </Link>

          <h1 className="text-2xl font-bold mb-2">Code einlösen</h1>
          <p className="text-gray-400 mb-6">
            Gib deinen Code und deinen Minecraft-Benutzernamen ein, um deine Belohnung zu erhalten.
          </p>

          {/* Discord auth bar (optional) */}
          <div className="mb-6 flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
            {session ? (
              <>
                <div className="flex items-center gap-2.5">
                  {session.user?.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />
                  )}
                  <span className="text-sm text-gray-300">
                    {session.user?.name}
                  </span>
                </div>
                <span className="text-xs text-[#5865F2] font-medium">Discord verifiziert ✓</span>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-400">Optional: Mit Discord verknüpfen</span>
                <button
                  onClick={() => signIn("discord")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm rounded-md transition-colors font-medium"
                >
                  <DiscordIcon />
                  Login
                </button>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Code <span className="text-red-400" title="Pflichtfeld">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="z.B. PIXEL-XXXX-XXXX"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-green-500 focus:outline-none text-white placeholder-gray-600 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Minecraft-Benutzername <span className="text-red-400" title="Pflichtfeld">*</span>
              </label>
              <input
                type="text"
                value={minecraftUsername}
                onChange={(e) => {
                  setMinecraftUsername(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="DeinMinecraftName"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-green-500 focus:outline-none text-white placeholder-gray-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Sicherheitsüberprüfung <span className="text-red-400" title="Pflichtfeld">*</span>
              </label>
              <HCaptcha
                ref={captchaRef}
                sitekey="90d0f166-7370-42a6-8836-8f3c9af8615a"
                onVerify={(token) => {
                  setCaptchaToken(token);
                  setError(null);
                }}
                onExpire={() => setCaptchaToken(null)}
                onError={() => {
                  setCaptchaToken(null);
                  setError("Captcha-Fehler. Bitte versuche es erneut.");
                }}
                theme="dark"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !captchaToken}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Wird eingelöst..." : "Code einlösen"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
