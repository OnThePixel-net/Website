#!/usr/bin/env node
/**
 * Importiert die Creators aus dem Directus-CMS in Postgres.
 *
 *   DATABASE_URL=postgres://… node scripts/import-creators.mjs           # Dry-Run
 *   DATABASE_URL=postgres://… node scripts/import-creators.mjs --write   # schreibt
 *
 * Das CMS speichert unter `Minecraft_username` einen Spielernamen, die neue
 * Tabelle braucht aber eine UUID — die Namen werden deshalb ueber die
 * Mojang-API aufgeloest (gebuendelt, 10 Namen pro Anfrage).
 *
 * Der Import ist wiederholbar: bereits vorhandene Creators (gleiche UUID)
 * werden aktualisiert statt doppelt angelegt, die Kanaele werden dabei
 * vollstaendig ersetzt. Die Reihenfolge der Platforms aus dem CMS bleibt
 * erhalten — Platform[0] ist weiterhin der primaere Kanal.
 *
 * Optionen:
 *   --write            Aenderungen wirklich schreiben (ohne: nur Vorschau)
 *   --cms-url=<url>    abweichende CMS-Collection
 *   --skip-existing    vorhandene Creators unveraendert lassen
 */

import postgres from "postgres";

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(name);
const getOpt = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : fallback;
};

const WRITE = hasFlag("--write");
const SKIP_EXISTING = hasFlag("--skip-existing");
const CMS_URL = getOpt(
  "--cms-url",
  "https://cms.onthepixel.net/items/Creators?fields=*.*.*&limit=-1",
);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL ist nicht gesetzt.");
  process.exit(1);
}

const UUID_RE = /^[0-9a-f]{32}$/i;

function dashUuid(raw) {
  const hex = String(raw).replace(/-/g, "").toLowerCase();
  if (!UUID_RE.test(hex)) return null;
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

/** Namen -> UUID ueber die Mojang-Bulk-API (max. 10 Namen pro Anfrage). */
async function resolveUuids(names) {
  const resolved = new Map();

  for (let i = 0; i < names.length; i += 10) {
    const batch = names.slice(i, i + 10);
    try {
      const res = await fetch(
        "https://api.minecraftservices.com/minecraft/profile/lookup/bulk/byname",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batch),
        },
      );
      if (!res.ok) {
        console.warn(`  ! Mojang-Bulk-Lookup fehlgeschlagen (${res.status}), einzeln…`);
        for (const name of batch) {
          const single = await fetch(
            `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(name)}`,
          );
          if (single.ok) {
            const profile = await single.json();
            if (profile?.id) resolved.set(name.toLowerCase(), dashUuid(profile.id));
          }
        }
        continue;
      }
      for (const profile of await res.json()) {
        if (profile?.id && profile?.name)
          resolved.set(profile.name.toLowerCase(), dashUuid(profile.id));
      }
    } catch (e) {
      console.warn(`  ! Lookup-Fehler fuer ${batch.join(", ")}: ${e.message}`);
    }
  }

  return resolved;
}

