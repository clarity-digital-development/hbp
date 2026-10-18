import { randomBytes } from "crypto";

// Server-side only (Node crypto): imported by API routes, never by a client
// component. Kept apart from payments.ts, which the browser bundle shares.

/** Unguessable token for a private payment link — 192 bits, URL-safe. */
export function newPaymentToken(): string {
  return randomBytes(24).toString("base64url");
}
