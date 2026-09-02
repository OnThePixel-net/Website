"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  UserPlus,
  Shield,
  Save,
  Pencil,
  Tag,
  Weight,
  Star,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import {
  LEVEL_DELETE,
  LEVEL_NONE,
  PERMISSION_AREAS,
  LEVEL_READ,
  LEVEL_WRITE,
  NO_PERMISSIONS,
  coercePermissions,
  type PermissionArea,
  type PermissionLevel,
  type PermissionSet,
} from "@/lib/permissions";
import { usePermissionLevel } from "@/lib/use-permission";
import AuthGuard from "../auth-guard";

interface Group {
  id: string;
  friendlyName: string;
  name?: string;
  prefix?: string;
  weight?: string;
  /** Discord role handed to members of this rank ("" when unmapped). */
  discordRoleId?: string;
  /** True for the one rank whose Discord role creators receive. */
  isCreatorRank?: boolean;
  /** Dashboard levels members of this rank get, per area (see permissions.ts). */
  permissions?: PermissionSet;
}

/** German labels for the four levels, in the order of the select options. */
const LEVEL_OPTIONS: { value: PermissionLevel; label: string }[] = [
  { value: LEVEL_NONE, label: "Kein Zugriff" },
  { value: LEVEL_READ, label: "Lesen" },
  { value: LEVEL_WRITE, label: "Schreiben" },
  { value: LEVEL_DELETE, label: "Löschen" },
];

/** German labels for the four areas, matching the sidebar wording. */
const AREA_LABELS: Record<PermissionArea, string> = {
  news: "News",
  creators: "Creators",
  team: "Team",
  apply: "Bewerbungen",
};

/** A role of the OTP Discord server, as served by the roles endpoint. */
interface DiscordRole {
  id: string;
  name: string;
}

/**
 * State of the Discord integration, as far as the dashboard needs it: whether a
 * bot is configured at all, the roles it can offer, and why the list is empty
 * when it is. All three are read once per page load; the rank editor falls back
 * to a plain id field whenever `roles` stays empty.
 */
interface DiscordState {
  configured: boolean;
  roles: DiscordRole[];
  error: string | null;
}

interface Member {
  id: string;
  username: string;
  displayName: string;
  email: string;
  disabled: boolean;
  discordId: string;
  minecraftUuid: string;
  groups: { id: string; friendlyName: string }[];
}

function avatarUrl(nameOrUuid: string) {
  const id = nameOrUuid?.trim() || "MHF_Steve";
  return `https://api.mcskin.me/avatar/${encodeURIComponent(id)}?size=128`;
}

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

/* --- Create member modal --- */
function CreateModal({
  groups,
  onClose,
  onCreated,
}: {
  groups: Group[];
  onClose: () => void;
  onCreated: (msg: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [minecraftUuid, setMinecraftUuid] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveEmail = emailTouched
    ? email
    : username
      ? `${username.toLowerCase()}@onthepixel.net`
      : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) return setError("Username ist erforderlich.");
    if (!groupId) return setError("Bitte eine Gruppe auswählen.");
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: effectiveEmail.trim(),
          minecraftUuid: minecraftUuid.trim(),
          discordId: discordId.trim(),
          groupId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.detail || data.error || "Erstellen fehlgeschlagen.",
        );
      }
      onCreated(
        data.warning
          ? `${username} wurde angelegt. ${data.warning}`
          : `${username} wurde angelegt.`,
      );
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
            <UserPlus size={18} className="text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Neues Team-Mitglied</p>
            <p className="text-xs text-white/40">
              Legt ein neues Konto in PocketID an.
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
          <Field label="Username *">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="z. B. Notch"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
              autoFocus
            />
          </Field>

          <Field label="E-Mail (wird verifiziert angelegt)">
            <input
              type="email"
              value={effectiveEmail}
              onChange={(e) => {
                setEmailTouched(true);
                setEmail(e.target.value);
              }}
              placeholder="username@onthepixel.net"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Minecraft-UUID">
              <input
                value={minecraftUuid}
                onChange={(e) => setMinecraftUuid(e.target.value)}
                placeholder="b35d0c41-37e8-…"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
              />
            </Field>
            <Field label="Discord-ID">
              <input
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="1279066016005099536"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
              />
            </Field>
          </div>

          <Field label="Gruppe *">
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
            >
              <option value="" className="bg-gray-900">
                Gruppe auswählen…
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-gray-900">
                  {g.friendlyName}
                </option>
              ))}
            </select>
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
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 py-2 text-sm font-semibold text-black transition-colors hover:bg-green-400 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserPlus size={14} />
              )}
              Erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --- Edit member modal --- */
