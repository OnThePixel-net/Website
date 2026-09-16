"use client";

/**
 * The dashboard API reference, rendered inside the dashboard.
 *
 * Deliberately not a page under `(site)`: the public `/api-docs/` documents the
 * read-only endpoints anybody may call, while everything here — the endpoints,
 * their permission levels, how to authenticate against them — is team-internal
 * and is served only behind the dashboard's guard. The route it lives on is
 * `robots: { index: false }` like the rest of `/dashboard`.
 *
 * The content comes from `endpoints.ts`; this file is only how it looks.
 */

import React, { useState } from "react";
import { Check, ChevronDown, Copy, KeyRound, Terminal } from "lucide-react";
import { SITE_URL } from "@/lib/i18n/seo";
import {
  LEVEL_READ,
  LEVEL_WRITE,
  LEVEL_DELETE,
  type PermissionLevel,
} from "@/lib/permissions";
import {
  ENDPOINT_COUNT,
  ENDPOINT_GROUPS,
  ERROR_RESPONSES,
  type EndpointDoc,
  type EndpointParam,
} from "./endpoints";

/** Method → the colours it is shown in, so the list is scannable. */
const METHOD_STYLES: Record<EndpointDoc["method"], string> = {
  GET: "bg-sky-500/15 text-sky-300",
  POST: "bg-green-500/15 text-green-300",
  PUT: "bg-amber-500/15 text-amber-300",
  PATCH: "bg-amber-500/15 text-amber-300",
  DELETE: "bg-red-500/15 text-red-300",
};

/** German names of the four levels, the same wording the rank editor uses. */
const LEVEL_LABELS: Record<PermissionLevel, string> = {
  0: "Kein Zugriff",
  1: "Lesen",
  2: "Schreiben",
  3: "Löschen",
};

/** A copy-to-clipboard button that says when it worked. */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // A clipboard the browser refuses (no permission, insecure origin) is not
      // worth an error state: the text is on screen and can be selected.
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white"
    >
      {copied ? (
        <Check size={12} className="text-green-400" />
      ) : (
        <Copy size={12} />
      )}
      {copied ? "Kopiert" : "Kopieren"}
    </button>
  );
}

