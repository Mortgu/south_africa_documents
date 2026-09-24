import "server-only";
import { Resend } from "resend";
import { VerifyEmail } from "@/emails/VerifyEmail";
import { env } from "@/lib/env";

let resend: Resend | undefined;

export async function sendVerificationEmail(to: string, firstName: string, verifyUrl: string) {
  resend ??= new Resend(env().RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env().EMAIL_FROM,
    to,
    subject: "Confirm your email address",
    react: VerifyEmail({ firstName, verifyUrl }),
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
