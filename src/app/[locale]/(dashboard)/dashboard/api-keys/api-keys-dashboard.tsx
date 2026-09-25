"use client";

/**
 * API keys — the list, the create dialog, and the reference for the API they
 * open (`api-docs-panel.tsx`, shown in the second tab).
 *
 * Gated on the `team` area, like the rank editor next door: handing out a
 * credential is team administration. Level 1 may look at the list, level 2 may
 * mint and revoke. Hiding the buttons below that is guidance only — the routes
 * under `/api/dashboard/api-keys` do the deciding.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ShieldOff,
  X,
} from "lucide-react";
import {
  coercePermissions,
  LEVEL_NONE,
  LEVEL_READ,
  LEVEL_WRITE,
  LEVEL_DELETE,
  NO_PERMISSIONS,
  PERMISSION_AREAS,
  permissionLevel,
  type PermissionArea,
  type PermissionLevel,
  type PermissionSet,
} from "@/lib/permissions";
import { usePermissionLevel } from "@/lib/use-permission";
import AuthGuard from "../auth-guard";
import ApiDocsPanel from "./api-docs-panel";

/** The four levels, as the selects offer them. */
const LEVEL_OPTIONS: { value: PermissionLevel; label: string }[] = [
  { value: LEVEL_NONE, label: "Kein Zugriff" },
  { value: LEVEL_READ, label: "Lesen" },
  { value: LEVEL_WRITE, label: "Schreiben" },
  { value: LEVEL_DELETE, label: "Löschen" },
];

/** German area names, matching the sidebar and the rank editor. */
const AREA_LABELS: Record<PermissionArea, string> = {
  news: "News",
  creators: "Creators",
  team: "Team",
  apply: "Bewerbungen",
  bugs: "Bug-Reports",
};

/** A key as the list endpoint serves it. Never carries a token. */
interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  permissions: PermissionSet;
  createdBy: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  status: "active" | "expired" | "revoked";
}

/** How each state is shown in the list. */
const STATUS_STYLES: Record<
  ApiKey["status"],
  { label: string; className: string }
> = {
  active: { label: "Aktiv", className: "bg-green-500/10 text-green-300" },
  expired: { label: "Abgelaufen", className: "bg-amber-500/10 text-amber-300" },
  revoked: { label: "Zurückgezogen", className: "bg-red-500/10 text-red-300" },
};

/** Date as the dashboard writes them; "—" for an absent one. */
function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Labelled form row, same shape as the one the team pages share. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/40">{label}</label>
      {children}
    </div>
  );
}

/**
 * The one and only look at a fresh token.
 *
 * Kept as its own dialog rather than a line in the list: the token cannot be
 * recovered, so it has to be impossible to scroll past. The dialog only closes
 * through its own button, which says what closing means.
 */
function TokenDialog({
  token,
  onClose,
}: {
  token: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-green-500/20 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
            <KeyRound size={18} className="text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Key angelegt</p>
            <p className="text-xs text-white/40">
              Jetzt kopieren — danach ist er nicht mehr einsehbar.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
          <code className="block font-mono text-xs break-all text-green-300">
            {token}
          </code>
        </div>

        <button
          type="button"
          onClick={copy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" /> In die
              Zwischenablage kopiert
            </>
          ) : (
            <>
              <Copy size={14} /> Token kopieren
            </>
          )}
        </button>

        <p className="mt-4 text-xs leading-relaxed text-white/40">
          Gespeichert wird nur der Hash des Tokens, nicht der Token selbst. Geht
          er verloren, wird der Key zurückgezogen und ein neuer angelegt — das
          ist kein Umweg, sondern der Normalfall.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-green-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-400"
        >
          Hab ich kopiert, schließen
        </button>
      </div>
    </div>
  );
}

