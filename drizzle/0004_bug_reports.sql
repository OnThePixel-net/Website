CREATE TABLE "bug_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"steps" text DEFAULT '' NOT NULL,
	"minecraft_name" text DEFAULT '' NOT NULL,
	"discord_id" text,
	"discord_username" text,
	"discord_avatar_url" text,
	"status" text DEFAULT 'new' NOT NULL,
	"internal_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "permissions" SET DEFAULT '{"news":0,"creators":0,"team":0,"apply":0,"bugs":0}'::jsonb;--> statement-breakpoint
CREATE INDEX "bug_reports_created_at_idx" ON "bug_reports" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "bug_reports_status_created_at_idx" ON "bug_reports" USING btree ("status","created_at" DESC NULLS LAST);