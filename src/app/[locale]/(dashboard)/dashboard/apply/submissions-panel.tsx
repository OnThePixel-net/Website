"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import {
  ConfirmDelete,
  ErrorNote,
  Modal,
  SUBMISSION_STATUS,
  SUBMISSION_STATUSES,
  apiJson,
  apiVoid,
  formatDateTime,
  selectClass,
  textareaClass,
  type Position,
  type Submission,
  type SubmissionStatus,
} from "./apply-shared";

/** How many applications one page shows; the route clamps anything larger. */
const PAGE_SIZE = 25;

/* ------------------------------------------------------------- applicant -- */

/**
 * Discord avatar with a fallback.
 *
 * `unoptimized` because the URL points at Discord's CDN, which the imgix loader
 * configured in `next.config.mjs` cannot rewrite — the same reason the creators
 * dashboard renders its skin heads unoptimized.
 */
function Avatar({ submission, size }: { submission: Submission; size: number }) {
  const [failed, setFailed] = useState(false);
  const url = submission.discordAvatarUrl;

  if (!url || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm font-semibold text-white/40"
        style={{ width: size, height: size }}
      >
        {submission.discordUsername.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={submission.discordUsername}
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

/** The status badge, plus the note that the position no longer exists. */
function PositionCell({ submission }: { submission: Submission }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm text-white/70">{submission.positionName}</p>
      {submission.positionId === null ? (
        // The application outlives its position: `position_id` is set to null on
        // delete while name and slug stay as they were at submission time. Such
        // a row is still shown — it is somebody's application — but it is
        // labelled, because the position filter above cannot reach it.
        <p className="truncate text-[11px] text-white/25">
          /{submission.positionSlug} · Position gelöscht
        </p>
      ) : (
        <p className="truncate text-[11px] text-white/25">
          /{submission.positionSlug}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- detail -- */

/**
 * One application in full: the frozen question/answer snapshot, the status
 * switcher and the internal note.
 *
 * The labels come from the answers themselves, never from the position's
 * current questions — that is what the snapshot is for, and it is the only way
 * an application stays readable after its questions were renamed or deleted.
 */
function SubmissionModal({
  submission,
  canWrite,
  onClose,
  onSaved,
}: {
  submission: Submission;
  canWrite: boolean;
  onClose: () => void;
  onSaved: (updated: Submission) => void;
}) {
  const [status, setStatus] = useState<SubmissionStatus>(submission.status);
  const [note, setNote] = useState(submission.internalNote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = status !== submission.status || note !== submission.internalNote;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = await apiJson<{ data: Submission }>(
        `/api/dashboard/apply/submissions/${submission.id}`,
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

  return (
    <Modal
      wide
      title={`Bewerbung von ${submission.discordUsername}`}
      onClose={onClose}
      footer={
        canWrite ? (
          <>
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            >
              Schließen
            </button>
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
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            Schließen
          </button>
        )
      }
    >
      {error && <ErrorNote message={error} />}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <Avatar submission={submission} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {submission.discordUsername}
            </p>
            <p className="truncate font-mono text-[11px] text-white/25">
              {submission.discordId}
            </p>
          </div>
          <div className="text-right text-xs text-white/40">
            <p>{submission.positionName}</p>
            <p className="text-white/25">
              Eingegangen: {formatDateTime(submission.createdAt)}
            </p>
            {submission.reviewedAt && (
              <p className="text-white/25">
                Bearbeitet: {formatDateTime(submission.reviewedAt)}
              </p>
            )}
          </div>
        </div>

        {submission.positionId === null && (
          <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/50">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>
              Die Position „{submission.positionName}“ (/{submission.positionSlug})
              wurde gelöscht. Die Bewerbung bleibt mit allen Antworten erhalten.
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {submission.answers.length === 0 ? (
            <p className="text-sm text-white/30">
              Diese Bewerbung enthält keine Antworten.
            </p>
          ) : (
            submission.answers.map((answer, i) => (
              <div
                key={`${answer.fieldKey}-${i}`}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <p className="text-xs font-medium text-white/40">
                  {answer.labelDe.trim() || answer.labelEn.trim() || answer.fieldKey}
                </p>
                {/* `whitespace-pre-wrap`: the textarea answers carry the line
                    breaks the applicant typed, and a portfolio list is unreadable
                    without them. */}
                <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-white/80">
                  {answer.value.trim() || (
                    <span className="text-white/25">Nicht beantwortet</span>
                  )}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/40">Status</label>
          <div className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/[0.02] p-1">
            {SUBMISSION_STATUSES.map((value) => (
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
                {SUBMISSION_STATUS[value].label}
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

function SubmissionRow({
  submission,
  canDelete,
  onOpen,
  onDelete,
}: {
  submission: Submission;
  canDelete: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const status = SUBMISSION_STATUS[submission.status];

  return (
    <tr className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]">
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <Avatar submission={submission} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {submission.discordUsername}
            </p>
            <p className="truncate font-mono text-[11px] text-white/25">
              {submission.discordId}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <PositionCell submission={submission} />
      </td>
      <td className="px-3 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${status.badge}`}
        >
          {status.label}
        </span>
      </td>
      <td className="px-3 py-3 text-sm text-white/40">
        {formatDateTime(submission.createdAt)}
      </td>
      <td className="py-3 pl-3 pr-4">
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

/* ---------------------------------------------------------------- panel -- */

export default function SubmissionsPanel({
  positions,
  canWrite,
  canDelete,
}: {
  positions: Position[];
  /** Level 2+: may set a status and write an internal note. */
  canWrite: boolean;
  /** Level 3: may delete an application. */
  canDelete: boolean;
}) {
  const [items, setItems] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [positionId, setPositionId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Submission | null>(null);
  const [deleting, setDeleting] = useState<Submission | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      if (positionId) params.set("positionId", positionId);
      if (status) params.set("status", status);

      const body = await apiJson<{ data: Submission[]; total: number }>(
        `/api/dashboard/apply/submissions?${params}`,
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
  }, [offset, positionId, status]);

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

  /** Applications on this page whose position was deleted; see `PositionCell`. */
  const orphaned = items.filter((s) => s.positionId === null).length;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={positionId}
            onChange={(e) => setFilter(() => setPositionId(e.target.value))}
            className={selectClass}
            aria-label="Nach Position filtern"
          >
            <option value="" className="bg-gray-900">
              Alle Positionen
            </option>
            {positions.map((p) => (
              <option key={p.id} value={String(p.id)} className="bg-gray-900">
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setFilter(() => setStatus(e.target.value))}
            className={selectClass}
            aria-label="Nach Status filtern"
          >
            <option value="" className="bg-gray-900">
              Alle Status
            </option>
            {SUBMISSION_STATUSES.map((value) => (
              <option key={value} value={value} className="bg-gray-900">
                {SUBMISSION_STATUS[value].label}
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
          {total === 0 ? "Keine Bewerbungen" : `${from}–${to} von ${total}`}
          {orphaned > 0 && (
            <span className="text-white/25">
              {" "}
              · {orphaned} zu gelöschten Positionen
            </span>
          )}
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
            <ClipboardList size={32} className="text-white/10" />
            <p className="text-sm text-white/30">
              {positionId || status
                ? "Keine Bewerbungen für diesen Filter."
                : "Es sind noch keine Bewerbungen eingegangen."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Bewerber
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Position
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Eingegangen
                  </th>
                  <th className="py-3 pl-3 pr-4 text-right text-xs font-medium uppercase tracking-wider text-white/30">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((submission) => (
                  <SubmissionRow
                    key={submission.id}
                    submission={submission}
                    canDelete={canDelete}
                    onOpen={() => setDetail(submission)}
                    onDelete={() => setDeleting(submission)}
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
        <SubmissionModal
          submission={detail}
          canWrite={canWrite}
          onClose={() => setDetail(null)}
          onSaved={(updated) => {
            // The row is patched in place rather than the page reloaded: a
            // status change under an active status filter would otherwise make
            // the application jump out of the list while it is still open.
            setItems((prev) =>
              prev.map((s) => (s.id === updated.id ? updated : s)),
            );
            setDetail(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDelete
          title="Bewerbung löschen"
          what={`Die Bewerbung von ${deleting.discordUsername}`}
          note="Die Antworten sind danach nicht mehr wiederherstellbar."
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await apiVoid(`/api/dashboard/apply/submissions/${deleting.id}`, {
              method: "DELETE",
            });
            setDeleting(null);
            // Deleting the only row of a later page would leave the view on an
            // offset past the end; step back a page instead of showing nothing.
            if (items.length === 1 && offset > 0) setOffset(offset - PAGE_SIZE);
            else load();
          }}
        />
      )}
    </div>
  );
}
