"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type InputHTMLAttributes } from "react";
import {
  requestAccess,
  type RegistrationField,
  type RegistrationInput,
} from "@/actions/requestAccess";
import { MailIcon } from "@/components/icons";

type TextField = Exclude<RegistrationField, "consent">;
type Values = Record<TextField, string>;
type Errors = Partial<Record<RegistrationField, string>>;

const EMPTY: Values = { firstName: "", lastName: "", company: "", jobTitle: "", phone: "", email: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[+()\d\s/-]{6,25}$/;

/** Client-side mirror of the server validation, for instant feedback. */
function validate(values: Values, consent: boolean): Errors {
  const errors: Errors = {};
  if (!values.company.trim()) errors.company = "Please enter your company.";
  if (!values.firstName.trim()) errors.firstName = "Please enter your first name.";
  if (!values.lastName.trim()) errors.lastName = "Please enter your last name.";
  if (values.phone.trim() && !PHONE_PATTERN.test(values.phone.trim()))
    errors.phone = "Please enter a valid phone number.";
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Please enter a valid email address.";
  if (!consent) errors.consent = "Please accept the privacy notice.";
  return errors;
}

export function AccessPanel({ verifyFailed }: { verifyFailed: boolean }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [tried, setTried] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  // Drop ?verify=error from the URL so a reload doesn't show the notice again.
  useEffect(() => {
    if (verifyFailed) window.history.replaceState(null, "", window.location.pathname);
  }, [verifyFailed]);

  // While waiting for the email link: detect when it's opened in another tab of this browser.
  useEffect(() => {
    if (!sent) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        const { verified } = (await res.json()) as { verified: boolean };
        if (verified) router.refresh();
      } catch {
        // Ignore network hiccups; the next poll retries.
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sent, router]);

  const errors: Errors = { ...(tried ? validate(values, consent) : {}), ...serverErrors };

  const clearServerError = (field: RegistrationField) =>
    setServerErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const set = (field: TextField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    clearServerError(field);
  };

  function submit() {
    setTried(true);
    setFormError(null);
    if (Object.keys(validate(values, consent)).length > 0) return;
    startTransition(async () => {
      const input: RegistrationInput = { ...values, consent: true };
      const result = await requestAccess(input);
      if (result.ok) {
        setSent(true);
        setTried(false);
      } else {
        setServerErrors(result.fieldErrors ?? {});
        setFormError(result.error ?? null);
      }
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-5 bg-mist p-6 lg:p-9">
        <MailIcon size={48} strokeWidth={1.25} className="text-sky" />
        <div className="flex flex-col gap-1.5">
          <h3 className="m-0 text-2xl leading-[1.3] font-normal">Please check your inbox</h3>
          <p className="m-0 text-[15px] leading-relaxed text-body">
            We&apos;ve sent a confirmation link to{" "}
            <strong className="font-semibold text-ink">{values.email.trim()}</strong>. Once you
            click the link, the protected documents are available for download.
          </p>
        </div>
        {formError && <span className="text-sm text-error">{formError}</span>}
        <div className="flex">
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setSent(false);
            }}
            className="btn btn-ghost px-5 pt-[15px] pb-[13px]"
          >
            Change details
          </button>
        </div>
        <p className="m-0 text-sm text-muted">
          Didn&apos;t receive an email? Check your spam folder or{" "}
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="cursor-pointer text-accent transition-colors hover:text-ink"
          >
            {pending ? "sending…" : "resend the link"}
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      aria-labelledby="form-h"
      className="flex flex-col gap-5 bg-mist p-6 lg:p-9"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <h3 id="form-h" className="m-0 text-2xl leading-[1.3] font-normal">
          Register &amp; unlock documents
        </h3>
        <p className="m-0 text-[15px] leading-relaxed text-body">
          Fill in the form and confirm your email address – the protected documents are then
          available for download.
        </p>
      </div>

      {verifyFailed && (
        <div role="alert" className="border border-error bg-white px-4 py-3 text-[15px] text-error">
          This confirmation link is invalid or has expired. Please submit the form again to
          receive a new one.
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-5 gap-y-[18px] sm:grid-cols-2">
        <Field id="company" label="Company" required wide error={errors.company}
          autoComplete="organization" value={values.company} onChange={set("company")} />
        <Field id="firstName" label="First name" required error={errors.firstName}
          autoComplete="given-name" value={values.firstName} onChange={set("firstName")} />
        <Field id="lastName" label="Last name" required error={errors.lastName}
          autoComplete="family-name" value={values.lastName} onChange={set("lastName")} />
        <Field id="jobTitle" label="Function" wide error={errors.jobTitle}
          autoComplete="organization-title" value={values.jobTitle} onChange={set("jobTitle")} />
        <Field id="phone" label="Mobile phone" type="tel" placeholder="+27 …" error={errors.phone}
          autoComplete="tel" value={values.phone} onChange={set("phone")} />
        <Field id="email" label="Email" required type="email" placeholder="name@company.co.za"
          error={errors.email} autoComplete="email" value={values.email} onChange={set("email")} />
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-normal text-body">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            clearServerError("consent");
          }}
          aria-invalid={Boolean(errors.consent)}
          className="mt-px size-5 shrink-0 accent-accent"
        />
        <span>
          I have read the{" "}
          <Link href="/privacy" target="_blank">
            privacy notice
          </Link>{" "}
          and consent to the processing of my details. *
        </span>
      </label>
      {errors.consent && <span className="-mt-2 text-sm text-error">{errors.consent}</span>}
      {formError && <span className="-mt-2 text-sm text-error">{formError}</span>}

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[13px] text-muted">* Required field</span>
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full px-8 pt-[17px] pb-[15px] text-sm sm:w-auto"
        >
          {pending ? "Sending…" : "Submit & unlock"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  required?: boolean;
  wide?: boolean;
  error?: string;
};

function Field({ id, label, required, wide, error, type = "text", ...input }: FieldProps) {
  const inputId = `reg-${id}`;
  return (
    <div className={`flex flex-col gap-2 ${wide ? "sm:col-span-2" : ""}`}>
      <label htmlFor={inputId} className="text-[13px] font-semibold tracking-[0.075em] uppercase">
        {label}
        {required ? (
          " *"
        ) : (
          <span className="font-normal tracking-[0.04em] text-muted normal-case"> (optional)</span>
        )}
      </label>
      <input
        id={inputId}
        type={type}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`min-h-[52px] w-full border bg-white px-[18px] py-[13px] text-[15px] font-medium tracking-[0.025em] text-ink focus:border-accent focus:outline-none ${
          error ? "border-error" : "border-line-strong"
        }`}
        {...input}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-sm text-error">
          {error}
        </span>
      )}
    </div>
  );
}
