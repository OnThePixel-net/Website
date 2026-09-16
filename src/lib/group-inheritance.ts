/**
 * Rank inheritance — "dieser Rang erbt von jenem".
 *
 * A rank (Pocket ID group) may name one parent rank, stored as the
 * {@link GROUP_INHERITS_CLAIM_KEY} custom claim on the group itself, next to
 * `Team`, `prefix`, `weight`, `Discord-role-id`, `Creator` and the four
 * `Permission-*` claims the rank editor already writes. Pocket ID stays the
 * single source of truth for what a rank is, inheritance included.
 *
 * ── What it does NOT do ───────────────────────────────────────────────────
 * Nothing in this project reads the chain to *grant* anything. Dashboard
 * rights keep coming from the `Permission-*` claims alone, merged across a
 * member's groups by "highest level per area wins" (see `lib/permissions.ts`),
 * and the Discord role still comes from the member's own heaviest mapped rank.
 * Inheritance is a declaration the website stores, shows and serves: the
 * consumers that care about it — the Minecraft side, anything talking to
 * `/api/dashboard/team` — resolve it themselves, exactly as they already do
 * with `prefix` and `weight`.
 *
 * Keeping it inert is the point. A parent that silently added dashboard rights
 * would mean a rank's rights could no longer be read off that rank, and the
 * accepted `Permission-team` escalation (see `lib/permissions.ts`) would grow a
 * second, much less obvious path.
 *
 * ── Why a parent id and not a name ────────────────────────────────────────
 * The claim carries the parent's Pocket ID group id. It is the one identifier
 * that survives a rename — `friendlyName` is edited in the rank editor itself,
 * and renaming "Mod" would otherwise quietly orphan every rank below it.
 * Consumers resolve the id against the same group list the API hands them.
 *
 * Like `lib/permissions.ts`, this module deliberately has no imports: the rank
 * editor is a client component and must not pull server-only code in through
 * it.
 */

/** Group claim naming the rank a rank inherits from (a Pocket ID group id). */
export const GROUP_INHERITS_CLAIM_KEY = "Inherits-from";

/** {@link GROUP_INHERITS_CLAIM_KEY}, lower-cased — for the claim registry. */
export const GROUP_INHERITS_CLAIM_KEY_LOWER =
  GROUP_INHERITS_CLAIM_KEY.toLowerCase();

/**
 * How many ancestors {@link ancestorIds} walks before it gives up.
 *
 * A guard against a chain that is long by accident rather than by intent — the
 * cycle case is already handled by the `seen` set below. No team has 32 nested
 * ranks, and a walk that deep is a data problem, not something to render.
 */
export const MAX_INHERITANCE_DEPTH = 32;

/** A `{ key, value }` custom claim, as Pocket ID stores them. */
interface ClaimLike {
  key: string;
  value: string;
}

/**
 * The parent rank id a group's claims name, or `""` when it inherits from
 * nothing. Matching is case-insensitive, so a hand-typed `inherits-from` in
 * Pocket ID works as well as the key this editor writes.
 */
export function parentGroupId(
  claims: readonly ClaimLike[] | undefined,
): string {
  const wanted = GROUP_INHERITS_CLAIM_KEY_LOWER;
  const claim = (claims ?? []).find((c) => c?.key?.toLowerCase() === wanted);
  return (claim?.value ?? "").trim();
}

/** Resolves a rank id to the id of its parent, or to `""` when it has none. */
export type ParentOf = (id: string) => string;

/** Build a {@link ParentOf} from anything carrying an id and a parent id. */
export function parentLookup(
  groups: readonly { id: string; inheritsFrom?: string }[],
): ParentOf {
  const byId = new Map(
    groups.map((g) => [g.id, (g.inheritsFrom ?? "").trim()]),
  );
  return (id: string) => byId.get(id) ?? "";
}

/**
 * The ranks above `id`, nearest parent first.
 *
 * Cycle-safe by construction: a rank that has already been visited ends the
 * walk. Claims can be edited directly in Pocket ID, so `A → B → A` is a shape
 * that reaches this code however carefully the editor validates — and a render
 * path is the worst possible place to discover it by hanging.
 */
export function ancestorIds(id: string, parentOf: ParentOf): string[] {
  const chain: string[] = [];
  const seen = new Set<string>([id]);

  let current = (parentOf(id) ?? "").trim();
  while (
    current &&
    !seen.has(current) &&
    chain.length < MAX_INHERITANCE_DEPTH
  ) {
    chain.push(current);
    seen.add(current);
    current = (parentOf(current) ?? "").trim();
  }

  return chain;
}

/**
 * True when making `parentId` the parent of `childId` would close a loop —
 * either directly (a rank inheriting from itself) or through the chain the
 * proposed parent already sits in.
 *
 * Both the rank editor (to leave impossible options out of the picker) and the
 * route handlers (which are the ones that actually have to refuse) ask this.
 */
export function wouldCycle(
  childId: string,
  parentId: string,
  parentOf: ParentOf,
): boolean {
  const parent = (parentId ?? "").trim();
  if (!parent) return false;
  if (parent === childId) return true;
  return ancestorIds(parent, parentOf).includes(childId);
}
