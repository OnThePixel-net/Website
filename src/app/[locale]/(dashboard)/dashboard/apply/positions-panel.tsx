"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  ConfirmDelete,
  ErrorNote,
  Field,
  Modal,
  apiJson,
  apiVoid,
  inputClass,
  textareaClass,
  type Position,
  type PositionStatus,
} from "./apply-shared";

/** The editable part of a position; `id` is absent while it is being created. */
interface Draft {
  id?: number;
  name: string;
  slug: string;
  status: PositionStatus;
  descriptionEn: string;
  descriptionDe: string;
}

const EMPTY_DRAFT: Draft = {
  name: "",
  slug: "",
  status: "closed",
  descriptionEn: "",
  descriptionDe: "",
};

/**
 * Mirrors `normalizeApplySlug` on the server, so the field can show what the
 * name will become before it is saved. The server normalises again — this is a
 * preview, not the rule.
 */
function slugPreview(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/g, "");
}

/* --------------------------------------------------------------- editor -- */

function PositionModal({
  draft,
  onClose,
  onSaved,
}: {
  draft: Draft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Draft>(draft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editing = draft.id !== undefined;
  // An empty slug field means "derive it from the name", which is what the
  // create path in `lib/apply.ts` does; on an edit the current slug is shown.
  const effectiveSlug = slugPreview(form.slug || form.name);

  const save = async () => {
    if (!form.name.trim()) return setError("Name ist erforderlich.");
    setSaving(true);
    setError(null);
    try {
      await apiJson(
        editing
          ? `/api/dashboard/apply/positions/${draft.id}`
          : "/api/dashboard/apply/positions",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            slug: form.slug.trim() || form.name.trim(),
            status: form.status,
            descriptionEn: form.descriptionEn,
            descriptionDe: form.descriptionDe,
          }),
        },
      );
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  return (
    <Modal
      wide
      title={editing ? "Position bearbeiten" : "Neue Position"}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            Abbrechen
          </button>
          <button
            onClick={save}
            disabled={saving}
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
      }
    >
      {error && <ErrorNote message={error} />}

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="z. B. Moderator"
              className={inputClass}
            />
          </Field>
          <Field
            label="Slug"
            hint={
              effectiveSlug
                ? `Formular-Adresse: /apply/${effectiveSlug}`
                : "Aus Buchstaben und Ziffern; wird sonst aus dem Namen gebildet."
            }
          >
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder={slugPreview(form.name) || "moderator"}
              className={`${inputClass} font-mono text-xs`}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Beschreibung (Deutsch)"
            hint="Der Kartentext auf /apply."
          >
            <textarea
              rows={3}
              value={form.descriptionDe}
              onChange={(e) =>
                setForm({ ...form, descriptionDe: e.target.value })
              }
              placeholder="Wofür ist diese Position da?"
              className={textareaClass}
            />
          </Field>
          <Field
            label="Beschreibung (Englisch)"
            hint="Fehlt sie, zeigt die englische Seite den deutschen Text."
          >
            <textarea
              rows={3}
              value={form.descriptionEn}
              onChange={(e) =>
                setForm({ ...form, descriptionEn: e.target.value })
              }
              placeholder="What is this position about?"
              className={textareaClass}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div>
            <p className="text-sm font-medium text-white">
              Bewerbungen annehmen
            </p>
            <p className="mt-0.5 text-xs text-white/30">
              Geschlossene Positionen erscheinen auf /apply ausgegraut und ohne
              Formular.
            </p>
          </div>
          <Switch
            checked={form.status === "open"}
            onCheckedChange={(checked) =>
              setForm({ ...form, status: checked ? "open" : "closed" })
            }
            aria-label="Bewerbungen annehmen"
          />
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------------------------------------------------- card -- */

function PositionCard({
  position,
  busy,
  first,
  last,
  canWrite,
  canDelete,
  onToggle,
  onMove,
  onEdit,
  onDelete,
}: {
  position: Position;
  busy: boolean;
  first: boolean;
  last: boolean;
  canWrite: boolean;
  canDelete: boolean;
  onToggle: (next: PositionStatus) => void;
  onMove: (direction: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const open = position.status === "open";

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      {canWrite && (
        <div className="flex flex-col">
          <button
            onClick={() => onMove(-1)}
            disabled={first}
            title="Nach oben"
            className="rounded p-0.5 text-white/25 transition-colors hover:text-white disabled:opacity-20 disabled:hover:text-white/25"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={last}
            title="Nach unten"
            className="rounded p-0.5 text-white/25 transition-colors hover:text-white disabled:opacity-20 disabled:hover:text-white/25"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-base font-semibold text-white">
            {position.name}
          </h2>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              open
                ? "bg-green-500/15 text-green-400"
                : "bg-white/5 text-white/40"
            }`}
          >
            {open ? "Offen" : "Geschlossen"}
          </span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-bold text-white/40">
            {position.questions.length}{" "}
            {position.questions.length === 1 ? "Frage" : "Fragen"}
          </span>
        </div>
        <Link
          href={`/apply/${position.slug}`}
          target="_blank"
          className="mt-1 inline-flex items-center gap-1 text-xs text-white/30 transition-colors hover:text-white/60"
        >
          /apply/{position.slug} <ExternalLink size={11} />
        </Link>
        {(position.descriptionDe || position.descriptionEn) && (
          <p className="mt-1 line-clamp-2 text-xs text-white/30">
            {position.descriptionDe || position.descriptionEn}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {canWrite &&
          (busy ? (
            <Loader2 size={18} className="animate-spin text-white/30" />
          ) : (
            <Switch
              checked={open}
              onCheckedChange={(checked) =>
                onToggle(checked ? "open" : "closed")
              }
              aria-label={`Bewerbungen für ${position.name} ${
                open ? "schließen" : "öffnen"
              }`}
            />
          ))}
        {canWrite && (
          <button
            onClick={onEdit}
            title="Bearbeiten"
            className="rounded-lg p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Pencil size={14} />
          </button>
        )}
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
    </div>
  );
}

/* ---------------------------------------------------------------- panel -- */

export default function PositionsPanel({
  positions,
  loading,
  canWrite,
  canDelete,
  reload,
}: {
  positions: Position[];
  loading: boolean;
  /** Level 2+: may create, edit, reorder and open/close. */
  canWrite: boolean;
  /** Level 3: may delete a position. */
  canDelete: boolean;
  reload: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState<Position | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patch = async (id: number, body: Record<string, unknown>) => {
    await apiJson(`/api/dashboard/apply/positions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  const toggle = async (position: Position, next: PositionStatus) => {
    setBusyId(position.id);
    setError(null);
    try {
      await patch(position.id, { status: next });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  };

  /**
   * Move a position one place and renumber the whole list from its new order.
   *
   * Renumbering rather than swapping two `sortOrder` values: nothing stops two
   * positions from carrying the same number (an import, a hand-edited row), and
   * swapping equal values would visibly do nothing. Only the rows whose number
   * actually changes are written.
   */
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= positions.length) return;

    const next = [...positions];
    [next[index], next[target]] = [next[target], next[index]];

    setBusyId(positions[index].id);
    setError(null);
    try {
      await Promise.all(
        next.map((position, sortOrder) =>
          position.sortOrder === sortOrder
            ? Promise.resolve()
            : patch(position.id, { sortOrder }),
        ),
      );
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-white/40">
          {positions.filter((p) => p.status === "open").length} von{" "}
          {positions.length} Positionen offen
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => reload()}
            disabled={loading}
            title="Neu laden"
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          {canWrite && (
          <button
            onClick={() => setDraft({ ...EMPTY_DRAFT })}
            className="flex h-9 items-center gap-2 rounded-lg bg-green-500 px-4 text-sm font-semibold text-black transition-colors hover:bg-green-400"
          >
            <Plus size={15} /> Position
          </button>
          )}
        </div>
      </div>

      {error && <ErrorNote message={error} />}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
        </div>
      ) : positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] py-16">
          <ClipboardList size={32} className="text-white/10" />
          <p className="text-sm text-white/30">Noch keine Positionen angelegt.</p>
          {canWrite && (
            <button
              onClick={() => setDraft({ ...EMPTY_DRAFT })}
              className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
            >
              <Plus size={15} /> Erste Position anlegen
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {positions.map((position, index) => (
            <PositionCard
              key={position.id}
              position={position}
              busy={busyId === position.id}
              first={index === 0}
              last={index === positions.length - 1}
              canWrite={canWrite}
              canDelete={canDelete}
              onToggle={(next) => toggle(position, next)}
              onMove={(direction) => move(index, direction)}
              onEdit={() =>
                setDraft({
                  id: position.id,
                  name: position.name,
                  slug: position.slug,
                  status: position.status,
                  descriptionEn: position.descriptionEn,
                  descriptionDe: position.descriptionDe,
                })
              }
              onDelete={() => setDeleting(position)}
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-white/25">
        Neue Positionen werden geschlossen angelegt, damit erst die Fragen
        stehen können, bevor die erste Bewerbung eingeht.
      </p>

      {draft && (
        <PositionModal
          draft={draft}
          onClose={() => setDraft(null)}
          onSaved={async () => {
            setDraft(null);
            await reload();
          }}
        />
      )}

      {deleting && (
        <ConfirmDelete
          title="Position löschen"
          what={`Die Position „${deleting.name}“ und ihre ${deleting.questions.length} Fragen`}
          note={
            <>
              Die bereits eingegangenen Bewerbungen{" "}
              <span className="text-white/70">bleiben erhalten</span> — sie
              behalten Name, Slug und alle Antworten und stehen weiter unter
              „Bewerbungen“, dort markiert als „Position gelöscht“.
            </>
          }
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await apiVoid(`/api/dashboard/apply/positions/${deleting.id}`, {
              method: "DELETE",
            });
            setDeleting(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}
