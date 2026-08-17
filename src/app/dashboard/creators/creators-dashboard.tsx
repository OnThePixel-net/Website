"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
  GripVertical,
} from "lucide-react";
import {
  FaYoutube,
  FaTwitch,
  FaTiktok,
  FaInstagram,
  FaTwitter,
  FaDiscord,
  FaWhatsapp,
  FaGlobe,
} from "react-icons/fa";
import AuthGuard from "../auth-guard";

/* --- Types --- */

interface Channel {
  platform: string;
  url: string;
}

interface Creator {
  id: number;
  name: string;
  minecraftUuid: string;
  sortOrder: number;
  channels: Channel[];
}

type Draft = {
  id?: number;
  name: string;
  minecraftUuid: string;
  channels: Channel[];
};

/* --- Platform metadata (mirrors the icon mapping on the public page) --- */

const PLATFORMS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: "youtube", label: "YouTube", icon: <FaYoutube className="text-red-500" /> },
  { value: "twitch", label: "Twitch", icon: <FaTwitch className="text-purple-500" /> },
  { value: "tiktok", label: "TikTok", icon: <FaTiktok className="text-white" /> },
  { value: "instagram", label: "Instagram", icon: <FaInstagram className="text-pink-500" /> },
  { value: "x_twitter", label: "X / Twitter", icon: <FaTwitter className="text-blue-400" /> },
  { value: "discord", label: "Discord", icon: <FaDiscord className="text-indigo-500" /> },
  { value: "whatsapp", label: "WhatsApp", icon: <FaWhatsapp className="text-green-400" /> },
  { value: "website", label: "Website", icon: <FaGlobe className="text-white/40" /> },
];

function platformIcon(platform: string) {
  return (
    PLATFORMS.find((p) => p.value === platform.toLowerCase())?.icon ?? (
      <FaGlobe className="text-white/40" />
    )
  );
}

function platformLabel(platform: string) {
  return PLATFORMS.find((p) => p.value === platform.toLowerCase())?.label ?? platform;
}

const EMPTY_DRAFT: Draft = { name: "", minecraftUuid: "", channels: [] };

/**
 * Follower counts come from the public stats service, which resolves a creator
 * by name and reads its primary (first) channel.
 */
const FOLLOWERS_API = "https://api.onthepixel.net/creators/followers";

