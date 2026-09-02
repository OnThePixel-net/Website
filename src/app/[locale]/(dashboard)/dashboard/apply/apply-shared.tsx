"use client";

import React from "react";
import { AlertCircle, Loader2, Trash2, X } from "lucide-react";

/**
 * Types and small building blocks shared by the three apply panels.
 *
 * The types mirror what `src/lib/apply.ts` returns, re-declared here because
 * that module is server-side (it opens the database) and must not be imported
 * into a client bundle — the same reason `ApplyApplicationField` is redeclared
 * over there. The classes below are lifted verbatim from the creators and news
 * dashboards so all four pages keep looking like one dashboard.
 */

/* --------------------------------------------------------------- types -- */

export type PositionStatus = "open" | "closed";
export type QuestionType = "text" | "textarea";
export type SubmissionStatus = "new" | "accepted" | "rejected";

export interface Question {
  id: number;
  positionId: number;
  fieldKey: string;
  type: QuestionType;
  required: boolean;
  sortOrder: number;
  labelEn: string;
  labelDe: string;
  placeholderEn: string;
  placeholderDe: string;
  descriptionEn: string;
  descriptionDe: string;
}

export interface Position {
  id: number;
  name: string;
  slug: string;
  status: PositionStatus;
  sortOrder: number;
  descriptionEn: string;
  descriptionDe: string;
  questions: Question[];
}

/** One answer with the question it answered, frozen at submission time. */
export interface Answer {
  questionId: number | null;
  fieldKey: string;
  type: string;
  labelEn: string;
  labelDe: string;
  value: string;
}

export interface Submission {
  id: number;
  /** `null` once the position it was sent for was deleted. */
  positionId: number | null;
  positionName: string;
  positionSlug: string;
  discordId: string;
  discordUsername: string;
  discordAvatarUrl: string | null;
  answers: Answer[];
  status: SubmissionStatus;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
}

/* ----------------------------------------------------------- vocabulary -- */

/** German label and badge colours per review status. */
export const SUBMISSION_STATUS: Record<
  SubmissionStatus,
  { label: string; badge: string }
> = {
  new: { label: "Neu", badge: "bg-purple-500/15 text-purple-300" },
  accepted: { label: "Angenommen", badge: "bg-green-500/15 text-green-400" },
  rejected: { label: "Abgelehnt", badge: "bg-red-500/15 text-red-400" },
};

/** The order the status filter and the status switcher list the states in. */
export const SUBMISSION_STATUSES: SubmissionStatus[] = [
  "new",
  "accepted",
  "rejected",
];

/** German label per field type, for the question editor's select. */
export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "text", label: "Einzeilig" },
  { value: "textarea", label: "Mehrzeilig" },
];

/* -------------------------------------------------------------- fetching -- */

/**
 * A dashboard request that turns a failed response into an `Error` carrying the
 * server's German message.
 *
 * Every panel needs the same three lines (parse, check `ok`, throw `body.error`
 * or a status fallback), and the apply routes all answer in the same shape, so
 * they are written once here.
 */
export async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Fehler ${res.status}`);
  return body as T;
}

/** As {@link apiJson}, for the routes that answer 204 with no body. */
export async function apiVoid(url: string, init?: RequestInit): Promise<void> {
  const res = await fetch(url, init);
  if (res.ok) return;
  const body = await res.json().catch(() => ({}));
  throw new Error(body.error ?? `Fehler ${res.status}`);
}

/* ------------------------------------------------------------ formatting -- */

/** `12.03.2025, 14:05` — the dashboard is German, so the dates are too. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * The German label of a question, falling back to the English one and finally
 * to the field key. Mirrors `pickApplyText` for the `de` case — an untranslated
 * question is better shown in English than as an empty row.
 */
export function questionLabel(q: {
  labelDe: string;
  labelEn: string;
  fieldKey: string;
}): string {
  return q.labelDe.trim() || q.labelEn.trim() || q.fieldKey;
}

/* -------------------------------------------------------------- controls -- */

export const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20";

export const textareaClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20";

export const selectClass =
  "h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors focus:border-green-500/50";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/40">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white/25">{hint}</p>}
    </div>
  );
}

/** The red notice box the other dashboards use for a failed request. */
export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Modal chrome: backdrop, panel, title row and close button. */
export function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Wider panel for the two-language editors and the application detail. */
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-10">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl ${
          wide ? "max-w-3xl" : "max-w-lg"
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        {children}
        {footer && (
          <div className="mt-6 flex items-center justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}

/**
 * Delete confirmation. `note` carries whatever the operator has to know before
 * confirming — for a position that is the fact that its applications survive.
 */
export function ConfirmDelete({
  title,
  what,
  note,
  onClose,
  onConfirm,
}: {
  title: string;
  what: string;
  note?: React.ReactNode;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        <h2
          className="text-lg font-bold text-white"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-white/50">
          <span className="font-medium text-white">{what}</span> wird dauerhaft
          entfernt.
        </p>
        {note && <div className="mt-3 text-sm text-white/40">{note}</div>}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            Abbrechen
          </button>
          <button
            onClick={run}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-400 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