async function main() {
  console.log(`CMS  : ${CMS_URL}`);
  console.log(`Modus: ${WRITE ? "SCHREIBEN" : "Dry-Run (nichts wird gespeichert)"}\n`);

  const res = await fetch(CMS_URL);
  if (!res.ok) throw new Error(`CMS antwortet mit ${res.status}`);
  const creators = (await res.json())?.data ?? [];
  console.log(`${creators.length} Creators im CMS gefunden.\n`);
  if (creators.length === 0) return;

  // Namen, die noch aufgeloest werden muessen (im CMS koennen auch schon
  // UUIDs stehen — die werden direkt uebernommen).
  const needsLookup = creators
    .map((c) => String(c.Minecraft_username ?? "").trim())
    .filter((v) => v && !dashUuid(v));

  const uuidByName = needsLookup.length
    ? await resolveUuids([...new Set(needsLookup)])
    : new Map();

  // `onnotice` stumm schalten, sonst druckt postgres.js bei jedem Lauf die
  // "relation already exists, skipping"-Hinweise von CREATE TABLE IF NOT EXISTS.
  const sql = postgres(DATABASE_URL, { ssl: false, max: 1, onnotice: () => {} });

  // Tabellen anlegen, falls das Dashboard noch nicht aufgerufen wurde.
  if (WRITE) {
    await sql`
      CREATE TABLE IF NOT EXISTS creators (
        id SERIAL PRIMARY KEY,
        minecraft_uuid TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS creator_channels (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      )`;
    await sql`
      CREATE INDEX IF NOT EXISTS creator_channels_creator_id_idx
        ON creator_channels (creator_id, sort_order)`;
  }

  // Im Dry-Run kann die Tabelle noch fehlen — dann gibt es auch nichts
  // abzufragen, und der Lauf zeigt einfach alle Creators als "neu".
  const [{ exists }] = await sql`
    SELECT to_regclass('public.creators') IS NOT NULL AS exists`;

  let nextOrder = 0;
  if (exists) {
    const [{ max }] = await sql`
      SELECT COALESCE(MAX(sort_order), -1) AS max FROM creators`;
    nextOrder = Number(max) + 1;
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const creator of creators) {
    const name = String(creator.Name ?? "").trim();
    const rawId = String(creator.Minecraft_username ?? "").trim();
    const uuid = dashUuid(rawId) ?? uuidByName.get(rawId.toLowerCase()) ?? null;

    if (!name || !uuid) {
      console.log(`  ÜBERSPRUNGEN  ${name || "(ohne Name)"} — keine UUID fuer "${rawId}"`);
      skipped++;
      continue;
    }

    const channels = (creator.Platforms ?? [])
      .map((p) => ({
        platform: String(p?.Icons ?? "").trim().toLowerCase() || "website",
        url: String(p?.Link ?? "").trim(),
      }))
      .filter((c) => /^https?:\/\/\S+$/i.test(c.url));

    const [existing] = exists
      ? await sql`SELECT id FROM creators WHERE minecraft_uuid = ${uuid} LIMIT 1`
      : [];

    if (existing && SKIP_EXISTING) {
      console.log(`  UNVERAENDERT  ${name}`);
      skipped++;
      continue;
    }

    const action = existing ? "AKTUALISIERT " : "NEU         ";
    console.log(
      `  ${action}  ${name.padEnd(20)} ${uuid}  ${channels.length} Kanal/Kanaele` +
        (channels.length ? ` (primaer: ${channels[0].platform})` : ""),
    );

    if (!WRITE) {
      existing ? updated++ : created++;
      continue;
    }

    let creatorId;
    if (existing) {
      creatorId = existing.id;
      await sql`
        UPDATE creators SET name = ${name}, updated_at = NOW() WHERE id = ${creatorId}`;
      await sql`DELETE FROM creator_channels WHERE creator_id = ${creatorId}`;
      updated++;
    } else {
      const [row] = await sql`
        INSERT INTO creators (minecraft_uuid, name, sort_order)
        VALUES (${uuid}, ${name}, ${nextOrder++})
        RETURNING id`;
      creatorId = row.id;
      created++;
    }

    for (let i = 0; i < channels.length; i++) {
      await sql`
        INSERT INTO creator_channels (creator_id, platform, url, sort_order)
        VALUES (${creatorId}, ${channels[i].platform}, ${channels[i].url}, ${i})`;
    }
  }

  console.log(
    `\n${WRITE ? "Fertig" : "Vorschau"}: ${created} neu, ${updated} aktualisiert, ${skipped} uebersprungen.`,
  );
  if (!WRITE) console.log("Zum Schreiben nochmal mit --write starten.");

  await sql.end();
}

main().catch((e) => {
  console.error(`\nFehlgeschlagen: ${e.message}`);
  process.exit(1);
});
