"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  RefreshCw,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AuthGuard from "../auth-guard";

interface Position {
  id: number;
  name: string;
  slug: string;
  status: "open" | "closed";
  sortOrder: number;
}

function PositionCard({
  position,
  busy,
  onToggle,
}: {
  position: Position;
  busy: boolean;
  onToggle: (next: "open" | "closed") => void;
}) {
  const open = position.status === "open";

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-base font-semibold text-white">{position.name}</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              open
                ? "bg-green-500/15 text-green-400"
                : "bg-white/5 text-white/40"
            }`}
          >
            {open ? "Offen" : "Geschlossen"}
          </span>
        </div>
        <Link
          href={`/apply/${position.slug}`}
          target="_blank"
          className="mt-1 inline-flex items-center gap-1 text-xs text-white/30 transition-colors hover:text-white/60"
        >
          /apply/{position.slug} <ExternalLink size={11} />
        </Link>
      </div>

      {busy ? (
        <Loader2 size={18} className="animate-spin text-white/30" />
      ) : (
        <Switch
          checked={open}
          onCheckedChange={(checked) => onToggle(checked ? "open" : "closed")}
          aria-label={`Bewerbungen für ${position.name} ${open ? "schließen" : "öffnen"}`}
        />
      )}
    </div>
  );
}

function ApplyDashboardContent() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/apply");
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Fehler ${res.status}`);
      setPositions(body.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (position: Position, next: "open" | "closed") => {
    setBusyId(position.id);
    setError(null);
    // Optimistic: the switch flips straight away and is rolled back on failure.
    setPositions((prev) =>
      prev.map((p) => (p.id === position.id ? { ...p, status: next } : p)),
    );
    try {
      const res = await fetch("/api/dashboard/apply", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: position.id, status: next }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Fehler ${res.status}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPositions((prev) =>
        prev.map((p) => (p.id === position.id ? { ...p, status: position.status } : p)),
      );
    } finally {
      setBusyId(null);
    }
  };

  const openCount = positions.filter((p) => p.status === "open").length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Bewerbungen
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            {openCount} von {positions.length} Positionen offen
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Neu laden
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
        </div>
      ) : positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] py-16">
          <ClipboardList size={32} className="text-white/10" />
          <p className="text-sm text-white/30">Keine Positionen gefunden.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {positions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              busy={busyId === position.id}
              onToggle={(next) => toggle(position, next)}
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-white/25">
        Geschlossene Positionen erscheinen auf <code className="text-white/40">/apply</code>{" "}
        weiterhin, sind aber ausgegraut und nicht verlinkt; das Bewerbungsformular nimmt
        dann keine Einsendungen mehr an.
      </p>
    </div>
  );
}

export default function ApplyDashboard() {
  return (
    <AuthGuard>
      <ApplyDashboardContent />
    </AuthGuard>
  );
}
