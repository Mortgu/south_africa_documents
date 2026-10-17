import "server-only";
import { and, asc, eq, gte, isNotNull, isNull, lt, lte, or } from "drizzle-orm";
import { findDocument } from "@/content/documents";
import { db } from "@/lib/db";
import { downloads, subscribers } from "@/lib/db/schema";
import { sendLeadNotification } from "@/lib/email";
import { notifyEnv } from "@/lib/env";

const BATCH_SIZE = 50;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Johannesburg",
  }).format(date) + " SAST";

/** Not yet reported since the latest email confirmation. */
const notNotified = or(isNull(subscribers.notifiedAt), lt(subscribers.notifiedAt, subscribers.lastVerifiedAt));

/**
 * Emails staff about every subscriber whose (latest) email confirmation is at least
 * NOTIFY_DELAY_HOURS old and who hasn't been reported since, including the documents
 * they downloaded in the meantime.
 */
export async function notifyDueSubscribers(): Promise<{ notified: number; failed: number }> {
  const { NOTIFY_EMAILS, NOTIFY_DELAY_HOURS } = notifyEnv();
  const cutoff = new Date(Date.now() - NOTIFY_DELAY_HOURS * 60 * 60 * 1000);

  const due = await db()
    .select()
    .from(subscribers)
    .where(
      and(
        isNotNull(subscribers.lastVerifiedAt),
        lte(subscribers.lastVerifiedAt, cutoff),
        notNotified,
      ),
    )
    .orderBy(asc(subscribers.lastVerifiedAt))
    .limit(BATCH_SIZE);

  let notified = 0;
  let failed = 0;

  for (const s of due) {
    const confirmedAt = s.lastVerifiedAt!;
    // Claim the subscriber first, so overlapping runs (e.g. a manual trigger during the
    // hourly one) never email staff twice. Released again below if sending fails.
    const [claimed] = await db()
      .update(subscribers)
      .set({ notifiedAt: new Date() })
      .where(and(eq(subscribers.id, s.id), notNotified))
      .returning({ id: subscribers.id });
    if (!claimed) continue;

    try {
      const rows = await db()
        .select({ slug: downloads.documentSlug, at: downloads.createdAt })
        .from(downloads)
        .where(and(eq(downloads.subscriberId, s.id), gte(downloads.createdAt, confirmedAt)))
        .orderBy(asc(downloads.createdAt));

      await sendLeadNotification(
        NOTIFY_EMAILS,
        {
          returning: s.verifiedAt !== null && s.verifiedAt < confirmedAt,
          firstName: s.firstName ?? "",
          lastName: s.lastName ?? "",
          company: s.company ?? "–",
          jobTitle: s.jobTitle,
          email: s.email,
          phone: s.phone,
          registeredAt: formatDate(s.verifiedAt ?? confirmedAt),
          confirmedAt: formatDate(confirmedAt),
          downloads: rows.map((d) => ({
            title: findDocument(d.slug)?.title ?? d.slug,
            at: formatDate(d.at),
          })),
          delayHours: NOTIFY_DELAY_HOURS,
        },
      );

      notified++;
    } catch (error) {
      // Retried on the next run.
      console.error(`Failed to notify staff about subscriber ${s.id}`, error);
      await db()
        .update(subscribers)
        .set({ notifiedAt: s.notifiedAt })
        .where(eq(subscribers.id, s.id))
        .catch((e) => console.error(`Failed to release subscriber ${s.id}`, e));
      failed++;
    }
  }

  return { notified, failed };
}
