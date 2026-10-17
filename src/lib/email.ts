import "server-only";
import { render } from "@react-email/render";
import nodemailer, { type Transporter } from "nodemailer";
import type { ReactElement } from "react";
import { LeadNotification, type LeadNotificationProps } from "@/emails/LeadNotification";
import { VerifyEmail } from "@/emails/VerifyEmail";
import { env } from "@/lib/env";

let transporter: Transporter | undefined;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = env();
  // Port 465 speaks TLS from the start; any other port must upgrade via STARTTLS, so
  // credentials are never sent in plain text. Local mail catchers (Mailpit) offer no TLS.
  const local = ["localhost", "127.0.0.1", "::1"].includes(SMTP_HOST);
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    requireTLS: SMTP_PORT !== 465 && !local,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    // Fail fast (e.g. a port blocked by the hoster) instead of hanging the registration request.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

type Message = { to: string | string[]; subject: string; replyTo?: string; email: ReactElement };

async function send({ email, ...message }: Message) {
  const [html, text] = await Promise.all([render(email), render(email, { plainText: true })]);
  try {
    await getTransporter().sendMail({ from: env().EMAIL_FROM, ...message, html, text });
  } catch (error) {
    throw new Error(`SMTP: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}

export async function sendVerificationEmail(to: string, firstName: string, verifyUrl: string) {
  await send({
    to,
    subject: "Confirm your email address",
    email: VerifyEmail({ firstName, verifyUrl }),
  });
}

export async function sendLeadNotification(to: string[], props: LeadNotificationProps) {
  const label = props.returning ? "Returning registration" : "New registration";
  await send({
    to,
    replyTo: props.email,
    subject: `${label}: ${props.firstName} ${props.lastName}, ${props.company}`,
    email: LeadNotification(props),
  });
}
