"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ShieldCheck, LogIn, AlertCircle, Loader2 } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Error starting sign-in. Please try again.",
  OAuthCallback: "Error during sign-in callback. Please try again.",
  OAuthCreateAccount: "Could not create account.",
  EmailCreateAccount: "Could not create account.",
  Callback: "Error during authentication callback.",
  OAuthAccountNotLinked: "This account is already linked to a different provider.",
  AccessDenied: "Access denied. You do not have permission.",
  Default: "An unexpected error occurred. Please try again.",
};

/**
 * A role offered by the local development sign-in. The list is built on the
 * server (see `page.tsx`); in production it is always empty, so nothing below
 * renders and the page stays exactly as it is today.
 */
export interface DevRoleOption {
  id: string;
  label: string;
  description: string;
  /** Colour derived from the role's prefix, like a real Pocket ID group. */
  color: string;
}

/** Provider id of the development credentials provider (see `dev-auth.ts`). */
const DEV_LOGIN_PROVIDER_ID = "dev-role";

function OIDCIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v5l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 12a5 5 0 0 1 8.66-2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LoginClient({
  searchParams,
  devRoles,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
  devRoles: DevRoleOption[];
}) {
  const params = use(searchParams);
  const callbackUrl = params.callbackUrl ?? "/dashboard";
  const errorKey = params.error;
  const errorMessage = errorKey ? (ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.Default) : null;

  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  const handleDevSignIn = async (roleId: string) => {
    setLoading(`${DEV_LOGIN_PROVIDER_ID}:${roleId}`);
    await signIn(DEV_LOGIN_PROVIDER_ID, { role: roleId, callbackUrl });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-950 px-4">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute left-1/4 top-2/3 h-[300px] w-[400px] rounded-full bg-blue-500/4 blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10 shadow-[0_0_30px_rgba(0,222,109,0.1)]">
            <ShieldCheck size={26} className="text-green-400" />
          </div>
          <h1
            className="text-2xl font-black tracking-tight text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            OTP <span className="text-green-400">Admin</span>
          </h1>
          <p className="mt-1.5 text-sm text-white/40">
            Sign in to access the dashboard
          </p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-sm">
          {/* Top accent line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />

          <div className="p-6">
            {/* Error banner */}
            {errorMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">{errorMessage}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* OIDC Button — shown when env vars are configured */}
              <SignInButton
                provider="oidc"
                label="Continue with SSO"
                description="OpenID Connect"
                icon={<OIDCIcon />}
                colorClass="border-green-500/20 bg-green-500/10 hover:bg-green-500/15 hover:border-green-500/30 text-white"
                accentClass="text-green-400"
                loading={loading === "oidc"}
                onClick={() => handleSignIn("oidc")}
              />
            </div>

            {/* Development role picker. Whether it may appear at all is decided
                on the server (`devRoles` is empty unless the dev login is on).
                The extra `NODE_ENV` comparison is a build-time barrier on top:
                bundlers inline it in the client bundle too, so this markup is
                dropped from a production build instead of merely staying
                unrendered. */}
            {process.env.NODE_ENV !== "production" && devRoles.length > 0 && (
              <div className="mt-6 border-t border-white/5 pt-4">
                <p className="text-xs font-semibold text-white/40">
                  Development sign-in
                </p>
                <p className="mt-1 text-xs text-white/20">
                  Local development tool — pick a role to preview the dashboard.
                  Not available in production.
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  {devRoles.map((role) => (
                    <SignInButton
                      key={role.id}
                      provider={`${DEV_LOGIN_PROVIDER_ID}:${role.id}`}
                      label={role.label}
                      description={role.description}
                      icon={
                        <span className="flex h-5 w-5 items-center justify-center">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: role.color }}
                          />
                        </span>
                      }
                      colorClass="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 text-white"
                      accentClass="text-white/40"
                      loading={loading === `${DEV_LOGIN_PROVIDER_ID}:${role.id}`}
                      onClick={() => handleDevSignIn(role.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-white/5 pt-4">
              <p className="text-center text-xs text-white/20">
                Access restricted to authorized administrators only.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/15">
          <Link href="/" className="underline underline-offset-2 hover:text-white/30 transition-colors">
            ← Back to OnThePixel.net
          </Link>
        </p>
      </div>
    </div>
  );
}

function SignInButton({
  label,
  description,
  icon,
  colorClass,
  accentClass,
  loading,
  onClick,
}: {
  provider: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  accentClass: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`group flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 disabled:opacity-60 ${colorClass}`}
    >
      <div className={`shrink-0 ${accentClass}`}>
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          icon
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-white/40">{description}</p>
      </div>
      {!loading && (
        <LogIn
          size={16}
          className="shrink-0 text-white/20 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-white/40"
        />
      )}
    </button>
  );
}
