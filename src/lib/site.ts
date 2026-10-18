import type { NextRequest } from "next/server";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://haileybrookephotography.com").replace(/\/$/, "");

/**
 * The base for Stripe's success and cancel URLs. The Origin header is only
 * used when it is the site itself: anyone can send any Origin, and echoing it
 * would let a crafted request send a paying client to a lookalike site.
 */
export function trustedOrigin(req: NextRequest): string {
  const origin = req.headers.get("origin");
  if (origin === SITE || origin === SITE.replace("://", "://www.")) return origin;
  if (origin && process.env.NODE_ENV !== "production" && /^http:\/\/localhost:\d+$/.test(origin)) return origin;
  return SITE;
}

/** The client's IP as Vercel reports it (it overwrites anything the client sends). */
export function clientIp(req: NextRequest): string | null {
  return req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || null;
}
