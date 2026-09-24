import type { ReactNode } from "react";
import { AccessPanel } from "@/components/AccessPanel";
import { DocumentItem } from "@/components/DocumentItem";
import { Hero } from "@/components/Hero";
import { SignedInBanner } from "@/components/SignedInBanner";
import { documents } from "@/content/documents";
import { getSubscriber } from "@/lib/session";

export default async function DownloadsPage({ searchParams }: PageProps<"/">) {
  const subscriber = await getSubscriber();
  const { verify } = await searchParams;

  const freeDocs = documents.filter((d) => d.access === "public");
  const protectedDocs = documents.filter((d) => d.access === "protected");

  return (
    <>
      <Hero title="Downloads">
        Download our freely available documents right away. Further documents are unlocked with a
        short registration.
      </Hero>
      <main className="grid grow grid-cols-1 items-start gap-16 px-4 pt-10 pb-16 sm:px-10 lg:grid-cols-2 lg:gap-12 lg:px-20 lg:pt-[72px] lg:pb-24">
        <Column id="free" title="Freely available documents">
          {freeDocs.map((doc) => (
            <DocumentItem key={doc.slug} doc={doc} locked={false} />
          ))}
        </Column>

        <Column id="protected" title="Protected documents">
          {subscriber ? (
            <SignedInBanner subscriber={subscriber} />
          ) : (
            <AccessPanel verifyFailed={verify === "error"} />
          )}
          {protectedDocs.map((doc) => (
            <DocumentItem key={doc.slug} doc={doc} locked={!subscriber} />
          ))}
        </Column>
      </main>
    </>
  );
}

function Column({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="flex scroll-mt-6 flex-col gap-6">
      <h2
        id={`${id}-h`}
        className="m-0 border-b-2 border-ink pb-6 text-[28px] leading-[1.29] font-extralight lg:text-4xl"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
