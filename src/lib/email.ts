import "server-only";
import { Resend } from "resend";
import { LeadNotification, type LeadNotificationProps } from "@/emails/LeadNotification";
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

export async function sendLeadNotification(
  to: string[],
  props: LeadNotificationProps,
  idempotencyKey: string,
) {
  resend ??= new Resend(env().RESEND_API_KEY);
  const label = props.returning ? "Returning registration" : "New registration";
  const { error } = await resend.emails.send(
    {
      from: env().EMAIL_FROM,
      to,
      replyTo: props.email,
      subject: `${label}: ${props.firstName} ${props.lastName}, ${props.company}`,
      react: LeadNotification(props),
    },
    { idempotencyKey },
  );
  if (error) throw new Error(`Resend: ${error.message}`);
}
