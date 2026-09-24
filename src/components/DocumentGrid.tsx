"use client";

import { useEffect, useState } from "react";
import type { DocumentEntry } from "@/content/documents";
import { DocumentCard } from "@/components/DocumentCard";
import { CheckIcon } from "@/components/icons";
import { UnlockModal } from "@/components/UnlockModal";

/** The subset of a document that is safe to send to the browser. */
export type PublicDocument = Pick<
  DocumentEntry,
  "slug" | "category" | "title" | "description" | "size" | "access"
>;

type Filter = "all" | "public" | "protected";

type Props = {
  documents: PublicDocument[];
  /** Email of the verified visitor, or null if not verified. */
  verifiedEmail: string | null;
  /** Slug of the document the visitor just unlocked via the email link. */
  unlockedSlug?: string;
  /** The email link was invalid or expired. */
  verifyFailed?: boolean;
};

export function DocumentGrid({ documents, verifiedEmail, unlockedSlug, verifyFailed }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [email, setEmail] = useState(verifiedEmail);
  const [modalDoc, setModalDoc] = useState<PublicDocument | null>(
    () => (verifiedEmail && documents.find((d) => d.slug === unlockedSlug)) || null,
  );

  // Drop ?unlocked / ?verify from the URL so a reload doesn't reopen the modal.
  useEffect(() => {
    if (unlockedSlug || verifyFailed) window.history.replaceState(null, "", window.location.pathname);
  }, [unlockedSlug, verifyFailed]);

  const verified = email !== null;
  const count = (access: PublicDocument["access"]) =>
    documents.filter((d) => d.access === access).length;

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: `All (${documents.length})` },
    { id: "public", label: `Free (${count("public")})` },
    { id: "protected", label: `Email required (${count("protected")})` },
  ];

  const visible = filter === "all" ? documents : documents.filter((d) => d.access === filter);

  return (
    <>
      <div className="flex flex-col justify-between gap-10 xl:flex-row xl:items-end xl:gap-12">
        <div className="flex max-w-[640px] flex-col gap-4">
          <h2 className="m-0 text-[32px] leading-[1.29] font-extralight tracking-[0.024em] lg:text-[40px]">
            Documents &amp; Resources
          </h2>
          <p className="m-0 text-[17px] leading-relaxed">
            Product sheets, white papers and checklists to download. Some documents are freely
            available; for others, simply confirm your email address once.
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Filter documents"
          className="flex shrink-0 gap-6 overflow-x-auto border-b border-line sm:gap-8"
        >
          {tabs.map((tab) => {
            const selected = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setFilter(tab.id)}
                className={`-mb-px min-h-11 shrink-0 cursor-pointer border-b-2 pb-3.5 text-sm font-semibold tracking-[0.075em] whitespace-nowrap uppercase transition-colors hover:text-accent ${
                  selected ? "border-accent text-accent" : "border-transparent text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {verifyFailed && !verified && (
        <div role="alert" className="border border-error px-6 py-[18px] text-[15px] text-error">
          This confirmation link is invalid or has expired. Please request a new one via
          &ldquo;Unlock&rdquo;.
        </div>
      )}

      {verified && (
        <div role="status" className="flex items-center gap-4 bg-ink px-6 py-[18px] text-[15px] text-white">
          <CheckIcon size={22} className="shrink-0 text-sky" />
          <span>
            Email address <strong className="font-semibold">{email}</strong> confirmed. All
            protected documents are unlocked.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-[30px] md:grid-cols-2 lg:grid-cols-3">
        {visible.map((doc) => (
          <DocumentCard key={doc.slug} doc={doc} verified={verified} onUnlock={setModalDoc} />
        ))}
      </div>

      {modalDoc && (
        <UnlockModal
          doc={modalDoc}
          verifiedEmail={email}
          onVerified={setEmail}
          onClose={() => setModalDoc(null)}
        />
      )}
    </>
  );
}
