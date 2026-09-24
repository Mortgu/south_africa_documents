"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { requestAccess } from "@/actions/requestAccess";
import type { PublicDocument } from "@/components/DocumentGrid";
import { CheckCircleIcon, CloseIcon, DownloadIcon, MailIcon } from "@/components/icons";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Step = "form" | "sent" | "done";

type Props = {
  doc: PublicDocument;
  verifiedEmail: string | null;
  onVerified: (email: string) => void;
  onClose: () => void;
};

export function UnlockModal({ doc, verifiedEmail, onVerified, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>(verifiedEmail ? "done" : "form");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [tried, setTried] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // No cleanup: calling close() would fire onClose. Unmounting the element ends the modal state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  // While waiting for the email link: detect when it's opened in another tab of this browser.
  useEffect(() => {
    if (step !== "sent") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        const { email } = (await res.json()) as { email: string | null };
        if (email) {
          onVerified(email);
          setStep("done");
        }
      } catch {
        // Ignore network hiccups; the next poll retries.
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [step, onVerified]);

  const emailOk = EMAIL_PATTERN.test(email.trim());
  const showEmailError = tried && !emailOk;
  const showConsentError = tried && !consent;

  function send() {
    setTried(true);
    if (!emailOk || !consent) return;
    setServerError(null);
    startTransition(async () => {
      const result = await requestAccess({ email: email.trim(), consent, slug: doc.slug });
      if (result.ok) {
        setStep("sent");
        setTried(false);
      } else {
        setServerError(result.error);
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dlg-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[calc(100%-32px)] max-w-[560px] bg-white p-0 text-ink shadow-dialog backdrop:bg-ink/60"
    >
      <div className="relative flex flex-col gap-6 px-6 py-10 sm:p-12">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center text-ink"
        >
          <CloseIcon size={20} />
        </button>

        {step === "form" && (
          <form
            noValidate
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="eyebrow text-accent">Unlock document</div>
              <h2 id="dlg-title" className="m-0 text-[30px] leading-[1.3] font-light">
                {doc.title}
              </h2>
              <p className="m-0 text-[15px] leading-relaxed text-body">
                Enter your email address. We&apos;ll send you a link to confirm your address.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="dl-email" className="text-[13px] font-semibold tracking-[0.075em] uppercase">
                Email address
              </label>
              <input
                id="dl-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={showEmailError}
                aria-describedby={showEmailError ? "dl-email-error" : undefined}
                className={`min-h-[60px] w-full border bg-field px-[22px] py-[17px] text-[15px] font-medium tracking-[0.025em] text-ink focus:border-accent focus:outline-none ${
                  showEmailError ? "border-error" : "border-field"
                }`}
              />
              {showEmailError && (
                <span id="dl-email-error" className="text-sm text-error">
                  Please enter a valid email address.
                </span>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-normal text-body">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-px size-5 shrink-0 accent-accent"
              />
              <span>
                I have read the{" "}
                <Link href="/privacy" target="_blank">
                  privacy notice
                </Link>{" "}
                and consent to the processing of my email address.
              </span>
            </label>
            {showConsentError && (
              <span className="-mt-3 text-sm text-error">Please accept the privacy notice.</span>
            )}
            {serverError && <span className="-mt-3 text-sm text-error">{serverError}</span>}

            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary w-full px-8 pt-[17px] pb-[15px] text-sm"
            >
              {pending ? "Sending…" : "Request confirmation link"}
            </button>
          </form>
        )}

        {step === "sent" && (
          <div className="flex flex-col gap-6">
            <MailIcon size={56} strokeWidth={1.25} className="text-sky" />
            <div className="flex flex-col gap-2">
              <h2 id="dlg-title" className="m-0 text-[30px] leading-[1.3] font-light">
                Please check your inbox
              </h2>
              <p className="m-0 text-[15px] leading-relaxed text-body">
                We&apos;ve sent a confirmation link to{" "}
                <strong className="font-semibold text-ink">{email.trim()}</strong>. Once you click
                the link, you can download the document.
              </p>
            </div>
            <div className="flex">
              <button
                type="button"
                onClick={() => {
                  setServerError(null);
                  setStep("form");
                }}
                className="btn btn-ghost px-5 pt-[17px] pb-[15px]"
              >
                Change address
              </button>
            </div>
            {serverError && <span className="-mt-3 text-sm text-error">{serverError}</span>}
            <p className="m-0 text-sm text-muted">
              Didn&apos;t receive an email? Check your spam folder or{" "}
              <button
                type="button"
                onClick={send}
                disabled={pending}
                className="cursor-pointer text-accent transition-colors hover:text-ink"
              >
                {pending ? "sending…" : "resend the link"}
              </button>
              .
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col gap-6">
            <CheckCircleIcon size={56} strokeWidth={1.5} className="text-sky" />
            <div className="flex flex-col gap-2">
              <h2 id="dlg-title" className="m-0 text-[30px] leading-[1.3] font-light">
                Email address confirmed
              </h2>
              <p className="m-0 text-[15px] leading-relaxed text-body">
                Thank you. “{doc.title}” and all other protected documents are now unlocked.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                className="btn btn-primary grow px-5 pt-[17px] pb-[15px]"
                href={`/api/download/${doc.slug}`}
              >
                <DownloadIcon size={16} />
                Download now
              </a>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost px-5 pt-[17px] pb-[15px]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
