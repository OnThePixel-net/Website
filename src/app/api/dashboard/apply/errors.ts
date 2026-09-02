import { NextResponse } from "next/server";
import { ApplyValidationError } from "@/lib/apply";

/**
 * Shared error translation for the apply routes.
 *
 * `src/lib/apply.ts` is the only place that decides whether a write is
 * acceptable, and it says so by throwing an {@link ApplyValidationError} whose
 * `message` is already the German sentence the dashboard shows. Everything else
 * that reaches a handler is a database or programming fault, which is logged
 * and answered with a 500 — the same split the news and creators routes make.
 */
/**
 * The German message for a unique-constraint violation, or `null` when `e` is
 * not one.
 *
 * The three apply tables carry three unique keys — a position's name, its slug
 * and a question's field key within its position — and all of them can be hit
 * by an ordinary typing mistake in the editor. Telling the operator which value
 * is taken is the difference between a fixable mistake and an unexplained
 * "Fehler 500". postgres.js puts the SQLSTATE on `cause`, so it is read from
 * there as well as from the error itself (same as the creators routes).
 */
function uniqueViolationMessage(e: unknown): string | null {
  const err = e as {
    code?: string;
    constraint_name?: string;
    message?: string;
    cause?: { code?: string; constraint_name?: string; message?: string };
  };
  if (err?.code !== "23505" && err?.cause?.code !== "23505") return null;

  const hint = `${err?.constraint_name ?? err?.cause?.constraint_name ?? ""} ${
    err?.cause?.message ?? err?.message ?? ""
  }`;
  if (hint.includes("field_key"))
    return "Diesen Feldschlüssel gibt es in dieser Position bereits.";
  if (hint.includes("slug")) return "Diesen Slug gibt es bereits.";
  if (hint.includes("name")) return "Diesen Namen gibt es bereits.";
  return "Dieser Wert ist bereits vergeben.";
}

export function applyError(e: unknown, scope: string): NextResponse {
  if (e instanceof ApplyValidationError) {
    // Not logged: a rejected input is the routine answer to a bad request, not
    // an incident, and the operator already sees the reason on screen.
    return NextResponse.json({ error: e.message, code: e.code }, { status: 400 });
  }
  const duplicate = uniqueViolationMessage(e);
  if (duplicate) return NextResponse.json({ error: duplicate }, { status: 409 });
  console.error(`[apply ${scope}]`, e);
  return NextResponse.json(
    { error: e instanceof Error ? e.message : String(e) },
    { status: 500 },
  );
}

/**
 * Read a positive integer route parameter, or `null` when it is not one.
 *
 * Every id in this area is a serial primary key, so `0`, `-1`, `1.5` and
 * `"abc"` are all equally impossible and are refused before they reach a query.
 */
export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * The 400 for an unusable id, worded like the other dashboard routes. Built per
 * call rather than kept as a constant: a `Response` body can only be read once,
 * so a shared instance would break the second request that hit it.
 */
export function invalidId(): NextResponse {
  return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
}

/** The 404 for an id that parsed but matches no row. */
export function notFound(): NextResponse {
  return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
}
