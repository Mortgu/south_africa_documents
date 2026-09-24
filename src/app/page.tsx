import { DocumentGrid, type PublicDocument } from "@/components/DocumentGrid";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { documents } from "@/content/documents";
import { getSession } from "@/lib/session";

export default async function DownloadsPage({ searchParams }: PageProps<"/">) {
  // Only pass display fields to the client — storage keys stay on the server.
  const publicDocs: PublicDocument[] = documents.map(
    ({ slug, category, title, description, size, access }) => ({
      slug,
      category,
      title,
      description,
      size,
      access,
    }),
  );

  const session = await getSession();
  const { unlocked, verify } = await searchParams;

  return (
    <>
      <Hero title="Downloads" />
      <main className="flex grow flex-col gap-12 px-4 pt-12 pb-16 sm:px-10 lg:px-20 lg:pt-20 lg:pb-24">
        <DocumentGrid
          documents={publicDocs}
          verifiedEmail={session?.email ?? null}
          unlockedSlug={typeof unlocked === "string" ? unlocked : undefined}
          verifyFailed={verify === "error"}
        />
        <HowItWorks />
      </main>
    </>
  );
}