/** Create dialog. Levels are capped at what the signed-in account may delegate. */
function CreateKeyModal({
  grantable,
  onClose,
  onCreated,
}: {
  /** The creator's own levels — the server caps against these as well. */
  grantable: PermissionSet;
  onClose: () => void;
  onCreated: (token: string, message: string) => void;
}) {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<PermissionSet>(NO_PERMISSIONS);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Areas the account holds nothing in cannot be delegated, so they are not
  // offered at all rather than offered and then silently trimmed server-side.
  const delegatable = PERMISSION_AREAS.filter(
    (area) => grantable[area] > LEVEL_NONE,
  );
  const grantsSomething = PERMISSION_AREAS.some(
    (area) => permissions[area] > LEVEL_NONE,
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Ein Name ist erforderlich.");
    if (!grantsSomething)
      return setError("Der Key braucht mindestens einen Bereich mit Zugriff.");

    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          permissions,
          // An empty date field means "no expiry", which is a valid answer for
          // a key an integration is meant to keep using.
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.error || "Der Key konnte nicht angelegt werden.");
      onCreated(data.token, `Key „${name.trim()}“ wurde angelegt.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/15">
            <KeyRound size={18} className="text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Neuer API-Key</p>
            <p className="text-xs text-white/40">
              Zugang zur Dashboard-API, ohne Login.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-md p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Name *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Discord-Bot"
              maxLength={60}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
              autoFocus
            />
            <p className="text-xs text-white/25">
              Steht später in der Liste und — bei News — als Autor am Artikel.
            </p>
          </Field>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/40">Rechte</label>
            <div className="grid gap-4 sm:grid-cols-2">
              {delegatable.map((area) => (
                <Field key={area} label={AREA_LABELS[area]}>
                  <select
                    value={permissions[area]}
                    onChange={(e) =>
                      setPermissions((prev) => ({
                        ...prev,
                        [area]: Number(e.target.value) as PermissionLevel,
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
                  >
                    {LEVEL_OPTIONS.filter(
                      (o) => o.value <= grantable[area],
                    ).map((o) => (
                      <option
                        key={o.value}
                        value={o.value}
                        className="bg-gray-900"
                      >
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
            <p className="text-xs text-white/25">
              Ein Key kann höchstens das, was dein eigener Account darf — mehr
              wird serverseitig abgeschnitten. Bereiche, in denen du selbst
              nichts hast, stehen hier gar nicht erst.
            </p>
          </div>

          <Field label="Ablaufdatum">
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
            />
            <p className="text-xs text-white/25">
              Optional. Leer heißt: gilt, bis er zurückgezogen wird.
            </p>
          </Field>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          <div className="mt-1 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-white/60 transition-colors hover:bg-white/5"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-400 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <KeyRound size={14} />
              )}
              Key erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** The areas a key actually grants something in, in a stable order. */
function grantedAreas(key: ApiKey): PermissionArea[] {
  const levels = coercePermissions(key.permissions);
  return PERMISSION_AREAS.filter((area) => levels[area] > LEVEL_NONE);
}

/** One key in the list. */
function KeyCard({
  apiKey,
  canWrite,
  onRename,
  onRevoke,
  busy,
}: {
  apiKey: ApiKey;
  canWrite: boolean;
  onRename: (key: ApiKey) => void;
  onRevoke: (key: ApiKey) => void;
  busy: boolean;
}) {
  const levels = coercePermissions(apiKey.permissions);
  const status = STATUS_STYLES[apiKey.status];

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04] sm:flex-row sm:items-start sm:justify-between ${
        apiKey.status === "active" ? "" : "opacity-60"
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <KeyRound size={14} className="shrink-0 text-green-400" />
          <p className="truncate text-sm font-medium text-white">
            {apiKey.name}
          </p>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <code className="mt-1.5 block font-mono text-xs break-all text-white/30">
          {apiKey.prefix}…
        </code>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {grantedAreas(apiKey).map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/60"
            >
              {AREA_LABELS[area]} {levels[area]}
            </span>
          ))}
          {grantedAreas(apiKey).length === 0 && (
            <span className="text-xs text-white/20">keine Rechte</span>
          )}
        </div>

        <p className="mt-2 text-xs text-white/25">
          Angelegt {formatDate(apiKey.createdAt)}
          {apiKey.createdBy ? ` von ${apiKey.createdBy}` : ""} · Zuletzt benutzt{" "}
          {formatDate(apiKey.lastUsedAt)}
          {apiKey.expiresAt
            ? ` · Läuft ab ${formatDate(apiKey.expiresAt)}`
            : ""}
          {apiKey.revokedAt
            ? ` · Zurückgezogen ${formatDate(apiKey.revokedAt)}`
            : ""}
        </p>
      </div>

      {canWrite && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onRename(apiKey)}
            disabled={busy}
            aria-label={`${apiKey.name} umbenennen`}
            className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-green-500/10 hover:text-green-400 disabled:opacity-40"
          >
            <Pencil size={13} />
          </button>
          {apiKey.status !== "revoked" && (
            <button
              onClick={() => onRevoke(apiKey)}
              disabled={busy}
              aria-label={`${apiKey.name} zurückziehen`}
              className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
            >
              {busy ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <ShieldOff size={13} />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ApiKeysContent() {
  // Same area as the team roster and the ranks: level 1 shows the list, level 2
  // mints and revokes. Revoking deliberately does not need level 3 — pulling a
  // leaked credential must never be harder than issuing one.
  const level = usePermissionLevel("team");
  const canWrite = level >= LEVEL_WRITE;

  const [tab, setTab] = useState<"keys" | "docs">("keys");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [grantable, setGrantable] = useState<PermissionSet>(NO_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/dashboard/api-keys");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Laden fehlgeschlagen.");
      setKeys(data.data ?? []);
      // Read through `coercePermissions` rather than trusted as-is: what
      // arrives here came off the API as JSON.
      setGrantable(coercePermissions(data.grantable));
    } catch (e) {
      setKeys([]);
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rename = async (key: ApiKey) => {
    const next = window.prompt("Neuer Name für den Key:", key.name);
    if (next === null) return;
    if (!next.trim()) return showToast("Ein Name ist erforderlich.");

    setBusyId(key.id);
    try {
      const res = await fetch(`/api/dashboard/api-keys/${key.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: next.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Umbenennen fehlgeschlagen.");
      await load();
      showToast(`Key heißt jetzt „${next.trim()}“.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async (key: ApiKey) => {
    // Revoking breaks whatever is using the key right now, and there is no
    // undo — the token cannot be reinstated, only replaced.
    const confirmed = window.confirm(
      `„${key.name}“ zurückziehen? Alles, was diesen Key benutzt, bekommt ab sofort 401. Rückgängig machen geht nicht — es lässt sich nur ein neuer Key anlegen.`,
    );
    if (!confirmed) return;

    setBusyId(key.id);
    try {
      const res = await fetch(`/api/dashboard/api-keys/${key.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.error || "Zurückziehen fehlgeschlagen.");
      await load();
      showToast(`Key „${key.name}“ wurde zurückgezogen.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  };

  const activeCount = keys.filter((k) => k.status === "active").length;

  return (
    <div>
      {toast && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-xl border border-green-500/20 bg-gray-900 px-4 py-3 text-sm font-medium text-green-400 shadow-2xl">
          <Save size={14} /> {toast}
        </div>
      )}

      {freshToken && (
        <TokenDialog token={freshToken} onClose={() => setFreshToken(null)} />
      )}

      {createOpen && (
        <CreateKeyModal
          grantable={grantable}
          onClose={() => setCreateOpen(false)}
          onCreated={(token, message) => {
            setCreateOpen(false);
            setFreshToken(token);
            load();
            showToast(message);
          }}
        />
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            API-Keys
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            {activeCount} aktiv
            {keys.length !== activeCount && (
              <span className="text-white/25"> · {keys.length} insgesamt</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            aria-label="Neu laden"
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          {canWrite && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex h-9 items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 text-sm font-semibold text-green-300 transition-colors hover:bg-green-500/20"
            >
              <Plus size={15} /> Neuer Key
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 flex gap-1 rounded-lg border border-white/5 bg-white/[0.02] p-1">
        {(
          [
            ["keys", "Keys", KeyRound],
            ["docs", "Dokumentation", BookOpen],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === value
                ? "bg-green-500/10 text-green-400"
                : "text-white/40 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "docs" ? (
        <ApiDocsPanel />
      ) : (
        <>
          {loadError && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span className="break-words">{loadError}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] py-10 text-center">
              <KeyRound size={28} className="text-white/10" />
              <p className="text-sm text-white/30">Noch keine API-Keys.</p>
              <p className="max-w-sm text-xs text-white/20">
                Ein Key lässt ein Skript oder einen Bot dieselben Endpunkte
                benutzen wie dieses Dashboard — mit eigenen Rechten. Der Reiter
                „Dokumentation“ erklärt, welche das sind.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {keys.map((key) => (
                <KeyCard
                  key={key.id}
                  apiKey={key}
                  canWrite={canWrite}
                  busy={busyId === key.id}
                  onRename={rename}
                  onRevoke={revoke}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ApiKeysDashboard() {
  return (
    <AuthGuard area="team">
      <ApiKeysContent />
    </AuthGuard>
  );
}