function EditModal({
  member,
  groups,
  onClose,
  onSaved,
}: {
  member: Member;
  groups: Group[];
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [displayName, setDisplayName] = useState(member.displayName);
  const [email, setEmail] = useState(member.email);
  const [minecraftUuid, setMinecraftUuid] = useState(member.minecraftUuid);
  const [discordId, setDiscordId] = useState(member.discordId);
  const [disabled, setDisabled] = useState(member.disabled);
  const [groupIds, setGroupIds] = useState<string[]>(
    member.groups.map((g) => g.id),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGroup = (id: string) =>
    setGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (groupIds.length === 0)
      return setError("Mindestens eine Gruppe muss ausgewählt werden.");
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/team/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          email: email.trim(),
          minecraftUuid: minecraftUuid.trim(),
          discordId: discordId.trim(),
          disabled,
          groupIds,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          data.detail || data.error || "Speichern fehlgeschlagen.",
        );
      onSaved(
        data.warning
          ? `${member.username} wurde aktualisiert. ${data.warning}`
          : `${member.username} wurde aktualisiert.`,
      );
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
            <Pencil size={17} className="text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-white">
              {member.username} bearbeiten
            </p>
            <p className="text-xs text-white/40">
              Ändert das Konto in PocketID.
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
          <Field label="Anzeigename">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={member.username}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
              autoFocus
            />
          </Field>

          <Field label="E-Mail">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@onthepixel.net"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Minecraft-UUID">
              <input
                value={minecraftUuid}
                onChange={(e) => setMinecraftUuid(e.target.value)}
                placeholder="b35d0c41-37e8-…"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
              />
            </Field>
            <Field label="Discord-ID">
              <input
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="1279066016005099536"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20"
              />
            </Field>
          </div>

          <Field label="Gruppen">
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => {
                const active = groupIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGroup(g.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-green-500/40 bg-green-500/15 text-green-300"
                        : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    <Shield size={12} /> {g.friendlyName}
                  </button>
                );
              })}
            </div>
          </Field>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-white">
                Konto deaktiviert
              </p>
              <p className="text-xs text-white/40">
                Deaktivierte Konten können sich nicht anmelden.
              </p>
            </div>
            <input
              type="checkbox"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
              className="h-4 w-4 accent-red-500"
            />
          </label>

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
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --- Delete modal --- */
function DeleteModal({
  member,
  onConfirm,
  onCancel,
  loading,
}: {
  member: Member;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
            <Trash2 size={18} className="text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Mitglied löschen</p>
            <p className="text-xs text-white/40">
              Das kann nicht rückgängig gemacht werden.
            </p>
          </div>
        </div>
        <p className="mb-6 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
          &quot;{member.username}&quot;
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-white/60 transition-colors hover:bg-white/5"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}{" "}
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Create / edit group modal --- */
function GroupModal({
  group,
  groups,
  discord,
  onClose,
  onSaved,
}: {
  group: Group | null;
  groups: Group[];
  discord: DiscordState;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const editing = !!group;
  const [name, setName] = useState(group?.friendlyName ?? "");
  const [prefix, setPrefix] = useState(group?.prefix ?? "");
  const [weight, setWeight] = useState(group?.weight ?? "");
  const [discordRoleId, setDiscordRoleId] = useState(
    group?.discordRoleId ?? "",
  );
  const [isCreatorRank, setIsCreatorRank] = useState(!!group?.isCreatorRank);
  // Read through `coercePermissions` rather than trusted as-is: what arrives
  // here came off the API as JSON, and a level nobody recognises must land on
  // "Kein Zugriff" instead of on an empty select.
  const [permissions, setPermissions] = useState<PermissionSet>(
    group ? coercePermissions(group.permissions) : NO_PERMISSIONS,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The picker needs the role list; without it (no bot, Discord unreachable) an
  // id can still be typed, which is what keeps an existing mapping editable
  // during an outage. A stored role that is no longer in the list — deleted on
  // the server, or the list failed to load — also falls back to the id field,
  // so saving the rank cannot silently drop the mapping.
  const roleKnown =
    !discordRoleId || discord.roles.some((r) => r.id === discordRoleId);
  const [manualRole, setManualRole] = useState(!roleKnown);
  const useSelect = discord.roles.length > 0 && !manualRole && roleKnown;

  // Saving this rank as the creator rank takes the marker off whichever rank
  // holds it now — the server does that, the note here says so beforehand.
  const currentCreatorRank = groups.find(
    (g) => g.isCreatorRank && g.id !== group?.id,
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Name ist erforderlich.");
    setLoading(true);
    try {
      const url = editing
        ? `/api/dashboard/team/groups/${group!.id}`
        : "/api/dashboard/team/groups";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          prefix: prefix.trim(),
          weight: weight.trim(),
          discordRoleId: discordRoleId.trim(),
          isCreatorRank,
          permissions,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          data.detail || data.error || "Speichern fehlgeschlagen.",
        );
      const done = editing
        ? `Gruppe "${name}" wurde aktualisiert.`
        : `Gruppe "${name}" wurde angelegt.`;
      onSaved(data.warning ? `${done} ${data.warning}` : done);
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15">
            <Shield size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="font-semibold text-white">
              {editing ? `${group!.friendlyName} bearbeiten` : "Neue Gruppe"}
            </p>
            <p className="text-xs text-white/40">
              OTP-Team-Gruppe in PocketID.
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
              placeholder="z. B. Moderator"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
              autoFocus
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prefix">
              <input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="z. B. &7[Mod]"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
              />
            </Field>
            <Field label="Weight">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="z. B. 100"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
              />
            </Field>
          </div>

          <Field label="Discord-Rolle">
            {useSelect ? (
              <select
                value={discordRoleId}
                onChange={(e) => setDiscordRoleId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
              >
                <option value="" className="bg-gray-900">
                  Keine Discord-Rolle
                </option>
                {discord.roles.map((r) => (
                  <option key={r.id} value={r.id} className="bg-gray-900">
                    {r.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={discordRoleId}
                onChange={(e) => setDiscordRoleId(e.target.value)}
                placeholder="1279066016005099536"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 transition-all outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
              />
            )}
            <p className="text-xs text-white/25">
              {!discord.configured ? (
                <>
                  Rollensync inaktiv — es ist kein Discord-Bot eingerichtet
                  (DISCORD_BOT_TOKEN / DISCORD_GUILD_ID). Eine hier hinterlegte
                  Rollen-ID wird gespeichert und greift, sobald der Bot läuft.
                </>
              ) : discord.roles.length === 0 ? (
                <>
                  Die Rollenliste konnte nicht geladen werden
                  {discord.error ? `: ${discord.error}` : "."} Rollen-ID solange
                  direkt eintragen.
                </>
              ) : manualRole || !roleKnown ? (
                <>
                  Rollen-ID direkt eintragen.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setDiscordRoleId("");
                      setManualRole(false);
                    }}
                    className="text-purple-300 underline underline-offset-2"
                  >
                    Aus der Liste wählen
                  </button>
                </>
              ) : (
                <>
                  Mitglieder dieses Rangs bekommen diese Rolle. Eine Änderung
                  greift bei bestehenden Mitgliedern erst, wenn sie das nächste
                  Mal gespeichert werden.{" "}
                  <button
                    type="button"
                    onClick={() => setManualRole(true)}
                    className="text-purple-300 underline underline-offset-2"
                  >
                    ID manuell eintragen
                  </button>
                </>
              )}
            </p>
          </Field>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/40">
              Dashboard-Rechte
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {PERMISSION_AREAS.map((area) => (
                <Field key={area} label={AREA_LABELS[area]}>
                  <select
                    value={permissions[area]}
                    onChange={(e) =>
                      setPermissions((prev) => ({
                        ...prev,
                        [area]: Number(e.target.value) as PermissionLevel,
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
                  >
                    {LEVEL_OPTIONS.map((o) => (
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
              Was Mitglieder dieses Rangs im Dashboard dürfen. „Lesen“ zeigt den
              Bereich nur an, „Schreiben“ erlaubt Anlegen und Ändern, „Löschen“
              zusätzlich das Entfernen. Bereiche auf „Kein Zugriff“ tauchen in
              der Navigation gar nicht erst auf. Wer bei „Team“ mindestens
              „Schreiben“ hat, kann diese Rechte hier ändern — auch die eigenen.
            </p>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-white">Creator-Rang</p>
              <p className="text-xs text-white/40">
                {isCreatorRank && currentCreatorRank
                  ? `Übernimmt den Creator-Rang von „${currentCreatorRank.friendlyName}“.`
                  : "Creators bekommen die Discord-Rolle dieses Rangs. Genau ein Rang kann das sein."}
              </p>
            </div>
            <input
              type="checkbox"
              checked={isCreatorRank}
              onChange={(e) => setIsCreatorRank(e.target.checked)}
              className="h-4 w-4 accent-purple-500"
            />
          </label>

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
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-400 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {editing ? "Speichern" : "Erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** The areas a rank actually grants something in, in a stable order. */
function grantedAreas(group: Group): PermissionArea[] {
  const levels = coercePermissions(group.permissions);
  return PERMISSION_AREAS.filter((area) => levels[area] > LEVEL_NONE);
}

/* --- Groups panel --- */
function GroupsPanel({
  groups,
  discord,
  canWrite,
  onCreate,
  onEdit,
}: {
  groups: Group[];
  discord: DiscordState;
  /** Level 2+ on `team`: may create and edit ranks — including their rights. */
  canWrite: boolean;
  onCreate: () => void;
  onEdit: (g: Group) => void;
}) {
  /** Show the role's name where it is known, its id where it is not. */
  const roleLabel = (id: string) =>
    discord.roles.find((r) => r.id === id)?.name ?? id;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Gruppen
          </h2>
          <p className="mt-0.5 text-sm text-white/40">
            {groups.length} OTP-Gruppen
            {!discord.configured && (
              <span className="text-white/25">
                {" "}
                · Discord-Rollensync inaktiv
              </span>
            )}
          </p>
        </div>
        {canWrite && (
          <button
            onClick={onCreate}
            className="flex h-9 items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 text-sm font-semibold text-purple-300 transition-colors hover:bg-purple-500/20"
          >
            <Plus size={15} /> Neue Gruppe
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] py-10">
          <Shield size={28} className="text-white/10" />
          <p className="text-sm text-white/30">Keine OTP-Gruppen.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div
              key={g.id}
              className="group flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="shrink-0 text-purple-400" />
                  <p className="truncate text-sm font-medium text-white">
                    {g.friendlyName}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {g.prefix ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-white/60">
                      <Tag size={11} /> {g.prefix}
                    </span>
                  ) : null}
                  {g.weight ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/60">
                      <Weight size={11} /> {g.weight}
                    </span>
                  ) : null}
                  {g.discordRoleId ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/60">
                      <FaDiscord size={11} className="text-indigo-400" />{" "}
                      {roleLabel(g.discordRoleId)}
                    </span>
                  ) : null}
                  {g.isCreatorRank ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/60">
                      <Star size={11} className="text-purple-400" />{" "}
                      Creator-Rang
                    </span>
                  ) : null}
                  {grantedAreas(g).map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/60"
                    >
                      <Shield size={11} className="text-green-400" />{" "}
                      {AREA_LABELS[area]}{" "}
                      {coercePermissions(g.permissions)[area]}
                    </span>
                  ))}
                  {grantedAreas(g).length === 0 && (
                    <span className="text-xs text-white/20">
                      kein Dashboard-Zugriff
                    </span>
                  )}
                  {!g.prefix && !g.weight && (
                    <span className="text-xs text-white/20">
                      kein Prefix / Weight
                    </span>
                  )}
                </div>
              </div>
              {canWrite && (
                <button
                  onClick={() => onEdit(g)}
                  className="shrink-0 rounded-md p-1.5 text-white/30 transition-colors hover:bg-purple-500/10 hover:text-purple-400"
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --- Table row --- */
function MemberRow({
  member,
  canWrite,
  canDelete,
  onEdit,
  onDelete,
}: {
  member: Member;
  /** Level 2+: may edit the member. */
  canWrite: boolean;
  /** Level 3: may delete the Pocket ID account. */
  canDelete: boolean;
  onEdit: (m: Member) => void;
  onDelete: (m: Member) => void;
}) {
  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
      <td className="py-3 pr-3 pl-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl(member.minecraftUuid || member.username)}
            alt={member.username}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-lg bg-white/5"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {member.username}
              {member.disabled && (
                <span className="ml-2 rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                  deaktiviert
                </span>
              )}
            </p>
            <p className="truncate text-xs text-white/30">{member.email}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-1.5">
          {member.groups.length > 0 ? (
            member.groups.map((g) => (
              <span
                key={g.id}
                className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400"
              >
                <Shield size={11} /> {g.friendlyName}
              </span>
            ))
          ) : (
            <span className="text-xs text-white/20">—</span>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        {member.discordId ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-white/50">
            <FaDiscord size={13} className="text-indigo-400" />{" "}
            {member.discordId}
          </span>
        ) : (
          <span className="text-xs text-white/15">—</span>
        )}
      </td>
      <td className="px-3 py-3">
        {member.minecraftUuid ? (
          <span className="font-mono text-xs text-white/40">
            {member.minecraftUuid}
          </span>
        ) : (
          <span className="text-xs text-white/15">—</span>
        )}
      </td>
      <td className="py-3 pr-4 pl-3">
        <div className="flex items-center gap-1">
          {canWrite && (
            <button
              onClick={() => onEdit(member)}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
            >
              <Pencil size={12} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(member)}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* --- Main --- */
function TeamDashboardContent() {
  // Level 1 is a roster view; level 2 adds creating/editing members and ranks
  // (and with it, see `src/lib/permissions.ts`, the ability to grant rights);
  // level 3 adds deleting Pocket ID accounts.
  const level = usePermissionLevel("team");
  const canWrite = level >= LEVEL_WRITE;
  const canDelete = level >= LEVEL_DELETE;
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [groupModal, setGroupModal] = useState<{ group: Group | null } | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const [discord, setDiscord] = useState<DiscordState>({
    configured: false,
    roles: [],
    error: null,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/dashboard/team");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || data.error || "Laden fehlgeschlagen.");
      setMembers(data.users ?? []);
      setGroups(data.groups ?? []);
      setDiscord((prev) => ({
        ...prev,
        configured: data.discord?.configured === true,
      }));
    } catch (e) {
      setMembers([]);
      setGroups([]);
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }

    // The role list is a separate, purely optional request: it only fills the
    // rank editor's picker, so a failure must not touch the member list. The
    // editor falls back to a plain role-id field when it stays empty.
    try {
      const res = await fetch("/api/dashboard/discord/roles");
      const data = await res.json();
      setDiscord({
        configured: data.configured === true,
        roles: data.roles ?? [],
        error: data.error ?? null,
      });
    } catch (e) {
      setDiscord((prev) => ({
        ...prev,
        roles: [],
        error: e instanceof Error ? e.message : String(e),
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/dashboard/team/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Löschen fehlgeschlagen.");
      }
      await load();
      // The deletion itself never fails on Discord's account — a role that
      // could not be revoked comes back as a warning and is shown here, so the
      // operator knows to take it off by hand.
      showToast(
        data.warning
          ? `${deleteTarget.username} wurde gelöscht. ${data.warning}`
          : `${deleteTarget.username} wurde gelöscht.`,
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.username.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.discordId.toLowerCase().includes(q) ||
      m.minecraftUuid.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {toast && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-xl border border-green-500/20 bg-gray-900 px-4 py-3 text-sm font-medium text-green-400 shadow-2xl">
          <Save size={14} /> {toast}
        </div>
      )}
      {showCreate && (
        <CreateModal
          groups={groups}
          onClose={() => setShowCreate(false)}
          onCreated={(msg) => {
            setShowCreate(false);
            load();
            showToast(msg);
          }}
        />
      )}
      {editTarget && (
        <EditModal
          member={editTarget}
          groups={groups}
          onClose={() => setEditTarget(null)}
          onSaved={(msg) => {
            setEditTarget(null);
            load();
            showToast(msg);
          }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          member={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
      {groupModal && (
        <GroupModal
          group={groupModal.group}
          groups={groups}
          discord={discord}
          onClose={() => setGroupModal(null)}
          onSaved={(msg) => {
            setGroupModal(null);
            load();
            showToast(msg);
          }}
        />
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Team
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            {members.length} Mitglieder
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={15}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Suchen…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pr-4 pl-9 text-sm text-white placeholder-white/30 outline-none focus:border-green-500/40 sm:w-56"
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          {canWrite && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex h-9 items-center gap-2 rounded-lg bg-green-500 px-4 text-sm font-semibold text-black transition-colors hover:bg-green-400"
            >
              <Plus size={15} /> Neues Mitglied
            </button>
          )}
        </div>
      </div>

      {loadError && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span className="break-words">{loadError}</span>
        </div>
      )}

      {!loading && (
        <GroupsPanel
          groups={groups}
          discord={discord}
          canWrite={canWrite}
          onCreate={() => setGroupModal({ group: null })}
          onEdit={(g) => setGroupModal({ group: g })}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Users size={32} className="text-white/10" />
            <p className="text-sm text-white/30">
              Keine Team-Mitglieder gefunden.
            </p>
            {canWrite && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
              >
                <Plus size={14} /> Erstes Mitglied anlegen
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 pr-3 pl-4 text-left text-xs font-medium tracking-wider text-white/30 uppercase">
                    Mitglied
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white/30 uppercase">
                    Gruppen
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white/30 uppercase">
                    Discord-ID
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white/30 uppercase">
                    Minecraft-UUID
                  </th>
                  <th className="py-3 pr-4 pl-3 text-left text-xs font-medium tracking-wider text-white/30 uppercase">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    canWrite={canWrite}
                    canDelete={canDelete}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamDashboard() {
  return (
    <AuthGuard area="team">
      <TeamDashboardContent />
    </AuthGuard>
  );
}
