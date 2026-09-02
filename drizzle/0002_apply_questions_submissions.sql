CREATE TABLE "apply_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"position_id" integer NOT NULL,
	"field_key" text NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"label_en" text DEFAULT '' NOT NULL,
	"label_de" text DEFAULT '' NOT NULL,
	"placeholder_en" text DEFAULT '' NOT NULL,
	"placeholder_de" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_de" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "apply_questions_position_id_field_key_key" UNIQUE("position_id","field_key")
);
--> statement-breakpoint
CREATE TABLE "apply_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"position_id" integer,
	"position_name" text NOT NULL,
	"position_slug" text NOT NULL,
	"discord_id" text NOT NULL,
	"discord_username" text NOT NULL,
	"discord_avatar_url" text,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"internal_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "apply_positions" ADD COLUMN "description_en" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "apply_positions" ADD COLUMN "description_de" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "apply_questions" ADD CONSTRAINT "apply_questions_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."apply_positions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apply_submissions" ADD CONSTRAINT "apply_submissions_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."apply_positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apply_questions_position_id_idx" ON "apply_questions" USING btree ("position_id","sort_order");--> statement-breakpoint
CREATE INDEX "apply_submissions_position_id_created_at_idx" ON "apply_submissions" USING btree ("position_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "apply_submissions_created_at_idx" ON "apply_submissions" USING btree ("created_at" DESC NULLS LAST);