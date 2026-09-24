import type { Subscriber } from "@/lib/session";
import { CheckIcon } from "@/components/icons";

export function SignedInBanner({ subscriber }: { subscriber: Subscriber }) {
  const name = [subscriber.firstName, subscriber.lastName].filter(Boolean).join(" ") || subscriber.email;
  const who = subscriber.company ? `${name}, ${subscriber.company}` : name;

  return (
    <div role="status" className="flex items-center gap-4 bg-ink px-5 py-5 text-white sm:px-6">
      <CheckIcon size={24} className="shrink-0 text-sky" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-semibold">Signed in as {who}</span>
        <span className="text-sm text-white/75">The protected documents are unlocked.</span>
      </div>
    </div>
  );
}
