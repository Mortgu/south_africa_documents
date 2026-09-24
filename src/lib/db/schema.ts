import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Registration details entered in the access form. */
export type Profile = {
  firstName: string;
  lastName: string;
  company: string;
  jobTitle?: string;
  phone?: string;
};

/** Visitors who confirmed their email address. */
export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  jobTitle: text("job_title"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  consentAt: timestamp("consent_at", { withTimezone: true }),
});

/**
 * Magic-link tokens. Only the SHA-256 hash of the token is stored. The form details wait
 * here until the email address is confirmed, so unconfirmed data never reaches `subscribers`.
 */
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    email: text("email").notNull(),
    profile: jsonb("profile").$type<Profile>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
  },
  // Used by the per-email rate limit.
  (t) => [index("verification_tokens_email_created_at_idx").on(t.email, t.createdAt)],
);

/** Download log. subscriberId is null for anonymous downloads of free documents. */
export const downloads = pgTable(
  "downloads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriberId: uuid("subscriber_id").references(() => subscribers.id, { onDelete: "set null" }),
    documentSlug: text("document_slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("downloads_document_slug_idx").on(t.documentSlug)],
);