function formatFollowers(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

/** Mirrors the server-side validation so the form can flag mistakes early. */
function isValidUuid(value: string) {
  return /^[0-9a-f]{32}$/i.test(value.trim().replace(/-/g, ""));
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/40">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white/25">{hint}</p>}
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20";

/* --- Channel editor: add, edit, reorder and remove a creator's channels --- */

function ChannelEditor({
  channels,
  onChange,
}: {
  channels: Channel[];
  onChange: (next: Channel[]) => void;
}) {
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= channels.length) return;
    const next = [...channels];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const update = (index: number, patch: Partial<Channel>) => {
    onChange(channels.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-white/40">
          Kanäle <span className="text-white/20">({channels.length})</span>
        </label>
        <button
          type="button"
          onClick={() => onChange([...channels, { platform: "youtube", url: "" }])}
          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Plus size={13} /> Kanal
        </button>
      </div>

      <p className="text-[11px] text-white/25">
        Die Reihenfolge bestimmt die Anzeige auf der Website. Der{" "}
        <span className="text-green-400/70">erste Kanal</span> ist der primäre: Follower-Zahl
        und Live-Status werden über ihn ermittelt.
      </p>

      {channels.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 py-6">
          <LinkIcon size={20} className="text-white/15" />
          <p className="text-xs text-white/30">Noch keine Kanäle hinterlegt.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {channels.map((channel, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-2"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  title="Nach oben"
                  className="rounded p-0.5 text-white/30 transition-colors hover:text-white disabled:opacity-20 disabled:hover:text-white/30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === channels.length - 1}
                  title="Nach unten"
                  className="rounded p-0.5 text-white/30 transition-colors hover:text-white disabled:opacity-20 disabled:hover:text-white/30"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <GripVertical size={14} className="shrink-0 text-white/10" />

              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${
                  i === 0 ? "bg-green-500/10 ring-1 ring-green-500/30" : "bg-white/5"
                }`}
                title={i === 0 ? "Primärer Kanal (Follower & Live-Status)" : undefined}
              >
                {platformIcon(channel.platform)}
              </div>

              <select
                value={channel.platform}
                onChange={(e) => update(i, { platform: e.target.value })}
                className="h-9 shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white outline-none focus:border-green-500/50"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value} className="bg-gray-900">
                    {p.label}
                  </option>
                ))}
              </select>

              <input
                type="url"
                value={channel.url}
                onChange={(e) => update(i, { url: e.target.value })}
                placeholder="https://…"
                className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder-white/25 outline-none focus:border-green-500/50"
              />

              <button
                type="button"
                onClick={() => onChange(channels.filter((_, idx) => idx !== i))}
                title="Kanal entfernen"
                className="shrink-0 rounded-lg p-2 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --- Create / edit modal --- */

function CreatorModal({
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
  const uuidTouched = form.minecraftUuid.trim().length > 0;
  const uuidValid = isValidUuid(form.minecraftUuid);

  const save = async () => {
    if (!form.name.trim()) return setError("Name ist erforderlich.");
    if (!uuidValid) return setError("Ungültige Minecraft-UUID.");

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        editing ? `/api/dashboard/creators/${draft.id}` : "/api/dashboard/creators",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            minecraftUuid: form.minecraftUuid.trim(),
            channels: form.channels.filter((c) => c.url.trim()),
          }),
        },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Fehler ${res.status}`);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-10">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {editing ? "Creator bearbeiten" : "Neuer Creator"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
              {uuidValid && (
                <Image
                  src={`https://api.mcskin.me/pfp/${form.minecraftUuid.trim()}`}
                  alt={form.name || "Avatar"}
                  width={64}
                  height={64}
                  className="h-16 w-16"
                  unoptimized
                />
              )}
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Creator-Name"
                  className={inputClass}
                />
              </Field>
              <Field
                label="Minecraft-UUID"
                hint={
                  uuidTouched && !uuidValid
                    ? "32 Hex-Zeichen, mit oder ohne Bindestriche."
                    : undefined
                }
              >
                <input
                  type="text"
                  value={form.minecraftUuid}
                  onChange={(e) => setForm({ ...form, minecraftUuid: e.target.value })}
                  placeholder="069a79f4-44e9-4726-a5be-fca90e38aaf5"
                  className={`${inputClass} font-mono text-xs ${
                    uuidTouched && !uuidValid ? "border-red-500/40" : ""
                  }`}
                />
              </Field>
            </div>
          </div>

          <ChannelEditor
            channels={form.channels}
            onChange={(channels) => setForm({ ...form, channels })}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
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
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Delete confirmation --- */

function DeleteDialog({
  creator,
  onClose,
  onDeleted,
}: {
  creator: Creator;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/creators/${creator.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Fehler ${res.status}`);
      }
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
          Creator löschen
        </h2>
        <p className="mt-2 text-sm text-white/50">
          <span className="font-medium text-white">{creator.name}</span> und alle zugehörigen
          Kanäle werden dauerhaft entfernt.
        </p>
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
            onClick={remove}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-400 disabled:opacity-60"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Table row --- */

function CreatorRow({
  creator,
  followers,
  first,
  last,
  onMove,
  onEdit,
  onDelete,
}: {
  creator: Creator;
  followers: number | null | undefined;
  first: boolean;
  last: boolean;
  onMove: (direction: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]">
      <td className="py-3 pl-4 pr-2">
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
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-3">
          <Image
            src={`https://api.mcskin.me/pfp/${creator.minecraftUuid}`}
            alt={creator.name}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-lg"
            unoptimized
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{creator.name}</p>
            <p className="truncate font-mono text-[11px] text-white/25">
              {creator.minecraftUuid}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-1.5">
          {creator.channels.map((channel, i) => (
            <a
              key={i}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              title={i === 0 ? `${channel.url} — primärer Kanal` : channel.url}
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-white/10 hover:text-white ${
                i === 0
                  ? "bg-green-500/10 text-white/80 ring-1 ring-green-500/25"
                  : "bg-white/5 text-white/60"
              }`}
            >
              {platformIcon(channel.platform)}
              {platformLabel(channel.platform)}
            </a>
          ))}
          {creator.channels.length === 0 && (
            <span className="text-xs text-white/20">Keine Kanäle</span>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-right">
        {followers === undefined ? (
          <Loader2 size={13} className="ml-auto animate-spin text-white/15" />
        ) : followers === null ? (
          <span className="text-xs text-white/15">—</span>
        ) : (
          <span className="text-sm font-medium text-white/70">
            {formatFollowers(followers)}
          </span>
        )}
      </td>
      <td className="py-3 pl-3 pr-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            title="Bearbeiten"
            className="rounded-lg p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            title="Löschen"
            className="rounded-lg p-2 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* --- Page --- */

function CreatorsDashboardContent() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState<Creator | null>(null);
  const [followers, setFollowers] = useState<Record<number, number | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/creators");
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Fehler ${res.status}`);
      setCreators(body.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setCreators([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Follower counts are pulled per creator from the stats service; a failure
  // there must not affect the management view, so each lookup fails to `null`.
  useEffect(() => {
    if (creators.length === 0) return;
    let cancelled = false;

    (async () => {
      const entries = await Promise.all(
        creators.map(async (creator) => {
          try {
            const res = await fetch(`${FOLLOWERS_API}/${encodeURIComponent(creator.name)}`);
            if (!res.ok) return [creator.id, null] as const;
            const body = await res.json();
            const social = body?.data?.social;
            const count = social?.followers ?? social?.subscribers ?? null;
            return [creator.id, typeof count === "number" ? count : null] as const;
          } catch {
            return [creator.id, null] as const;
          }
        }),
      );
      if (!cancelled) setFollowers(Object.fromEntries(entries));
    })();

    return () => {
      cancelled = true;
    };
  }, [creators]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return creators;
    return creators.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.minecraftUuid.toLowerCase().includes(q) ||
        c.channels.some((ch) => ch.platform.toLowerCase().includes(q)),
    );
  }, [creators, search]);

  /**
   * Reordering acts on the unfiltered list, so it is only offered while no
   * search is active — otherwise "one row up" would not match what is on screen.
   */
  const reorderable = search.trim().length === 0;

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= creators.length) return;
    const next = [...creators];
    [next[index], next[target]] = [next[target], next[index]];
    setCreators(next);
    try {
      const res = await fetch("/api/dashboard/creators/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((c) => c.id) }),
      });
      if (!res.ok) throw new Error(`Fehler ${res.status}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      load();
    }
  };

  const channelCount = creators.reduce((sum, c) => sum + c.channels.length, 0);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Creators
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            {creators.length} Creator · {channelCount} Kanäle
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Suchen…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 sm:w-56"
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            title="Neu laden"
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setDraft({ ...EMPTY_DRAFT })}
            className="flex h-9 items-center gap-2 rounded-lg bg-green-500 px-4 text-sm font-semibold text-black transition-colors hover:bg-green-400"
          >
            <Plus size={15} /> Creator
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Users size={32} className="text-white/10" />
            <p className="text-sm text-white/30">
              {creators.length === 0 ? "Noch keine Creator angelegt." : "Keine Treffer."}
            </p>
            {creators.length === 0 && (
              <button
                onClick={() => setDraft({ ...EMPTY_DRAFT })}
                className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
              >
                <Plus size={15} /> Ersten Creator anlegen
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="w-10 py-3 pl-4 pr-2" />
                  <th className="py-3 pr-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Creator
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Kanäle
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-white/30">
                    Follower
                  </th>
                  <th className="py-3 pl-3 pr-4 text-right text-xs font-medium uppercase tracking-wider text-white/30">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((creator) => {
                  const index = creators.indexOf(creator);
                  return (
                    <CreatorRow
                      key={creator.id}
                      creator={creator}
                      followers={followers[creator.id]}
                      first={!reorderable || index === 0}
                      last={!reorderable || index === creators.length - 1}
                      onMove={(direction) => move(index, direction)}
                      onEdit={() =>
                        setDraft({
                          id: creator.id,
                          name: creator.name,
                          minecraftUuid: creator.minecraftUuid,
                          channels: creator.channels.map((c) => ({ ...c })),
                        })
                      }
                      onDelete={() => setDeleting(creator)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {draft && (
        <CreatorModal
          draft={draft}
          onClose={() => setDraft(null)}
          onSaved={() => {
            setDraft(null);
            load();
          }}
        />
      )}

      {deleting && (
        <DeleteDialog
          creator={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            load();
          }}
        />
      )}
    </div>
  );
}

export default function CreatorsDashboard() {
  return (
    <AuthGuard>
      <CreatorsDashboardContent />
    </AuthGuard>
  );
}
