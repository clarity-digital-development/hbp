import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "hbp_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  // Prefer a dedicated session secret; fall back to the admin password.
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

/** Token proving a successful admin login (HMAC over a fixed payload). */
export function makeToken(): string {
  return createHmac("sha256", secret()).update("admin-authenticated").digest("hex");
}

export function isValidToken(token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const expected = makeToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Server-side check for protected pages/routes. */
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return isValidToken(store.get(ADMIN_COOKIE)?.value);
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}
