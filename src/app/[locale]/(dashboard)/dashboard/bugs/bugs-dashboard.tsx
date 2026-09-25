"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Bug,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { LEVEL_DELETE, LEVEL_WRITE } from "@/lib/permissions";
import { usePermissionLevel } from "@/lib/use-permission";
import AuthGuard from "../auth-guard";
import {
  ConfirmDelete,
  ErrorNote,
  Modal,
  apiJson,
  apiVoid,
  formatDateTime,
  selectClass,
  textareaClass,
} from "../apply/apply-shared";

/**
 * The bug report inbox: what came in through `/bug-report`, filterable by
 * status and category, with a detail view for triage.
 *
 * Types mirror `src/lib/bug-reports.ts`, re-declared because that module opens
 * the database and must not reach a client bundle.
 */

type BugStatus = "new" | "in_progress" | "fixed" | "rejected";
type BugCategory = "server" | "website" | "discord" | "other";

interface BugReport {
  id: number;
  category: BugCategory;
  title: string;
  description: string;
  steps: string;
  minecraftName: string;
  discordId: string | null;
  discordUsername: string | null;
  discordAvatarUrl: string | null;
  status: BugStatus;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS: Record<BugStatus, { label: string; badge: string }> = {
  new: { label: "Neu", badge: "bg-purple-500/15 text-purple-300" },
  in_progress: {
    label: "In Arbeit",
    badge: "bg-yellow-500/15 text-yellow-300",
  },
  fixed: { label: "Behoben", badge: "bg-green-500/15 text-green-400" },
  rejected: { label: "Abgelehnt", badge: "bg-red-500/15 text-red-400" },
};

const STATUSES: BugStatus[] = ["new", "in_progress", "fixed", "rejected"];

const CATEGORY: Record<BugCategory, string> = {
  server: "Minecraft-Server",
  website: "Website",
  discord: "Discord",
  other: "Sonstiges",
};

const CATEGORIES: BugCategory[] = ["server", "website", "discord", "other"];

/** How many reports one page shows; the route clamps anything larger. */
const PAGE_SIZE = 25;

/* -------------------------------------------------------------- reporter -- */

/**
 * Discord avatar with a fallback. `unoptimized` because the URL points at
 * Discord's CDN, which the configured image loader cannot rewrite.
 */
function Avatar({ report, size }: { report: BugReport; size: number }) {
  const [failed, setFailed] = useState(false);
  const url = report.discordAvatarUrl;
  const name = report.discordUsername || report.minecraftName || "?";

  if (!url || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm font-semibold text-white/40"
        style={{ width: size, height: size }}
      >
        {name.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={name}
      width={size}
      height={size}
      sizes={`${size}px`}
      className="shrink-0 rounded-lg"
      style={{ width: size, height: size }}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

/** Who sent it: Discord name if signed in, else the Minecraft name, else anonymous. */
function reporterLabel(report: BugReport): string {
  return report.discordUsername || report.minecraftName || "Anonym";
}

/* ---------------------------------------------------------------- detail -- */

function ReportModal({
  report,
  canWrite,
  onClose,
  onSaved,
}: {
  report: BugReport;
  canWrite: boolean;
  onClose: () => void;
  onSaved: (updated: BugReport) => void;
}) {
  const [status, setStatus] = useState<BugStatus>(report.status);
  const [note, setNote] = useState(report.internalNote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = status !== report.status || note !== report.internalNote;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = await apiJson<{ data: BugReport }>(
        `/api/dashboard/bugs/${report.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, internalNote: note }),
        },
      );
      onSaved(body.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  const closeButton = (
    <button
      onClick={onClose}
      className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
    >
      Schließen
    </button>
  );

  return (
    <Modal
      wide
      title={report.title}
      onClose={onClose}
      footer={
        canWrite ? (
          <>
            {closeButton}
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-green-400 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Speichern
            </button>
          </>
        ) : (
          closeButton
        )
      }
    >
      {error && <ErrorNote message={error} />}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <Avatar report={report} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {reporterLabel(report)}
            </p>
            {report.discordId ? (
              <p className="truncate font-mono text-[11px] text-white/25">
                Discord: {report.discordId}
              </p>
            ) : (
              <p className="truncate text-[11px] text-white/25">
                Nicht mit Discord angemeldet
              </p>
            )}
            {report.minecraftName && (
              <p className="truncate text-[11px] text-white/40">
                Minecraft: {report.minecraftName}
              </p>
            )}
          </div>
          <div className="text-right text-xs text-white/40">
            <p>{CATEGORY[report.category]}</p>
            <p className="text-white/25">
              Eingegangen: {formatDateTime(report.createdAt)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs font-medium text-white/40">Beschreibung</p>
          <p className="mt-1.5 text-sm break-words whitespace-pre-wrap text-white/80">
            {report.description}
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs font-medium text-white/40">
            Schritte zum Nachstellen
          </p>
          <p className="mt-1.5 text-sm break-words whitespace-pre-wrap text-white/80">
            {report.steps.trim() || (
              <span className="text-white/25">Nicht angegeben</span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/40">Status</label>
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/8 bg-white/[0.02] p-1">
            {STATUSES.map((value) => (
              <button
                key={value}
                type="button"
                disabled={!canWrite}
                onClick={() => setStatus(value)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:cursor-not-allowed ${
                  status === value
                    ? "bg-green-500 text-black shadow"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {STATUS[value].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/40">
            Interne Notiz
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={!canWrite}
            rows={3}
            placeholder="Nur im Dashboard sichtbar."
            className={`${textareaClass} disabled:cursor-not-allowed`}
          />
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ row -- */

function ReportRow({
  report,
  canDelete,
  onOpen,
  onDelete,
}: {
  report: BugReport;
  canDelete: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const status = STATUS[report.status];

  return (
    <tr className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]">
      <td className="py-3 pr-3 pl-4">
        <button onClick={onOpen} className="block max-w-sm min-w-0 text-left">
          <p className="truncate text-sm font-medium text-white">
            {report.title}
          </p>
          <p className="truncate text-[11px] text-white/25">
            {report.description}
          </p>
        </button>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Avatar report={report} size={28} />
          <span className="truncate text-sm text-white/60">
            {reporterLabel(report)}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-white/60">
        {CATEGORY[report.category]}
      </td>
      <td className="px-3 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${status.badge}`}
        >
          {status.label}
        </span>
      </td>
      <td className="px-3 py-3 text-sm text-white/40">
        {formatDateTime(report.createdAt)}
      </td>
      <td className="py-3 pr-4 pl-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onOpen}
            title="Ansehen"
            className="rounded-lg p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Eye size={14} />
          </button>
          {canDelete && (
            <button
              onClick={onDelete}
              title="Löschen"
              className="rounded-lg p-2 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ---------------------------------------------------------------- page -- */

function BugsDashboardContent() {
  // Level 1 reads, level 2 sets status and note, level 3 deletes. The routes
  // enforce the same; hiding the controls only avoids buttons that answer 403.
  const level = usePermissionLevel("bugs");
  const canWrite = level >= LEVEL_WRITE;
  const canDelete = level >= LEVEL_DELETE;

  const [items, setItems] = useState<BugReport[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<BugReport | null>(null);
  const [deleting, setDeleting] = useState<BugReport | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      if (status) params.set("status", status);
      if (category) params.set("category", category);

      const body = await apiJson<{ data: BugReport[]; total: number }>(
        `/api/dashboard/bugs?${params}`,
      );
      setItems(body.data ?? []);
      setTotal(body.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [offset, status, category]);

  useEffect(() => {
    load();
  }, [load]);

  /** Changing a filter always returns to the first page. */
  const setFilter = (apply: () => void) => {
    apply();
    setOffset(0);
  };

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + items.length, total);

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Bug-Reports
        </h1>
        <p className="mt-0.5 text-sm text-white/40">
          Fehlermeldungen, die über /bug-report eingegangen sind.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setFilter(() => setStatus(e.target.value))}
            className={selectClass}
            aria-label="Nach Status filtern"
          >
            <option value="" className="bg-gray-900">
              Alle Status
            </option>
            {STATUSES.map((value) => (
              <option key={value} value={value} className="bg-gray-900">
                {STATUS[value].label}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setFilter(() => setCategory(e.target.value))}
            className={selectClass}
            aria-label="Nach Kategorie filtern"
          >
            <option value="" className="bg-gray-900">
              Alle Kategorien
            </option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value} className="bg-gray-900">
                {CATEGORY[value]}
              </option>
            ))}
          </select>

          <button
            onClick={load}
            disabled={loading}
            title="Neu laden"
            className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <p className="text-sm text-white/40">
          {total === 0 ? "Keine Bug-Reports" : `${from}–${to} von ${total}`}
        </p>
      </div>

      {error && <ErrorNote message={error} />}

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Bug size={32} className="text-white/10" />
            <p className="text-sm text-white/30">
              {status || category
                ? "Keine Bug-Reports für diesen Filter."
                : "Es sind noch keine Bug-Reports eingegangen."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 pr-3 pl-4 text-left text-xs font-medium tracking-wider text-white/30 uppercase">
                    Titel
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white/30 uppercase">
                    Von
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white/30 uppercase">
                    Kategorie
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white/30 uppercase">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white/30 uppercase">
                    Eingegangen
                  </th>
                  <th className="py-3 pr-4 pl-3 text-right text-xs font-medium tracking-wider text-white/30 uppercase">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((report) => (
                  <ReportRow
                    key={report.id}
                    report={report}
                    canDelete={canDelete}
                    onOpen={() => setDetail(report)}
                    onDelete={() => setDeleting(report)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={() => setOffset(Math.max(offset - PAGE_SIZE, 0))}
            disabled={offset === 0 || loading}
            className="flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft size={14} /> Zurück
          </button>
          <button
            onClick={() => setOffset(offset + PAGE_SIZE)}
            disabled={offset + items.length >= total || loading}
            className="flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            Weiter <ChevronRight size={14} />
          </button>
        </div>
      )}

      {detail && (
        <ReportModal
          report={detail}
          canWrite={canWrite}
          onClose={() => setDetail(null)}
          onSaved={(updated) => {
            // Patched in place so a status change under an active filter does
            // not make the row vanish while it is still open.
            setItems((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r)),
            );
            setDetail(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDelete
          title="Bug-Report löschen"
          what={`„${deleting.title}“`}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await apiVoid(`/api/dashboard/bugs/${deleting.id}`, {
              method: "DELETE",
            });
            setDeleting(null);
            if (items.length === 1 && offset > 0) setOffset(offset - PAGE_SIZE);
            else load();
          }}
        />
      )}
    </div>
  );
}

export default function BugsDashboard() {
  return (
    <AuthGuard area="bugs">
      <BugsDashboardContent />
    </AuthGuard>
  );
}
