export type DocumentAccess = "public" | "protected";

export type DocumentEntry = {
  /** URL-safe identifier, used in /api/download/[slug] */
  slug: string;
  title: string;
  description: string;
  /** Pathname in the private Vercel Blob store. Its basename is the downloaded file name. */
  storageKey: string;
  access: DocumentAccess;
};

// Placeholder content taken from the design mockup — replace with the real documents.
export const documents: DocumentEntry[] = [
  {
    slug: "company-profile",
    title: "Company Profile",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "public/dignum-company-profile.pdf",
    access: "public",
  },
  {
    slug: "backup-recovery-archive",
    title: "Service Overview Backup, Recovery & Archive",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "public/dignum-backup-recovery-archive.pdf",
    access: "public",
  },
  {
    slug: "server-storage-cloud",
    title: "Service Overview Server, Storage & Cloud",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "public/dignum-server-storage-cloud.pdf",
    access: "public",
  },
  {
    slug: "backup-resilience-ransomware",
    title: "Backup Resilience vs. Ransomware",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "protected/dignum-backup-resilience-ransomware.pdf",
    access: "protected",
  },
  {
    slug: "das-auditing-toolset",
    title: "dAS – dignum Auditing toolSet",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "protected/dignum-das-auditing-toolset.pdf",
    access: "protected",
  },
  {
    slug: "backup-risk-assessment",
    title: "Backup Risk Assessment",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "protected/dignum-backup-risk-assessment.pdf",
    access: "protected",
  },
];

export function findDocument(slug: string): DocumentEntry | undefined {
  return documents.find((doc) => doc.slug === slug);
}
