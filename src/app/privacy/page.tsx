import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { company } from "@/content/company";

export const metadata: Metadata = { title: "Privacy Policy" };

// NOTE: Draft written for this download portal (POPIA, with GDPR note for EU visitors).
// Have it reviewed by a legal advisor before going live.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <LegalSection title="Who is responsible">
        <p className="m-0">
          {company.name}, {company.street}, {company.city}, {company.country}
          <br />
          Information Officer: {company.management}
          <br />
          Email: <a href={`mailto:${company.email}`}>{company.email}</a>
        </p>
        <p className="m-0 text-body">
          This policy explains how we process personal information on this download portal.
        </p>
      </LegalSection>

      <LegalSection title="Freely available documents">
        <p className="m-0 text-body">
          You can download freely available documents without providing any personal
          information. We record which document was downloaded and when, without linking this to
          you.
        </p>
      </LegalSection>

      <LegalSection title="Registration for protected documents">
        <p className="m-0 text-body">
          To unlock protected documents, you register with a short form and confirm your email
          address via a link we send you. With your consent, we store:
        </p>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-6 text-body">
          <li>your first name, last name and company,</li>
          <li>your function and mobile phone number, if you provide them,</li>
          <li>your email address,</li>
          <li>when you gave your consent and confirmed your email address,</li>
          <li>which protected documents you downloaded and when.</li>
        </ul>
        <p className="m-0 text-body">
          We use this information to give you access to the documents and to understand who is
          interested in them. Until you confirm your email address, your details are kept only
          together with the confirmation link, which expires after 30 minutes. You can withdraw
          your consent at any time by emailing us; we will then delete your information.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p className="m-0 text-body">
          After you confirm your email address, we set a single, technically necessary cookie
          (&ldquo;dl_session&rdquo;) that keeps you signed in and the protected documents unlocked
          in your browser for 30 days. We do not use tracking or advertising cookies.
        </p>
      </LegalSection>

      <LegalSection title="Service providers">
        <p className="m-0 text-body">
          We use the following providers, who process information on our behalf:
        </p>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-6 text-body">
          <li>Vercel Inc. (website hosting and document storage),</li>
          <li>Neon / Databricks (database),</li>
          <li>Resend (sending the confirmation email).</li>
        </ul>
        <p className="m-0 text-body">
          Their servers may be located outside South Africa, for example in the United States or
          the European Union. When you visit this website, the hosting provider also processes
          technical data such as your IP address, browser type and time of access to deliver the
          website securely.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep your information">
        <p className="m-0 text-body">
          We keep your registration details and download history until you withdraw your consent
          or ask us to delete them.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p className="m-0 text-body">
          You have the right to access, correct and delete your personal information, to object
          to its processing and to withdraw your consent. To exercise these rights, contact us at{" "}
          <a href={`mailto:${company.email}`}>{company.email}</a>. You may also lodge a complaint
          with the Information Regulator of South Africa (inforeg.org.za). If you are in the
          European Union, you have equivalent rights under the GDPR, including the right to
          complain to your local data protection authority.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
