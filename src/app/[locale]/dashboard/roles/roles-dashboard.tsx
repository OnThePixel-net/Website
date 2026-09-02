"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Shield,
  Save,
  Pencil,
  Tag,
  Weight,
  Star,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import {
  LEVEL_NONE,
  PERMISSION_AREAS,
  LEVEL_READ,
  LEVEL_WRITE,
  LEVEL_DELETE,
  NO_PERMISSIONS,
  coercePermissions,
  type PermissionArea,
  type PermissionLevel,
  type PermissionSet,
} from "@/lib/permissions";
import { usePermissionLevel } from "@/lib/use-permission";
import AuthGuard from "../auth-guard";
import { Field, type Group } from "../team-shared";

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

/* --- One rank card --- */
function GroupCard({
  group,
  roleLabel,
  canWrite,
  onEdit,
}: {
  group: Group;
  /** Show the role's name where it is known, its id where it is not. */
  roleLabel: (id: string) => string;
  /** Level 2+ on `team`: may edit the rank — including its rights. */
  canWrite: boolean;
  onEdit: (g: Group) => void;
}) {
  return (
    <div className="group flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Shield size={14} className="shrink-0 text-purple-400" />
          <p className="truncate text-sm font-medium text-white">
            {group.friendlyName}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {group.prefix ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-white/60">
              <Tag size={11} /> {group.prefix}
            </span>
          ) : null}
          {group.weight ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/60">
              <Weight size={11} /> {group.weight}
            </span>
          ) : null}
          {group.discordRoleId ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/60">
              <FaDiscord size={11} className="text-indigo-400" />{" "}
              {roleLabel(group.discordRoleId)}
            </span>
          ) : null}
          {group.isCreatorRank ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/60">
              <Star size={11} className="text-purple-400" /> Creator-Rang
            </span>
          ) : null}
          {grantedAreas(group).map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/60"
            >
              <Shield size={11} className="text-green-400" />{" "}
              {AREA_LABELS[area]} {coercePermissions(group.permissions)[area]}
            </span>
          ))}
          {grantedAreas(group).length === 0 && (
            <span className="text-xs text-white/20">
              kein Dashboard-Zugriff
            </span>
          )}
          {!group.prefix && !group.weight && (
            <span className="text-xs text-white/20">kein Prefix / Weight</span>
          )}
        </div>
      </div>
      {canWrite && (
        <button
          onClick={() => onEdit(group)}
          className="shrink-0 rounded-md p-1.5 text-white/30 transition-colors hover:bg-purple-500/10 hover:text-purple-400"
        >
          <Pencil size={13} />
        </button>
      )}
    </div>
  );
}

/* --- Main --- */
function RolesDashboardContent() {
  // Same area as the team roster: level 1 shows the ranks, level 2 adds
  // creating and editing them — and with it, see `src/lib/permissions.ts`, the
  // ability to grant rights. There is no level 3 action here; ranks are
  // deleted in Pocket ID.
  const level = usePermissionLevel("team");
  const canWrite = level >= LEVEL_WRITE;
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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
    // The ranks come off the team endpoint, which serves members and groups
    // together — the same request the team page makes, kept as it is so this
    // split needs no change to the public API.
    try {
      const res = await fetch("/api/dashboard/team");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || data.error || "Laden fehlgeschlagen.");
      setGroups(data.groups ?? []);
      setDiscord((prev) => ({
        ...prev,
        configured: data.discord?.configured === true,
      }));
    } catch (e) {
      setGroups([]);
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }

    // The role list is a separate, purely optional request: it only fills the
    // rank editor's picker, so a failure must not touch the rank list. The
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

  /** Show the role's name where it is known, its id where it is not. */
  const roleLabel = (id: string) =>
    discord.roles.find((r) => r.id === id)?.name ?? id;

  return (
    <div>
      {toast && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-xl border border-green-500/20 bg-gray-900 px-4 py-3 text-sm font-medium text-green-400 shadow-2xl">
          <Save size={14} /> {toast}
        </div>
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
            Rollen
          </h1>
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

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          {canWrite && (
            <button
              onClick={() => setGroupModal({ group: null })}
              className="flex h-9 items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 text-sm font-semibold text-purple-300 transition-colors hover:bg-purple-500/20"
            >
              <Plus size={15} /> Neue Gruppe
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

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] py-10">
          <Shield size={28} className="text-white/10" />
          <p className="text-sm text-white/30">Keine OTP-Gruppen.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              roleLabel={roleLabel}
              canWrite={canWrite}
              onEdit={(target) => setGroupModal({ group: target })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RolesDashboard() {
  return (
    <AuthGuard area="team">
      <RolesDashboardContent />
    </AuthGuard>
  );
}
