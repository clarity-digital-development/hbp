"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

/**
 * The homepage is a locked, single-screen hero — rendering the footer beneath it
 * would reintroduce the scroll it is meant to remove. Every other route keeps
 * the footer as normal.
 */
export function FooterGate() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <Footer />;
}
