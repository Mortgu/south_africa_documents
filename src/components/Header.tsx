import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-20 shrink-0 items-center border-b border-line bg-white px-4 sm:px-10 lg:h-[100px] lg:px-20">
      <Link href="/" aria-label="dignum – Downloads" className="block">
        <Image src="/logo.svg" alt="dignum" width={642} height={115} priority className="h-7 w-auto lg:h-9" />
      </Link>
    </header>
  );
}
