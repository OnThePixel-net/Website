"use client";

import React, { useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { LocaleLink } from "@/components/LocaleLink";
import { useTranslations } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/translations";
import CapWidget, { type CapWidgetHandle } from "@/components/CapWidget";

/** Mirrors `BUG_REPORT_CATEGORIES` in `lib/bug-reports.ts`. */
const CATEGORIES = ["server", "website", "discord", "other"] as const;
type Category = (typeof CATEGORIES)[number];

/** Mirrors `BUG_REPORT_LIMITS` in `lib/bug-reports.ts`. */
const LIMITS = {
  title: 120,
  description: 4000,
  steps: 3000,
  minecraftName: 16,
};
const MIN_DESCRIPTION = 20;
const MINECRAFT_NAME = /^[A-Za-z0-9_]{3,16}$/;

/**
 * Turn a rejected report into a message in the reader's language. Only the
 * server's `code` is translated; an unmapped code becomes the generic failure
 * text rather than the server's German `message`.
 */
function submitErrorMessage(payload: unknown, t: Translations): string {
  const body = (payload ?? {}) as { code?: unknown };
  const codes: Record<string, string> = t.bugReport.errors.codes;
  const code = typeof body.code === "string" ? body.code : "";
  return codes[code] ?? t.bugReport.errors.submitFailed;
}

const inputClass =
  "w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:border-green-500 focus:outline-none text-white placeholder-gray-600 transition-colors";

function RequiredMark({ title }: { title: string }) {
  return (
    <>
      {" "}
      <span className="text-red-400" title={title}>
        *
      </span>
    </>
  );
}

export default function BugReportForm() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [category, setCategory] = useState<Category>("server");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [minecraftName, setMinecraftName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<CapWidgetHandle>(null);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    captchaRef.current?.reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError(t.bugReport.errors.fillRequired);
      return;
    }
    if (description.trim().length < MIN_DESCRIPTION) {
      setError(t.bugReport.errors.descriptionTooShort);
      return;
    }
    if (minecraftName.trim() && !MINECRAFT_NAME.test(minecraftName.trim())) {
      setError(t.bugReport.errors.minecraftNameInvalid);
      return;
    }
    if (!captchaToken) {
      setError(t.bugReport.errors.captchaRequired);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/bug-report/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          description,
          steps,
          minecraftName,
          captchaToken,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(submitErrorMessage(err, t));
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.bugReport.errors.submitFailed,
      );
      resetCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const startOver = () => {
    setTitle("");
    setDescription("");
    setSteps("");
    setError(null);
    setCaptchaToken(null);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <section className="flex min-h-screen items-center bg-gray-950">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
            <svg
              className="h-8 w-8 text-white"
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
          <h1 className="mb-4 text-2xl font-bold">
            {t.bugReport.submittedTitle}
          </h1>
          <p className="mb-8 text-gray-400">{t.bugReport.submittedMessage}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={startOver}
              className="rounded-lg border border-white/10 px-6 py-3 text-white transition-colors hover:bg-white/5"
            >
              {t.bugReport.reportAnother}
            </button>
            <LocaleLink
              href="/"
              className="inline-block rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
            >
              {t.bugReport.backToHome}
            </LocaleLink>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-2 text-2xl font-bold">{t.bugReport.title}</h1>
          <p className="mb-6 text-gray-400">{t.bugReport.intro}</p>

          {/* Optional Discord identity — attached server-side from the session. */}
          <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            {session ? (
              <>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    {session.user?.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt=""
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    <span className="truncate text-sm text-gray-300">
                      {t.bugReport.signedInAs} {session.user?.name}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {t.bugReport.signedInHint}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="shrink-0 rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {t.bugReport.logout}
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-400">
                  {t.bugReport.signedOutHint}
                </span>
                <button
                  type="button"
                  onClick={() => signIn("discord")}
                  className="shrink-0 rounded-md bg-[#5865F2] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#4752C4]"
                >
                  {t.bugReport.login}
                </button>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                {t.bugReport.category}
                <RequiredMark title={t.bugReport.required} />
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CATEGORIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    aria-pressed={category === value}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      category === value
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    {t.bugReport.categories[value]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="bug-title"
                className="mb-1.5 block text-sm font-medium text-white"
              >
                {t.bugReport.titleLabel}
                <RequiredMark title={t.bugReport.required} />
              </label>
              <input
                id="bug-title"
                type="text"
                value={title}
                maxLength={LIMITS.title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.bugReport.titlePlaceholder}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="bug-description"
                className="mb-1.5 block text-sm font-medium text-white"
              >
                {t.bugReport.descriptionLabel}
                <RequiredMark title={t.bugReport.required} />
              </label>
              <textarea
                id="bug-description"
                value={description}
                maxLength={LIMITS.description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.bugReport.descriptionPlaceholder}
                rows={5}
                className={`${inputClass} resize-y`}
              />
            </div>

            <div>
              <label
                htmlFor="bug-steps"
                className="mb-1.5 block text-sm font-medium text-white"
              >
                {t.bugReport.stepsLabel}
              </label>
              <textarea
                id="bug-steps"
                value={steps}
                maxLength={LIMITS.steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder={t.bugReport.stepsPlaceholder}
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </div>

            <div>
              <label
                htmlFor="bug-minecraft-name"
                className="mb-1.5 block text-sm font-medium text-white"
              >
                {t.bugReport.minecraftNameLabel}
              </label>
              <input
                id="bug-minecraft-name"
                type="text"
                value={minecraftName}
                maxLength={LIMITS.minecraftName}
                onChange={(e) => setMinecraftName(e.target.value)}
                placeholder={t.bugReport.minecraftNamePlaceholder}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                {t.bugReport.securityVerification}
                <RequiredMark title={t.bugReport.required} />
              </label>
              <CapWidget
                ref={captchaRef}
                onSolve={(token) => {
                  setCaptchaToken(token);
                  setError(null);
                }}
                onReset={() => setCaptchaToken(null)}
                onError={() => {
                  setCaptchaToken(null);
                  setError(t.bugReport.errors.captchaError);
                }}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-700/50 bg-red-900/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !captchaToken}
              className="w-full rounded-lg bg-green-600 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? t.bugReport.submitting : t.bugReport.submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
