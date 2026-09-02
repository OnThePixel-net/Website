ALTER TABLE "creators" ADD COLUMN "discord_id" text;--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_discord_id_key" UNIQUE("discord_id");