/** A fenced code sample with its own copy button. */
function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-xs text-white/30">
          <Terminal size={11} /> {label}
        </span>
        <CopyButton value={code} label={`${label} kopieren`} />
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-white/70">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Section heading with a short lead paragraph. */
function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <h3
        className="text-sm font-bold text-white"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {title}
      </h3>
      {lead && (
        <p className="mt-1 mb-4 text-xs leading-relaxed text-white/40">
          {lead}
        </p>
      )}
      <div className={lead ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

/** The parameter table shared by body fields and query parameters. */
function ParamTable({
  title,
  params,
}: {
  title: string;
  params: EndpointParam[];
}) {
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs font-medium text-white/40">{title}</p>
      <div className="overflow-hidden rounded-lg border border-white/5">
        {params.map((param) => (
          <div
            key={param.name}
            className="flex flex-col gap-1 border-b border-white/5 px-3 py-2 last:border-b-0 sm:flex-row sm:gap-3"
          >
            <div className="flex shrink-0 items-baseline gap-2 sm:w-56">
              <code className="font-mono text-xs text-green-300">
                {param.name}
              </code>
              {param.required && (
                <span className="text-[10px] font-semibold text-red-300/70">
                  Pflicht
                </span>
              )}
            </div>
            <div className="min-w-0">
              <code className="font-mono text-[11px] text-white/30">
                {param.type}
              </code>
              <p className="text-xs leading-relaxed text-white/50">
                {param.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** One endpoint, collapsed to its signature until it is opened. */
function EndpointCard({ endpoint }: { endpoint: EndpointDoc }) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!(endpoint.body || endpoint.query || endpoint.note);

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-3 py-2.5 text-left"
      >
        <span
          className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${METHOD_STYLES[endpoint.method]}`}
        >
          {endpoint.method}
        </span>
        <span className="min-w-0 flex-1">
          <code className="block font-mono text-xs break-all text-white/80">
            {endpoint.path}
          </code>
          <span className="mt-1 block text-xs text-white/40">
            {endpoint.summary}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40 sm:inline">
            Level {endpoint.level}
          </span>
          {hasDetail && (
            <ChevronDown
              size={14}
              className={`text-white/30 transition-transform ${open ? "rotate-180" : ""}`}
            />
          )}
        </span>
      </button>

      {open && (
        <div className="border-t border-white/5 px-3 py-3">
          <p className="text-xs text-white/40">
            Braucht{" "}
            <span className="text-white/70">Level {endpoint.level}</span> (
            {LEVEL_LABELS[endpoint.level]}) · Antwort:{" "}
            <code className="font-mono text-white/60">{endpoint.returns}</code>
          </p>
          {endpoint.sessionOnly && (
            <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-xs text-amber-200/80">
              Nur mit angemeldetem Dashboard-Account — dieser Endpunkt lehnt
              API-Keys ab.
            </p>
          )}
          {endpoint.query && (
            <ParamTable title="Query-Parameter" params={endpoint.query} />
          )}
          {endpoint.body && (
            <ParamTable title="Body (JSON)" params={endpoint.body} />
          )}
          {endpoint.note && (
            <p className="mt-3 text-xs leading-relaxed text-white/40">
              {endpoint.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPanel() {
  // The samples name the production host rather than `window.location.origin`.
  // An integration is written against the live site — that is the URL somebody
  // copies out of here and pastes into a bot — and a fixed string renders the
  // same on the server and in the browser, so there is nothing to reconcile.
  // Against a local instance, swap the host; the paths are identical.
  const origin = SITE_URL;

  const curlExample = `curl -H "Authorization: Bearer $OTP_API_KEY" \\
  ${origin}/api/dashboard/news`;

  const postExample = `curl -X POST ${origin}/api/dashboard/news \\
  -H "Authorization: Bearer $OTP_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Season 4 is live",
    "slug": "season-4-is-live",
    "short_description": "New maps, new kits.",
    "content": "The new season is here ...",
    "translations": {
      "de": {
        "title": "Season 4 ist live",
        "short_description": "Neue Maps, neue Kits.",
        "content": "Die neue Season ist da ..."
      }
    }
  }'`;

  const fetchExample = `const res = await fetch(
  "${origin}/api/dashboard/apply/submissions?status=new&limit=1",
  { headers: { Authorization: \`Bearer \${process.env.OTP_API_KEY}\` } },
);
const { total } = await res.json();
console.log(\`\${total} neue Bewerbungen\`);`;

  return (
    <div className="flex flex-col gap-4">
      <Section
        title="Wofür das gut ist"
        lead={`Die Dashboard-API sind dieselben ${ENDPOINT_COUNT} Endpunkte, die dieses Dashboard selbst benutzt — News, Creators, Bewerbungen, Team. Mit einem API-Key kann sie auch etwas anderes ansprechen: ein Discord-Bot, der Release-Notes postet, ein Deploy-Skript, das eine Bewerbungsposition öffnet, eine Statusseite, die neue Bewerbungen zählt.`}
      >
        <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-white/50">
          <li>
            · Ein Key hat eigene Rechte pro Bereich — „darf News schreiben“
            heißt nicht „darf Teammitglieder löschen“.
          </li>
          <li>
            · Ein Key kann nie mehr, als der Account hatte, der ihn angelegt
            hat.
          </li>
          <li>
            · Keys verwalten geht nur angemeldet im Dashboard, nie mit einem
            Key.
          </li>
          <li>
            · Diese Doku ist absichtlich nur hier zu sehen; die öffentliche
            /api-docs/-Seite beschreibt ausschließlich die lesenden, offenen
            Endpunkte.
          </li>
        </ul>
      </Section>

      <Section
        title="Authentifizierung"
        lead="Den Token in den Authorization-Header, bei jedem Aufruf. Bevorzugt Bearer; X-API-Key versteht der Server genauso, für Tools, die nur diesen Header setzen können."
      >
        <div className="flex flex-col gap-3">
          <CodeBlock
            label="Authorization-Header"
            code={`Authorization: Bearer otp_a1b2c3d4e5f6a7b8_…`}
          />
          <CodeBlock
            label="Alternativ"
            code={`X-API-Key: otp_a1b2c3d4e5f6a7b8_…`}
          />
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-200/80">
            <KeyRound size={14} className="mt-0.5 shrink-0" />
            <span>
              Der Token steht nur einmal auf dem Bildschirm — beim Anlegen.
              Danach liegt nur noch sein Hash in der Datenbank, er lässt sich
              nicht nachschlagen. Als Query-Parameter wird er nicht akzeptiert:
              URLs landen in Logs, im Verlauf und im Referer. Weg damit in eine
              Umgebungsvariable (<code className="font-mono">OTP_API_KEY</code>
              ), nicht ins Repository.
            </span>
          </div>
        </div>
      </Section>

      <Section
        title="Erste Anfrage"
        lead="Alle Pfade liegen unter /api/dashboard/ und bekommen — anders als die Seiten — keinen abschließenden Slash. Bodies sind JSON; bei schreibenden Aufrufen Content-Type: application/json mitschicken."
      >
        <div className="flex flex-col gap-3">
          <CodeBlock label="Artikel lesen" code={curlExample} />
          <CodeBlock label="Artikel anlegen" code={postExample} />
          <CodeBlock
            label="Neue Bewerbungen zählen (JavaScript)"
            code={fetchExample}
          />
        </div>
      </Section>

      <Section
        title="Rechte-Level"
        lead="Dieselben vier Level, die auch ein Rang in PocketID vergibt. Jeder Endpunkt unten nennt das Level, das er in seinem Bereich verlangt."
      >
        <div className="overflow-hidden rounded-lg border border-white/5">
          {(
            [
              [LEVEL_READ, "Lesen — GET."],
              [LEVEL_WRITE, "Schreiben — zusätzlich POST, PUT und PATCH."],
              [LEVEL_DELETE, "Löschen — zusätzlich DELETE."],
            ] as [PermissionLevel, string][]
          ).map(([level, text]) => (
            <div
              key={level}
              className="flex items-baseline gap-3 border-b border-white/5 px-3 py-2 last:border-b-0"
            >
              <code className="w-12 shrink-0 font-mono text-xs text-green-300">
                Level {level}
              </code>
              <p className="text-xs text-white/50">{text}</p>
            </div>
          ))}
          <div className="flex items-baseline gap-3 border-t border-white/5 px-3 py-2">
            <code className="w-12 shrink-0 font-mono text-xs text-white/30">
              Level 0
            </code>
            <p className="text-xs text-white/50">
              Kein Zugriff — jeder Aufruf in diesem Bereich endet in 403.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Fehler"
        lead="Fehler kommen immer als JSON mit einem error-Feld, teilweise zusätzlich mit detail. Der Status sagt, ob ein erneuter Versuch überhaupt Sinn hat."
      >
        <div className="overflow-hidden rounded-lg border border-white/5">
          {ERROR_RESPONSES.map((row) => (
            <div
              key={row.status}
              className="flex flex-col gap-1 border-b border-white/5 px-3 py-2 last:border-b-0 sm:flex-row sm:gap-3"
            >
              <code className="w-20 shrink-0 font-mono text-xs text-red-300">
                {row.status}
              </code>
              <p className="text-xs leading-relaxed text-white/50">
                {row.meaning}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {ENDPOINT_GROUPS.map((group) => (
        <Section key={group.area} title={group.title} lead={group.description}>
          <div className="flex flex-col gap-2">
            {group.endpoints.map((endpoint) => (
              <EndpointCard
                key={`${endpoint.method} ${endpoint.path}`}
                endpoint={endpoint}
              />
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}
