"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
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
  QUESTION_TYPES,
  apiJson,
  apiVoid,
  inputClass,
  questionLabel,
  selectClass,
  textareaClass,
  type Position,
  type Question,
  type QuestionType,
} from "./apply-shared";

/** The editable part of a question; `id` is absent while it is being created. */
interface Draft {
  id?: number;
  fieldKey: string;
  type: QuestionType;
  required: boolean;
  labelDe: string;
  labelEn: string;
  placeholderDe: string;
  placeholderEn: string;
  descriptionDe: string;
  descriptionEn: string;
}

const EMPTY_DRAFT: Draft = {
  fieldKey: "",
  type: "text",
  required: true,
  labelDe: "",
  labelEn: "",
  placeholderDe: "",
  placeholderEn: "",
  descriptionDe: "",
  descriptionEn: "",
};

function toDraft(question: Question): Draft {
  return {
    id: question.id,
    fieldKey: question.fieldKey,
    type: question.type,
    required: question.required,
    labelDe: question.labelDe,
    labelEn: question.labelEn,
    placeholderDe: question.placeholderDe,
    placeholderEn: question.placeholderEn,
    descriptionDe: question.descriptionDe,
    descriptionEn: question.descriptionEn,
  };
}

/**
 * Mirrors `normalizeApplyFieldKey` on the server so the field can preview what
 * an empty key will become. The server normalises again — this is a preview.
 */
function fieldKeyPreview(value: string): string {
  const key = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64)
    .replace(/_+$/g, "");
  if (!key) return "";
  return /^[0-9]/.test(key) ? `f_${key}` : key;
}

/* --------------------------------------------------------------- editor -- */

/**
 * The bilingual question editor.
 *
 * Both languages are edited side by side rather than behind a language switch:
 * a question is two short lines per field, and seeing the German next to the
 * English is what makes a missing translation obvious.
 */
