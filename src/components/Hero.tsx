import type { ReactNode } from "react";

export function Hero({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="flex shrink-0 flex-col gap-3.5 bg-mist px-4 pt-10 pb-9 sm:px-10 lg:px-20 lg:pt-14 lg:pb-12">
      <h1 className="m-0 text-[44px] leading-[1.1] font-extralight tracking-[0.02em] lg:text-[64px]">
        {title}
      </h1>
      {children && <p className="m-0 max-w-[720px] text-[17px] leading-relaxed">{children}</p>}
    </section>
  );
}
