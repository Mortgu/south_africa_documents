import type { DocumentEntry } from "@/content/documents";
import { DownloadIcon, FileIcon, LockIcon } from "@/components/icons";

type Props = { doc: DocumentEntry; locked: boolean };

export function DocumentItem({ doc, locked }: Props) {
  return (
    <article className="flex items-start gap-4 border-b border-line pt-2 pb-8 sm:gap-5">
      <FileIcon size={40} strokeWidth={1.25} className="shrink-0 text-sky" />
      <div className="flex grow flex-col gap-2">
        <h3 className="m-0 text-[21px] leading-[1.3] font-medium">{doc.title}</h3>
        <p className="m-0 text-[15px] leading-relaxed text-body">{doc.description}</p>
        <div className="mt-2 flex min-h-11 items-center">
          {locked ? (
            <span className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.075em] text-muted uppercase">
              <LockIcon size={15} strokeWidth={2.25} />
              Available after registration
            </span>
          ) : (
            <a className="btn btn-primary px-5 pt-3 pb-[11px]" href={`/api/download/${doc.slug}`}>
              <DownloadIcon size={16} />
              Download
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