function QuestionModal({
  draft,
  positionId,
  onClose,
  onSaved,
}: {
  draft: Draft;
  positionId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Draft>(draft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editing = draft.id !== undefined;
  const set = (patch: Partial<Draft>) => setForm({ ...form, ...patch });

  // The key is derived from the English label when left empty, exactly as
  // `createApplyQuestion` does it — the preview must not promise otherwise.
  const effectiveKey = fieldKeyPreview(
    form.fieldKey || form.labelEn || form.labelDe,
  );

  const save = async () => {
    if (!form.labelDe.trim() && !form.labelEn.trim())
      return setError(
        "Die Frage braucht mindestens eine Beschriftung (Deutsch oder Englisch).",
      );

    setSaving(true);
    setError(null);
    try {
      const payload = {
        // On an edit the key is sent as typed; an empty one would be rejected,
        // so the existing key is kept when the operator clears the field.
        fieldKey: form.fieldKey.trim() || effectiveKey,
        type: form.type,
        required: form.required,
        labelDe: form.labelDe,
        labelEn: form.labelEn,
        placeholderDe: form.placeholderDe,
        placeholderEn: form.placeholderEn,
        descriptionDe: form.descriptionDe,
        descriptionEn: form.descriptionEn,
      };
      await apiJson(
        editing
          ? `/api/dashboard/apply/questions/${draft.id}`
          : "/api/dashboard/apply/questions",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing ? payload : { positionId, ...payload }),
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
      title={editing ? "Frage bearbeiten" : "Neue Frage"}
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
          <Field label="Beschriftung (Deutsch)">
            <input
              type="text"
              value={form.labelDe}
              onChange={(e) => set({ labelDe: e.target.value })}
              placeholder="z. B. Minecraft-Benutzername"
              className={inputClass}
            />
          </Field>
          <Field label="Beschriftung (Englisch)">
            <input
              type="text"
              value={form.labelEn}
              onChange={(e) => set({ labelEn: e.target.value })}
              placeholder="e. g. Minecraft Username"
              className={inputClass}
            />
          </Field>

          <Field label="Platzhalter (Deutsch)">
            <input
              type="text"
              value={form.placeholderDe}
              onChange={(e) => set({ placeholderDe: e.target.value })}
              placeholder="Optional"
              className={inputClass}
            />
          </Field>
          <Field label="Platzhalter (Englisch)">
            <input
              type="text"
              value={form.placeholderEn}
              onChange={(e) => set({ placeholderEn: e.target.value })}
              placeholder="Optional"
              className={inputClass}
            />
          </Field>

          <Field label="Hinweistext (Deutsch)">
            <textarea
              rows={2}
              value={form.descriptionDe}
              onChange={(e) => set({ descriptionDe: e.target.value })}
              placeholder="Optional — steht unter dem Feld."
              className={textareaClass}
            />
          </Field>
          <Field label="Hinweistext (Englisch)">
            <textarea
              rows={2}
              value={form.descriptionEn}
              onChange={(e) => set({ descriptionEn: e.target.value })}
              placeholder="Optional"
              className={textareaClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Feldschlüssel"
            hint={
              editing
                ? "Ändert nichts an bereits eingegangenen Bewerbungen."
                : effectiveKey
                  ? `Wird gespeichert als: ${effectiveKey}`
                  : "Wird sonst aus der Beschriftung gebildet."
            }
          >
            <input
              type="text"
              value={form.fieldKey}
              onChange={(e) => set({ fieldKey: e.target.value })}
              placeholder={fieldKeyPreview(form.labelEn) || "minecraft_username"}
              className={`${inputClass} font-mono text-xs`}
            />
          </Field>
          <Field label="Feldtyp">
            <select
              value={form.type}
              onChange={(e) => set({ type: e.target.value as QuestionType })}
              className={`${selectClass} w-full`}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-gray-900">
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div>
            <p className="text-sm font-medium text-white">Pflichtfeld</p>
            <p className="mt-0.5 text-xs text-white/30">
              Ohne Antwort nimmt das Formular die Bewerbung nicht an.
            </p>
          </div>
          <Switch
            checked={form.required}
            onCheckedChange={(checked) => set({ required: checked })}
            aria-label="Pflichtfeld"
          />
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ row -- */

function QuestionRow({
  question,
  first,
  last,
  canWrite,
  canDelete,
  onMove,
  onEdit,
  onDelete,
}: {
  question: Question;
  first: boolean;
  last: boolean;
  canWrite: boolean;
  canDelete: boolean;
  onMove: (direction: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
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
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-white">
            {questionLabel(question)}
          </p>
          {question.required && (
            <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] font-bold text-green-400">
              Pflicht
            </span>
          )}
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-bold text-white/40">
            {QUESTION_TYPES.find((t) => t.value === question.type)?.label ??
              question.type}
          </span>
          {!question.labelEn.trim() && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-bold text-white/40">
              EN fehlt
            </span>
          )}
          {!question.labelDe.trim() && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-bold text-white/40">
              DE fehlt
            </span>
          )}
        </div>
        <p className="mt-1 truncate font-mono text-[11px] text-white/25">
          {question.fieldKey}
          {question.labelEn.trim() && question.labelDe.trim() && (
            <span className="font-sans"> · {question.labelEn}</span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
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

export default function QuestionsPanel({
  positions,
  loading,
  canWrite,
  canDelete,
  reload,
}: {
  positions: Position[];
  loading: boolean;
  /** Level 2+: may add, edit and reorder questions. */
  canWrite: boolean;
  /** Level 3: may delete a question. */
  canDelete: boolean;
  reload: () => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState<Question | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // The selection is derived rather than synchronised in an effect: an id that
  // is not (or no longer) in the list falls back to the first position, which
  // covers both the initial render and a position deleted in another tab —
  // without a render pass in which the panel shows nothing.
  const position =
    positions.find((p) => p.id === selectedId) ?? positions[0] ?? null;
  const questions = position?.questions ?? [];

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (!position || target < 0 || target >= questions.length) return;

    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];

    setBusy(true);
    setError(null);
    try {
      await apiJson("/api/dashboard/apply/questions/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionId: position.id,
          ids: next.map((q) => q.id),
        }),
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <select
            value={position?.id ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            disabled={positions.length === 0}
            className={selectClass}
            aria-label="Position wählen"
          >
            {positions.map((p) => (
              <option key={p.id} value={p.id} className="bg-gray-900">
                {p.name} ({p.questions.length})
              </option>
            ))}
            {positions.length === 0 && (
              <option value="" className="bg-gray-900">
                Keine Position
              </option>
            )}
          </select>
          {busy && <Loader2 size={16} className="animate-spin text-white/30" />}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => reload()}
            disabled={loading}
            title="Neu laden"
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          {canWrite && position && (
            <button
              onClick={() => setDraft({ ...EMPTY_DRAFT })}
              className="flex h-9 items-center gap-2 rounded-lg bg-green-500 px-4 text-sm font-semibold text-black transition-colors hover:bg-green-400"
            >
              <Plus size={15} /> Frage
            </button>
          )}
        </div>
      </div>

      {error && <ErrorNote message={error} />}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
        </div>
      ) : !position ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] py-16">
          <HelpCircle size={32} className="text-white/10" />
          <p className="text-sm text-white/30">
            Lege zuerst unter „Positionen“ eine Position an.
          </p>
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] py-16">
          <HelpCircle size={32} className="text-white/10" />
          <p className="text-sm text-white/30">
            „{position.name}“ stellt noch keine Fragen.
          </p>
          {canWrite && (
            <button
              onClick={() => setDraft({ ...EMPTY_DRAFT })}
              className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
            >
              <Plus size={15} /> Erste Frage anlegen
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {questions.map((question, index) => (
            <QuestionRow
              key={question.id}
              question={question}
              first={index === 0}
              last={index === questions.length - 1}
              canWrite={canWrite}
              canDelete={canDelete}
              onMove={(direction) => move(index, direction)}
              onEdit={() => setDraft(toDraft(question))}
              onDelete={() => setDeleting(question)}
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-white/25">
        Die Reihenfolge ist die Reihenfolge der Felder im Bewerbungsformular.
        Änderungen an einer Frage wirken nur auf neue Bewerbungen — bereits
        eingegangene behalten ihren eigenen Wortlaut.
      </p>

      {draft && position && (
        <QuestionModal
          draft={draft}
          positionId={position.id}
          onClose={() => setDraft(null)}
          onSaved={async () => {
            setDraft(null);
            await reload();
          }}
        />
      )}

      {deleting && (
        <ConfirmDelete
          title="Frage löschen"
          what={`Die Frage „${questionLabel(deleting)}“`}
          note="Bereits eingegangene Bewerbungen behalten ihre Antwort darauf."
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await apiVoid(`/api/dashboard/apply/questions/${deleting.id}`, {
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
