-- Baseline schema.
--
-- Up to now the tables below were created at runtime by the `ensure*` helpers
-- in `src/lib/db/schema.ts`'s neighbour `migrate.ts`, so they already exist in
-- every deployed database. This migration is therefore written to be idempotent
-- and can be applied to an existing, populated database as a no-op: every
-- statement is guarded, so `npm run db:migrate` simply records the baseline as
-- applied instead of failing on "relation already exists".
--
-- Keep this property in mind when regenerating: `drizzle-kit generate` emits
-- unguarded DDL, which is fine for every FOLLOW-UP migration (those run against
-- a database that is already at this baseline) but was not usable here.

CREATE TABLE IF NOT EXISTS "apply_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'closed' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "apply_positions_name_key" UNIQUE("name"),
	CONSTRAINT "apply_positions_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "creator_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "creators" (
	"id" serial PRIMARY KEY NOT NULL,
	"minecraft_uuid" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creators_minecraft_uuid_key" UNIQUE("minecraft_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"image_url" text,
	"published_at" text NOT NULL,
	"author" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "news_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"news_id" integer NOT NULL,
	"language" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"short_description" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	CONSTRAINT "news_translations_news_id_language_key" UNIQUE("news_id","language")
);
--> statement-breakpoint
-- `author` was added to `news` after the table already existed, so a database
-- older than that change still needs the column.
ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "author" text DEFAULT '' NOT NULL;
--> statement-breakpoint
-- Foreign keys have no `IF NOT EXISTS`, so they are added only when the column
-- does not already carry one. Matching on the column rather than on the
-- constraint name also covers databases whose constraint PostgreSQL happened to
-- name differently — adding a second, redundant foreign key would be worse than
-- skipping.
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conrelid = '"creator_channels"'::regclass
			AND contype = 'f'
			AND conkey = ARRAY[(
				SELECT attnum FROM pg_attribute
				WHERE attrelid = '"creator_channels"'::regclass AND attname = 'creator_id'
			)]
	) THEN
		ALTER TABLE "creator_channels" ADD CONSTRAINT "creator_channels_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conrelid = '"news_translations"'::regclass
			AND contype = 'f'
			AND conkey = ARRAY[(
				SELECT attnum FROM pg_attribute
				WHERE attrelid = '"news_translations"'::regclass AND attname = 'news_id'
			)]
	) THEN
		ALTER TABLE "news_translations" ADD CONSTRAINT "news_translations_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "creator_channels_creator_id_idx" ON "creator_channels" USING btree ("creator_id","sort_order");
--> statement-breakpoint
-- Seed the three positions the apply pages link to. The dashboard can only
-- toggle a position's status, never create one, so an empty table would leave
-- the apply section permanently blank. Seeded as `closed` so nothing opens
-- itself without an admin saying so.
INSERT INTO "apply_positions" ("name", "slug", "status", "sort_order") VALUES
	('Builder', 'builder', 'closed', 0),
	('Supporter', 'supporter', 'closed', 1),
	('Java Developer', 'developer', 'closed', 2)
ON CONFLICT ("name") DO NOTHING;
