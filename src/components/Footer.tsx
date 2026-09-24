import Image from "next/image";
import Link from "next/link";
import { company } from "@/content/company";

const footerLink = "text-white/70 hover:text-white";

export function Footer() {
  return (
    <footer className="shrink-0 bg-night text-[15px] text-white/70">
      <div className="grid grid-cols-1 gap-10 px-4 pt-14 pb-10 sm:grid-cols-3 sm:gap-[30px] sm:px-10 lg:px-20 lg:pt-[72px] lg:pb-14">
        <div className="flex flex-col gap-4">
          <Image
            src="/logo.svg"
            alt="dignum"
            width={642}
            height={115}
            className="h-7 w-auto self-start brightness-0 invert"
          />
          <p className="leading-relaxed">Systems – Software – Services</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="eyebrow text-accent-bright">Contact</div>
          <span>{company.name}</span>
          <span>{company.street}</span>
          <span>{company.city}</span>
          <a className={footerLink} href={`mailto:${company.email}`}>
            {company.email}
          </a>
        </div>
        <div className="flex flex-col gap-3">
          <div className="eyebrow text-accent-bright">Legal</div>
          <Link className={footerLink} href="/imprint">
            Imprint
          </Link>
          <Link className={footerLink} href="/privacy">
            Privacy Policy
          </Link>
          <a className={footerLink} href={company.website}>
            dignum.co.za
          </a>
        </div>
      </div>
      <div className="border-t border-white/12 px-4 py-6 text-[13px] text-white/60 sm:px-10 lg:px-20">
        © {new Date().getFullYear()} {company.name}
      </div>
    </footer>
  );
}
