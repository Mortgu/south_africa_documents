import type { Metadata } from "next";
import { Hero } from "@/components/Hero";

export const metadata: Metadata = { title: "Privacy Policy | dignum" };

export default function PrivacyPolicyPage() {
  return (
    <>
      <Hero title="Privacy Policy" />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 text-[17px] leading-relaxed sm:px-10">
        {/* TODO (step 6): add the legal text */}
        <p className="text-body">[CONTENT FOLLOWS]</p>
      </main>
    </>
  );
}
