import { DocumentGrid, type PublicDocument } from "@/components/DocumentGrid";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { documents } from "@/content/documents";

export default function DownloadsPage() {
  // Only pass display fields to the client — S3 keys stay on the server.
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

  // TODO (step 4/5): read the session cookie and pass the verified email.
  const verifiedEmail = null;

  return (
    <>
      <Hero title="Downloads" />
      <main className="flex grow flex-col gap-12 px-4 pt-12 pb-16 sm:px-10 lg:px-20 lg:pt-20 lg:pb-24">
        <DocumentGrid documents={publicDocs} verifiedEmail={verifiedEmail} />
        <HowItWorks />
      </main>
    </>
  );
}
