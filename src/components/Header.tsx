import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-20 shrink-0 items-center border-b border-line bg-white px-4 sm:px-10 lg:h-[100px] lg:px-20">
      {/* TODO: replace placeholder with the real logo */}
      <Link
        href="/"
        aria-label="Home"
        className="flex h-12 w-[170px] items-center justify-center border border-dashed border-[#9b9b9b] text-[13px] tracking-[0.1em] text-muted uppercase"
      >
        Logo
      </Link>
    </header>
  );
}
