CREATE TABLE "downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" uuid,
	"document_slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone,
	"consent_at" timestamp with time zone,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"document_slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "downloads_document_slug_idx" ON "downloads" USING btree ("document_slug");--> statement-breakpoint
CREATE INDEX "verification_tokens_email_created_at_idx" ON "verification_tokens" USING btree ("email","created_at");