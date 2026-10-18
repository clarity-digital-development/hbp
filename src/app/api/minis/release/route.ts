import { NextRequest, NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { findHold, releaseHold } from "@/lib/mini-slots";

export const runtime = "nodejs";

/** Frees a slot when its client backs out of Checkout (the cancel URL). */
export async function POST(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ ok: true });

  let hold = "";
  try {
    ({ hold } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const row = hold ? await findHold(String(hold)) : null;
  if (!row) return NextResponse.json({ ok: true }); // already released or expired

  try {
    // "paid" keeps the slot theirs, which is the right outcome too.
    if ((await releaseHold(row)) !== "kept") return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Could not expire the mini checkout session:", err);
  }
  // Can't confirm the session is dead, so the hold stays and lapses on its own.
  return NextResponse.json({ ok: false }, { status: 502 });
}
