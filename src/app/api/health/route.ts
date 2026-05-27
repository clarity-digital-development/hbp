import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lightweight health check for Railway's deploy health probe.
export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}
