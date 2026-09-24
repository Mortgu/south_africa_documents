export type DocumentAccess = "public" | "protected";

export type DocumentEntry = {
  /** URL-safe identifier, used in /api/download/[slug] */
  slug: string;
  category: string;
  title: string;
  description: string;
  /** Pathname in the private Vercel Blob store. Its basename is the downloaded file name. */
  storageKey: string;
  /** Human-readable size, e.g. "2.4 MB" */
  size: string;
  access: DocumentAccess;
};

// Placeholder content taken from the design mockup — replace with the real documents.
export const documents: DocumentEntry[] = [
  {
    slug: "company-profile",
    category: "Company",
    title: "Company Profile",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "public/dignum-company-profile.pdf",
    size: "[SIZE]",
    access: "public",
  },
  {
    slug: "backup-recovery-archive",
    category: "Services",
    title: "Service Overview Backup, Recovery & Archive",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "public/dignum-backup-recovery-archive.pdf",
    size: "[SIZE]",
    access: "public",
  },
  {
    slug: "server-storage-cloud",
    category: "Services",
    title: "Service Overview Server, Storage & Cloud",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "public/dignum-server-storage-cloud.pdf",
    size: "[SIZE]",
    access: "public",
  },
  {
    slug: "backup-resilience-ransomware",
    category: "White Paper",
    title: "Backup Resilience vs. Ransomware",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "protected/dignum-backup-resilience-ransomware.pdf",
    size: "[SIZE]",
    access: "protected",
  },
  {
    slug: "das-auditing-toolset",
    category: "Product Sheet",
    title: "dAS – dignum Auditing toolSet",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "protected/dignum-das-auditing-toolset.pdf",
    size: "[SIZE]",
    access: "protected",
  },
  {
    slug: "backup-risk-assessment",
    category: "Checklist",
    title: "Backup Risk Assessment",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    storageKey: "protected/dignum-backup-risk-assessment.pdf",
    size: "[SIZE]",
    access: "protected",
  },
];

export function findDocument(slug: string): DocumentEntry | undefined {
  return documents.find((doc) => doc.slug === slug);
}
