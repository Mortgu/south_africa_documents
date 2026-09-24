export function Hero({ title }: { title: string }) {
  return (
    <section className="shrink-0 bg-mist px-4 py-12 text-center sm:px-10 lg:px-20 lg:pt-[72px] lg:pb-16">
      <h1 className="m-0 text-5xl leading-[1.1] font-extralight tracking-[0.02em] lg:text-[70px]">
        {title}
      </h1>
    </section>
  );
}
