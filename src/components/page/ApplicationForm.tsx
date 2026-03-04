"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";

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

export default function ApplicationForm({
  position,
  fields,
  apiEndpoint,
}: ApplicationFormProps) {
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
      const response = await fetch(`https://api.onthepixel.net/${apiEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position,
          applicationData: formData,
          captchaToken,
          submittedAt: new Date().toISOString(),
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
          <p className="text-gray-400 mb-8">
            Fill out the form below — we'll get back to you as soon as possible.
          </p>

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
              disabled={isSubmitting || !captchaToken}
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
