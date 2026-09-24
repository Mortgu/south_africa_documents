import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { env } from "@/lib/env";

const COOKIE_NAME = "dl_session";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export type Session = { subscriberId: string; email: string };

const secret = () => new TextEncoder().encode(env().SESSION_SECRET);

/** Sets the signed session cookie on a response. */
export async function setSessionCookie(response: NextResponse, session: Session) {
  const jwt = await new SignJWT({ email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.subscriberId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  response.cookies.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Reads and verifies the session cookie of the current request. */
export async function getSession(): Promise<Session | null> {
  const jwt = (await cookies()).get(COOKIE_NAME)?.value;
  if (!jwt) return null;
  try {
    const { payload } = await jwtVerify(jwt, secret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    return { subscriberId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
