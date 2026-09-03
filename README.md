# Website

The OnThePixel.net website — Next.js (App Router) with a PostgreSQL database
behind Drizzle ORM.

## Local development

### Requirements

- Node.js 22 or newer (the Docker image builds on `node:22-alpine`)
- Docker with the Compose plugin, for the local PostgreSQL

### First run

```bash
npm install
cp .env.example .env     # the defaults already point at the local database
npm run db:up            # start PostgreSQL (waits until it reports healthy)
npm run db:migrate       # create the schema from drizzle/
npm run db:seed          # optional: sample news, creators and apply positions
npm run dev
```

The site is then on <http://localhost:3000>.

`npm run db:seed` refuses to run against anything but a local host — it must
never touch a deployed database.

### Database commands

| Command | What it does |
| --- | --- |
| `npm run db:up` | Start the PostgreSQL container from `compose.yml` |
| `npm run db:down` | Stop it, keeping the data |
| `npm run db:reset` | Delete the volume and start over (schema and data are gone; re-run `db:migrate`) |
| `npm run db:migrate` | Apply the migrations in `drizzle/` |
| `npm run db:generate` | Generate a new migration after changing `src/lib/db/schema.ts` |
| `npm run db:seed` | Fill a local database with sample content (idempotent) |
| `npm run db:studio` | Open Drizzle Studio against `DATABASE_URL` |

Port 5432 is often taken by a system PostgreSQL. Set `POSTGRES_PORT` in `.env`
to publish the container somewhere else, and change the port in `DATABASE_URL`
to match.

### Environment variables

`DATABASE_URL` is the only variable needed to run the site locally. Everything
else in `.env.example` is optional and only unlocks specific areas.

### Dashboard authorisation

Being signed in is not enough to use `/dashboard` or the `/api/dashboard/**`
routes — the account also has to be authorised, and **Pocket ID is the single
source of truth for that**. Rights are not one on/off switch: they are set **per
dashboard area and per level**, as custom claims on the Pocket ID **group**,
right next to the existing `Team`, `prefix`, `weight` and `Discord-role-id`.

| Group claim | Area |
| --- | --- |
| `Permission-news` | `/dashboard/news` |
| `Permission-creators` | `/dashboard/creators` |
| `Permission-team` | `/dashboard/team` (members **and** ranks) |
| `Permission-apply` | `/dashboard/apply` |

| Value | Level | May |
| --- | --- | --- |
| unset / anything else | 0 | nothing — the area is not even shown |
| `1` | read | see the list (`GET`) |
| `2` | write | plus create and change (`POST`, `PUT`, `PATCH`) |
| `3` | delete | plus delete (`DELETE`) |

The rules, all of them:

- **Fail-closed.** A claim that is missing, empty, non-numeric or outside 1–3 is
  0. A typo removes access, it never invents any.
- **Only `Team=OTP` groups grant anything.** A permission claim on some
  unrelated Pocket ID group is ignored.
- **Several groups: the highest level per area wins.** Same idea as the highest
  `weight` deciding the primary rank, so adding somebody to one more rank can
  only ever add rights.
- **The dashboard opens for anybody with a level above 0 somewhere.** All four
  at 0 is the same "Access Denied" view as before, and the navigation only lists
  the areas the account actually has.

So a rank that writes articles but must never touch the team roster gets
`Permission-news = 2` and nothing else. Levels are edited in the dashboard under
**Team → Gruppen**, in the rank editor next to prefix, weight and Discord role.

⚠️ **`Permission-team` at level 2 or higher is effectively full rights.** The
rank editor is *in* the team area, and it is where these claims are written — so
anybody who may edit ranks can give their own rank level 3 everywhere and keep
it after the next re-check. This is deliberate (the same person can add
themselves to any group in Pocket ID directly), but it means `Permission-team`
≥ 2 has to be handed out as "team administrator", not as "may tidy up the rank
list".

Both sign-in methods are resolved to the same Pocket ID user:

| Sign-in | How the Pocket ID account is found |
| --- | --- |
| Pocket ID (`oidc`) | the `sub` claim, falling back to the email and then the username claim |
| Discord | the `Discord-id` custom claim the team dashboard writes onto each member |

