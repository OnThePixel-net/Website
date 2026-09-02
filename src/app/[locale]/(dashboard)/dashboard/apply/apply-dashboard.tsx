"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ClipboardList, HelpCircle, Inbox } from "lucide-react";
import { LEVEL_DELETE, LEVEL_WRITE } from "@/lib/permissions";
import { usePermissionLevel } from "@/lib/use-permission";
import AuthGuard from "../auth-guard";
import { ErrorNote, apiJson, type Position } from "./apply-shared";
import SubmissionsPanel from "./submissions-panel";
import QuestionsPanel from "./questions-panel";
import PositionsPanel from "./positions-panel";

/**
 * The apply area of the dashboard.
 *
 * Three views on the same data, in the order they are worked in: the
 * applications that came in, the questions their forms ask, and the positions
 * those forms belong to. They are tabs rather than three sidebar entries
 * because they are one area with one permission level — the sidebar lists one
 * link per area, and adding two more would suggest three separate rights.
 *
 * The position list is loaded here, once, because all three need it: the
 * submissions filter, the question editor's position picker and the position
 * list itself. The submissions themselves are paged and filtered, so they are
 * fetched by their own panel.
 */

type TabId = "submissions" | "questions" | "positions";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "submissions", label: "Bewerbungen", icon: Inbox },
  { id: "questions", label: "Fragen", icon: HelpCircle },
  { id: "positions", label: "Positionen", icon: ClipboardList },
];

function ApplyDashboardContent() {
  // Level 1 may look at everything in this area but change nothing; level 2
  // adds creating and editing, level 3 deleting. The routes enforce the same —
  // hiding the controls only keeps the operator from reaching for one that
  // would answer 403.
  const level = usePermissionLevel("apply");
  const canWrite = level >= LEVEL_WRITE;
  const canDelete = level >= LEVEL_DELETE;

  const [tab, setTab] = useState<TabId>("submissions");
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body = await apiJson<{ data: Position[] }>(
        "/api/dashboard/apply/positions",
      );
      setPositions(body.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

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

        <div className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/[0.02] p-1">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                tab === entry.id
                  ? "bg-green-500 text-black shadow"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <entry.icon size={13} />
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorNote message={error} />}

      {tab === "submissions" && (
        <SubmissionsPanel
          positions={positions}
          canWrite={canWrite}
          canDelete={canDelete}
        />
      )}
      {tab === "questions" && (
        <QuestionsPanel
          positions={positions}
          loading={loading}
          canWrite={canWrite}
          canDelete={canDelete}
          reload={loadPositions}
        />
      )}
      {tab === "positions" && (
        <PositionsPanel
          positions={positions}
          loading={loading}
          canWrite={canWrite}
          canDelete={canDelete}
          reload={loadPositions}
        />
      )}
    </div>
  );
}

export default function ApplyDashboard() {
  return (
    <AuthGuard area="apply">
      <ApplyDashboardContent />
    </AuthGuard>
  );
}
