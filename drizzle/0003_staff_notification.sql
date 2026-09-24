ALTER TABLE "subscribers" ADD COLUMN "last_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "notified_at" timestamp with time zone;--> statement-breakpoint
-- Existing subscribers count as already notified; only new confirmations trigger staff emails.
UPDATE "subscribers" SET "last_verified_at" = "verified_at", "notified_at" = now();