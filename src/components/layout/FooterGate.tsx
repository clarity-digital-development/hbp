"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

// Locked, single-screen routes. Rendering the footer beneath them would
// reintroduce the scroll they are meant to remove.
const LOCKED_ROUTES = new Set(["/"]);

export function FooterGate() {
  const pathname = usePathname();
  if (LOCKED_ROUTES.has(pathname)) return null;
  return <Footer />;
}
