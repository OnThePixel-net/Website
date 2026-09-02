#!/bin/sh
# Applies pending migrations, then hands over to the Next.js server.
#
# The schema is owned by the migrations in drizzle/, and a container running
# against a database that has not caught up fails at request time with errors
# like `column "discord_id" does not exist` — which is what happens when the
# deploy and the migration are two separate manual steps and the order slips.
# Doing it here makes the two impossible to get out of order.
#
# Failing is deliberate: if the migration does not go through, the old version
# keeps serving rather than a new one talking to a schema it does not fit.
# Concurrent starts are safe, scripts/migrate.mjs takes an advisory lock.
#
# Set SKIP_MIGRATIONS=1 to start without migrating, e.g. to bring the app up
# while investigating a migration that fails.
set -e

if [ "$SKIP_MIGRATIONS" = "1" ]; then
  echo "[entrypoint] SKIP_MIGRATIONS=1 — starting without migrating"
else
  node scripts/migrate.mjs
fi

# exec so the server replaces this shell as PID 1 and receives SIGTERM directly;
# otherwise the shell would swallow it and the container would be killed after
# the timeout instead of shutting down cleanly.
exec node server.js
