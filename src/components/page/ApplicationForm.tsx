"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useSession, signIn } from "next-auth/react";

export interface ApplicationField {
  id: string;
  label: string;
  type: "text" | "textarea";
  placeholder?: string;
  description?: string;
}

interface ApplicationFormProps {
  position: string;
  fields: ApplicationField[];
  apiEndpoint: string;
}

const DiscordIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
  </svg>
);

export default function ApplicationForm({
  position,
  fields,
  apiEndpoint,
}: ApplicationFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      setError("Please login with Discord first.");
      return;
    }

    for (const field of fields) {
      if (!formData[field.id]?.trim()) {
        setError(`Please fill out: ${field.label}`);
        return;
      }
    }

    if (!captchaToken) {
      setError("Please complete the captcha verification.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/apply/api/${apiEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationData: formData,
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
        err instanceof Error ? err.message : "Failed to submit. Please try again."
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
          <h1 className="text-2xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-gray-400 mb-8">
            Thank you for your interest! We&apos;ll review your application and get back to you as soon as possible.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Home
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
            href="/apply"
            className="inline-block mb-6 text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
          >
            ← Back to Positions
          </Link>

          <h1 className="text-2xl font-bold mb-2">{position} Application</h1>
          <p className="text-gray-400 mb-6">
            Fill out the form below — we'll get back to you as soon as possible.
          </p>

          {/* Discord auth bar */}
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
                <span className="text-sm text-gray-400">Discord login erforderlich</span>
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
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-white mb-1.5">
                  {field.label}{" "}
                  <span className="text-red-400" title="Required">*</span>
                </label>
                {field.description && (
                  <p className="text-xs text-gray-500 mb-1.5">{field.description}</p>
                )}
                {field.type === "textarea" ? (
                  <textarea
                    value={formData[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-green-500 focus:outline-none text-white placeholder-gray-600 resize-none transition-colors"
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-green-500 focus:outline-none text-white placeholder-gray-600 transition-colors"
                  />
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Security Verification{" "}
                <span className="text-red-400" title="Required">*</span>
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
                  setError("Captcha error. Please try again.");
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
              disabled={isSubmitting || !captchaToken || !session}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
