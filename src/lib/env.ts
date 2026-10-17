import "server-only";
import { z } from "zod";

const schema = z.object({
  APP_URL: z.url(),
  DIGNUM_DATABASE_URL: z.url(),
  /** Absolute path of the folder holding the documents (`public/…`, `protected/…`). */
  FILES_DIR: z.string().startsWith("/"),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  /** Optional so a local mail catcher without authentication can be used. */
  SMTP_USER: z.string().default(""),
  SMTP_PASSWORD: z.string().default(""),
  EMAIL_FROM: z.string().min(3),
  SESSION_SECRET: z.string().min(32),
});

let cached: z.infer<typeof schema> | undefined;

/** Validated server environment. Parsed lazily so `next build` works without secrets. */
export function env() {
  cached ??= schema.parse(process.env);
  return cached;
}

const notifySchema = z.object({
  NOTIFY_EMAILS: z
    .string()
    .transform((v) => v.split(",").map((e) => e.trim()).filter(Boolean))
    .pipe(z.array(z.email()).min(1)),
  NOTIFY_DELAY_HOURS: z.coerce.number().min(0).default(24),
  CRON_SECRET: z.string().min(16),
});

let notifyCached: z.infer<typeof notifySchema> | undefined;

/** Settings for the staff notification job, validated separately so the site runs without them. */
export function notifyEnv() {
  notifyCached ??= notifySchema.parse(process.env);
  return notifyCached;
}