A Discord login therefore only works once that member's Discord id is filled in
in the team dashboard. The account's highest-weight OTP group also travels on
the session as `session.user.role` (`friendlyName`, `weight`, group id and the
colour from the group's `prefix` claim), so the UI can show the real rank; the
levels travel alongside it as `session.user.permissions`.

The decision — access *and* levels — is made at sign-in and re-checked roughly
every 15 minutes (`ADMIN_RECHECK_INTERVAL_MS`), so removing somebody from the
team, or lowering a rank's levels, takes effect within that window instead of at
their next sign-in — while a normal request costs no upstream call at all. The
route handlers and page guards only read the result off the session.

The dashboard UI follows the level: at level 1 the edit and delete controls are
not rendered at all, at level 2 the delete controls are not. That is guidance,
not the boundary — every route re-checks (`GET` needs 1, `POST`/`PUT`/`PATCH`
need 2, `DELETE` needs 3) and answers `403` regardless of what the UI showed.

**`ADMIN_EMAILS` must be set before you deploy this.** Right after the deploy no
group carries a `Permission-*` claim yet, so **nobody** has access — including
whoever would have to set those claims. Every address listed there is let in
without consulting Pocket ID, for every provider, **with level 3 in every
area**, which is what makes it the way back in. Empty it again once the ranks
carry their levels: anything listed there bypasses the team roster and survives
being removed from the team. Like every variable here it is **server-side only**
— do not give it a `NEXT_PUBLIC_` prefix. (The predecessor
`NEXT_PUBLIC_ADMIN_DISCORD_IDS` did have one, which baked the admins' Discord
ids into the public client bundle; it is no longer used anywhere and can be
removed from your environment.)

**Setting it up in Pocket ID, once:**

1. Put your own address in `ADMIN_EMAILS` and deploy.
2. Sign in, open **Team → Gruppen**, and give each rank its four levels. A
   sensible start: the admin rank 3 everywhere, a moderation rank 2 on
   `Bewerbungen` and 1 elsewhere, an editor rank 2 on News and nothing else.
3. Sign out and back in (or wait for the 15-minute re-check) and confirm the
   navigation matches.
4. Remove your address from `ADMIN_EMAILS` and restart.

The claims can equally be set directly in Pocket ID (group → custom claims,
key `Permission-news` etc., value `1`/`2`/`3`); the dashboard editor is only a
convenience over the same claims.

Failure behaviour is fail-closed, but not trigger-happy: if Pocket ID cannot be
reached **during a sign-in**, that session gets no rights (it lands on "Access
Denied"); if it cannot be reached **during a re-check**, the previous decision
stands and is retried a minute later, so an admin already at work is not thrown
out by an upstream hiccup. Every denial is logged with the reason.

### Discord role sync

When a team member or creator is created, changed or deleted in the dashboard,
the matching Discord role is handed out, moved or taken away. The whole feature
is **optional**: without `DISCORD_BOT_TOKEN` and `DISCORD_GUILD_ID` the
dashboard behaves exactly as before and simply says "Discord-Rollensync
inaktiv". See `.env.example` for the one-time bot setup — in particular that the
bot's own role has to sit **above** every role it hands out, which is the cause
of almost every `403 / code 50013`.

**Which role belongs to which rank** is not configured in the environment but as
custom claims on the Pocket ID group, next to the existing `prefix` and
`weight`, and edited under Team → Gruppen:

| Group claim | Meaning |
| --- | --- |
| `Discord-role-id` | the Discord role members of this rank receive |
| `Creator` = `true` | marks the one rank whose role every creator receives |

(The same group also carries the four `Permission-*` claims described under
"Dashboard authorisation" above — the rank editor writes all of them together.)

Creators therefore have no rank of their own — they borrow a team rank. The
dashboard keeps the `Creator` marker exclusive by clearing it on every other
rank when you set it; if two ranks end up marked anyway (edited directly in
Pocket ID), the heavier `weight` wins, ties broken by group id.

A member can be in several ranks but holds exactly **one** managed role: the one
of their highest-`weight` rank *that has a role mapped*. Unmapped ranks are
skipped rather than blocking, so roles can be rolled out one rank at a time.
Disabled accounts hold no role — the public `/team` page already hides them.

Behaviour worth knowing:

- **Creating** checks the Discord account first. If the person is not on the
  server, nothing is created and the dashboard says so.
- **Changing** a rank or the linked account moves the role; the new role is
  always granted before the old one is dropped.
- **Deleting** never fails because of Discord. The record goes, and a role that
  could not be revoked is reported as a warning.
- If a role assignment fails *after* the record was written, a **creator** is
  rolled back (one row, so the state is restored exactly), while a **team
  member's** Pocket ID account is kept and the failure reported — deleting a
  fresh identity to undo a role would be the worse trade.
- Changing a rank's role mapping does not re-stamp existing members; they pick
  the new role up the next time they are saved.

### Discord notice for new applications

Every application that comes in through `/apply` is announced in one Discord
channel. Also **optional**: without `DISCORD_APPLY_CHANNEL_ID` nothing is
posted and applications are stored and reviewed exactly as before.

The notice is posted by the same bot as the role sync — one more `.env`
variable, no webhook and therefore no second credential to store and rotate.
It carries the position and a link, and nothing else:

```
New applicant as a **Java Developer**
Click here to open: https://onthepixel.net/dashboard/apply/
```

That is on purpose. Name, Discord id and the answers stay behind the
dashboard's permission check, where only people with the `apply` right can read
them; a notice repeating them would hand everyone who can see the channel a
permanent copy of data they are not otherwise allowed to see.

The bot needs `View Channel` and `Send Messages` **in that channel** — missing
either answers 403 (code 50001 / 50013). The notice is sent after the applicant
already has their confirmation, so a channel that is misconfigured, full or
unreachable is logged and skipped: it can never turn a stored application into
a failed one.

### What does not work without external credentials

The site talks to several OnThePixel services that are not part of this repo.
Without their credentials the following is unavailable locally:

- **Dashboard (`/dashboard`)** — sign-in goes through Discord OAuth
  (`AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET`, plus `AUTH_SECRET`), optionally
  through Pocket ID (`OIDC_*`). Who is treated as an admin is decided by Pocket
  ID group membership, see "Dashboard authorisation" above. For local work you
  can skip all of it: put
  `AUTH_DEV_LOGIN=1` into `.env.development.local` (plus an `AUTH_SECRET`) and
  the login page offers a development role picker — Admin, Java Developer,
  Builder, Supporter and a role without a team, which lets you see the
  "Access Denied" state. The picker exists only when `NODE_ENV` is not
  `production`; a production build or start that still sees `AUTH_DEV_LOGIN`
  aborts with an explicit error, and the roles are stripped from the bundle.
- **Team page and team dashboard** — read from Pocket ID via `POCKETID_APIKEY`.
- **Discord role sync** — needs `DISCORD_BOT_TOKEN` and `DISCORD_GUILD_ID`.
  Without them the team and creator dashboards work unchanged, they just do not
  touch Discord; see "Discord role sync" above.
- **Discord notice for new applications** — needs `DISCORD_BOT_TOKEN` and
  `DISCORD_APPLY_CHANNEL_ID`. Without them applications are stored and listed in
  the dashboard as usual, they are just not announced; see "Discord notice for
  new applications" above.
- **Stats and leaderboards** — served by `api.onthepixel.net`. These are public
  endpoints, so they work as long as you are online, but they always show live
  production data; there is no local substitute.
- **Images from `cdn.onthepixel.net`** and player avatars are loaded straight
  from the internet.

Everything that comes out of the local database — the news section and article
pages, the creators page, the apply pages and the public API routes under
`/api` — works offline against the seeded database.

## Deployment notes

The schema is owned by the migrations in `drizzle/`. Run `npm run db:migrate`
as part of every deploy; the application itself no longer creates tables unless
`DB_AUTO_MIGRATE=1` is set.

## Page layout

```tsx
import TopPage from "@/components/page/top";

export default function Page() {
  return (
    <section className="bg-gray-950 h-screen">
      <TopPage />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-5">HEADING</h1>
        <p>Content</p>
      </div>
    </section>
  );
}
```
