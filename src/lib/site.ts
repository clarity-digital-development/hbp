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

/**
 * Who is asking, for per-visitor limits: the client IP as Vercel reports it
 * (it overwrites anything the client sends). An IPv6 user typically controls
 * a whole /64, so those count as one visitor. With no IP at all, everyone
 * shares one key, which fails closed rather than open.
 */
export function visitorKey(req: NextRequest): string {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "";
  if (!ip) return "unknown";
  if (!ip.includes(":")) return ip; // IPv4
  const v4 = /:(\d+\.\d+\.\d+\.\d+)$/.exec(ip); // IPv4-mapped, e.g. ::ffff:1.2.3.4
  if (v4) return v4[1];
  const [head, tail] = ip.toLowerCase().split("::");
  const h = head ? head.split(":") : [];
  const t = tail === undefined ? [] : tail ? tail.split(":") : [];
  const groups = tail === undefined ? h : [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill("0"), ...t];
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "") || "0").join(":")}::/64`;
}
