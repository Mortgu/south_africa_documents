export type DocumentAccess = "public" | "protected";

export type DocumentEntry = {
  /** URL-safe identifier, used in /api/download/[slug] */
  slug: string;
  category: string;
  title: string;
  description: string;
  /** Object key inside the S3 bucket */
  s3Key: string;
  /** File name the visitor's browser saves the download as */
  fileName: string;
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
    s3Key: "public/company-profile.pdf",
    fileName: "dignum-company-profile.pdf",
    size: "[SIZE]",
    access: "public",
  },
  {
    slug: "backup-recovery-archive",
    category: "Services",
    title: "Service Overview Backup, Recovery & Archive",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    s3Key: "public/backup-recovery-archive.pdf",
    fileName: "dignum-backup-recovery-archive.pdf",
    size: "[SIZE]",
    access: "public",
  },
  {
    slug: "server-storage-cloud",
    category: "Services",
    title: "Service Overview Server, Storage & Cloud",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    s3Key: "public/server-storage-cloud.pdf",
    fileName: "dignum-server-storage-cloud.pdf",
    size: "[SIZE]",
    access: "public",
  },
  {
    slug: "backup-resilience-ransomware",
    category: "White Paper",
    title: "Backup Resilience vs. Ransomware",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    s3Key: "protected/backup-resilience-ransomware.pdf",
    fileName: "dignum-backup-resilience-ransomware.pdf",
    size: "[SIZE]",
    access: "protected",
  },
  {
    slug: "das-auditing-toolset",
    category: "Product Sheet",
    title: "dAS – dignum Auditing toolSet",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    s3Key: "protected/das-auditing-toolset.pdf",
    fileName: "dignum-das-auditing-toolset.pdf",
    size: "[SIZE]",
    access: "protected",
  },
  {
    slug: "backup-risk-assessment",
    category: "Checklist",
    title: "Backup Risk Assessment",
    description: "[SHORT DESCRIPTION OF THE DOCUMENT]",
    s3Key: "protected/backup-risk-assessment.pdf",
    fileName: "dignum-backup-risk-assessment.pdf",
    size: "[SIZE]",
    access: "protected",
  },
];

export function findDocument(slug: string): DocumentEntry | undefined {
  return documents.find((doc) => doc.slug === slug);
}
