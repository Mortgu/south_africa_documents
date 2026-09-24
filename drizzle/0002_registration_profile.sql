-- Magic-link tokens are short-lived; drop pending ones so the NOT NULL profile column can be added.
DELETE FROM "verification_tokens";--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "job_title" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD COLUMN "profile" jsonb NOT NULL;