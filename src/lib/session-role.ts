/**
 * The role a signed-in account carries on the session.
 *
 * One shape for every sign-in path. In production it is the account's
 * highest-weight `Team: OTP` group in Pocket ID (see `src/lib/admin-access.ts`);
 * with the local development login it is the picked stand-in role (see
 * `src/lib/dev-auth.ts`). Deliberately ONE type instead of the previous
 * `session.user.devRole` plus a separate production role: the UI would
 * otherwise have to special-case which of the two it is looking at, and the two
 * would drift apart.
 *
 * This module intentionally has no imports. It is referenced from the session
 * type augmentation in `src/auth.ts` and therefore ends up in the type graph of
 * client components too, which must not pull in server-only code.
 */
export interface SessionRole {
  /** Pocket ID group id — or, for the dev login, the picked role's id. */
  id: string;
  /** Display name of the group, e.g. "Java Developer". */
  friendlyName: string;
  /**
   * The group's `weight` custom claim. Highest weight wins as the primary
   * role, exactly as on the public team page and in the team dashboard.
   */
  weight: number;
  /** Colour derived from the group's `prefix` claim (see `prefixColor()`). */
  color: string;
  /**
   * Whether this role belongs to the OTP team, i.e. whether the group carries
   * the `Team=OTP` claim. This is what dashboard access is decided on today;
   * `weight` / `id` are carried along so finer-grained, per-role gating can be
   * built on top later without another round of session changes.
   */
  teamMember: boolean;
}
