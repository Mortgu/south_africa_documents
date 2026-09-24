import type { PublicDocument } from "@/components/DocumentGrid";
import { CheckIcon, DownloadIcon, FileIcon, LockIcon } from "@/components/icons";

const badge = "eyebrow flex items-center gap-1.5 px-3 py-1.5 text-xs";

type Props = {
  doc: PublicDocument;
  verified: boolean;
  onUnlock: (doc: PublicDocument) => void;
};

export function DocumentCard({ doc, verified, onUnlock }: Props) {
  const isProtected = doc.access === "protected";
  const locked = isProtected && !verified;

  return (
    <article className="flex min-h-[300px] flex-col gap-5 border border-line bg-white px-6 pt-9 pb-8 transition-shadow duration-300 hover:shadow-card sm:px-8">
      <div className="flex items-start justify-between">
        <FileIcon size={44} strokeWidth={1.25} className="text-sky" />
        {!isProtected && <span className={`${badge} bg-mist text-ink`}>Free</span>}
        {locked && (
          <span className={`${badge} border border-accent text-accent`}>
            <LockIcon size={13} strokeWidth={2.25} />
            Email required
          </span>
        )}
        {isProtected && !locked && (
          <span className={`${badge} bg-ink text-white`}>
            <CheckIcon size={13} strokeWidth={2.5} />
            Unlocked
          </span>
        )}
      </div>

      <div className="flex grow flex-col gap-2.5">
        <div className="eyebrow text-muted">{doc.category}</div>
        <h3 className="m-0 text-[22px] leading-[1.3] font-medium tracking-[0.024em]">{doc.title}</h3>
        <p className="m-0 text-[15px] leading-relaxed text-body">{doc.description}</p>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line-light pt-5">
        <span className="text-[13px] font-medium text-muted">PDF · {doc.size}</span>
        {locked ? (
          <button
            type="button"
            className="btn btn-dark px-[22px] pt-[13px] pb-3"
            onClick={() => onUnlock(doc)}
          >
            <LockIcon size={16} />
            Unlock
          </button>
        ) : (
          <a className="btn btn-primary px-[22px] pt-[13px] pb-3" href={`/api/download/${doc.slug}`}>
            <DownloadIcon size={16} />
            Download
          </a>
        )}
      </div>
    </article>
  );
}
