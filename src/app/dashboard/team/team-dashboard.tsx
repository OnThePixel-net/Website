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
} from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import AuthGuard from "../auth-guard";

interface Group {
  id: string;
  friendlyName: string;
  name?: string;
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
      onCreated(data.warning ?? `${username} wurde angelegt.`);
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

/* --- Table row --- */
function MemberRow({
  member,
  onDelete,
}: {
  member: Member;
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
        <button
          onClick={() => onDelete(member)}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 size={12} />
        </button>
      </td>
    </tr>
  );
}

/* --- Main --- */
function TeamDashboardContent() {
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
    } catch (e) {
      setMembers([]);
      setGroups([]);
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || "Löschen fehlgeschlagen.");
      }
      await load();
      showToast(`${deleteTarget.username} wurde gelöscht.`);
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
      {deleteTarget && (
        <DeleteModal
          member={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
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
          <button
            onClick={() => setShowCreate(true)}
            className="flex h-9 items-center gap-2 rounded-lg bg-green-500 px-4 text-sm font-semibold text-black transition-colors hover:bg-green-400"
          >
            <Plus size={15} /> Neues Mitglied
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span className="break-words">{loadError}</span>
        </div>
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
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
            >
              <Plus size={14} /> Erstes Mitglied anlegen
            </button>
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
                  <MemberRow key={m.id} member={m} onDelete={setDeleteTarget} />
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
    <AuthGuard>
      <TeamDashboardContent />
    </AuthGuard>
  );
}
