CREATE TYPE "public"."drive_type" AS ENUM('shared_folder', 'shared_drive');--> statement-breakpoint
CREATE TYPE "public"."hypothesis_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "biograph"."drive_sync" (
	"id" text PRIMARY KEY NOT NULL,
	"start_page_token" text NOT NULL,
	"drive_type" "drive_type" NOT NULL,
	"last_sync_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biograph"."file_metadata" (
	"id" text NOT NULL,
	"hash" text PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"file_size" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tags" text[]
);
--> statement-breakpoint
CREATE TABLE "biograph"."hypotheses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hypothesis" text NOT NULL,
	"files_used" text[],
	"status" "hypothesis_status" DEFAULT 'pending',
	"judgellm_score" numeric(5, 2),
	"human_score" numeric(5, 2),
	"research" text,
	"evaluation" text,
	"citations" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biograph"."hypotheses_summary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hypothesis_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"keywords" text[],
	"scientific_entities" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "biograph"."hypotheses_summary" ADD CONSTRAINT "hypotheses_summary_hypothesis_id_hypotheses_id_fk" FOREIGN KEY ("hypothesis_id") REFERENCES "biograph"."hypotheses"("id") ON DELETE cascade ON UPDATE cascade;