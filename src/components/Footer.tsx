import Link from "next/link";

const footerLink = "text-white/70 hover:text-white";

export function Footer() {
  return (
    <footer className="shrink-0 bg-night text-[15px] text-white/70">
      <div className="grid grid-cols-1 gap-10 px-4 pt-14 pb-10 sm:grid-cols-3 sm:gap-[30px] sm:px-10 lg:px-20 lg:pt-[72px] lg:pb-14">
        <div className="flex flex-col gap-4">
          <div className="flex h-[42px] w-[150px] items-center justify-center border border-dashed border-white/40 text-xs tracking-[0.1em] uppercase">
            Logo
          </div>
          <p className="leading-relaxed">Systems – Software – Services</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="eyebrow text-accent-bright">Contact</div>
          <span>[STREET NO.]</span>
          <span>[POSTCODE CITY]</span>
          <a className={footerLink} href="mailto:[EMAIL]">
            [EMAIL ADDRESS]
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
        </div>
      </div>
      <div className="border-t border-white/12 px-4 py-6 text-[13px] text-white/60 sm:px-10 lg:px-20">
        © {new Date().getFullYear()} dignum GmbH
      </div>
    </footer>
  );
}
