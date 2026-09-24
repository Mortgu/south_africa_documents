import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { company } from "@/content/company";

export const metadata: Metadata = { title: "Imprint" };

export default function ImprintPage() {
  return (
    <LegalPage title="Imprint">
      <LegalSection title="Publisher of this website">
        <p className="m-0">
          {company.name}
          <br />
          {company.street}
          <br />
          {company.city}
          <br />
          {company.country}
        </p>
        <p className="m-0">
          Email: <a href={`mailto:${company.email}`}>{company.email}</a>
        </p>
      </LegalSection>

      <LegalSection title="Management">
        <p className="m-0">{company.management}</p>
      </LegalSection>

      <LegalSection title="Company registration number (CIPC)">
        <p className="m-0">{company.registrationNumber}</p>
      </LegalSection>

      <LegalSection title="Responsible for content">
        <p className="m-0">{company.management}</p>
      </LegalSection>

      <LegalSection title="External links">
        <p className="m-0 text-body">
          This website contains links to external websites. We have no influence on their design
          or content and accept no responsibility for them.
        </p>
      </LegalSection>

      <LegalSection title="Copyright">
        <p className="m-0 text-body">
          All content on this website, including texts, images and documents, is protected by
          copyright. It may not be copied or used for other purposes without our prior
          permission.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
