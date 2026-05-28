import "server-only";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "hbp_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const COOKIE_MAX_AGE = Math.floor(SESSION_TTL_MS / 1000);

function secret(): string {
  // Prefer a dedicated session secret; fall back to the admin password.
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/**
 * Stateless, time-bounded session token: "<sessionId>.<expiresAtMs>.<hmac>".
 * The random sessionId makes each login unique; the embedded expiry caps how
 * long a leaked cookie stays valid; the HMAC over the combined payload prevents
 * tampering. (Single-owner admin — full server-side revocation isn't stored;
 * "sign out" clears the cookie and tokens expire within the TTL.)
 */
export function makeToken(): string {
  const sessionId = randomBytes(16).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${sessionId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidToken(token: string | undefined): boolean {
  if (!token || !secret()) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [sessionId, expiresAtStr, providedSig] = parts;

  const expectedSig = sign(`${sessionId}.${expiresAtStr}`);
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
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
