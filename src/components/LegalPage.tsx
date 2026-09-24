import type { ReactNode } from "react";
import { Hero } from "@/components/Hero";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Hero title={title} />
      <main className="flex w-full max-w-[880px] flex-col gap-10 px-4 py-12 sm:px-10 lg:px-20 lg:py-[72px]">
        {children}
      </main>
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 text-[17px] leading-relaxed">
      <h2 className="m-0 text-[26px] leading-[1.3] font-light tracking-[0.024em]">{title}</h2>
      {children}
    </section>
  );
}
