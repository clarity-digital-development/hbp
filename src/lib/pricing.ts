// Single source of truth for session pricing.
// Imported by both the booking UI and the server-side checkout route so the
// deposit is always recomputed server-side (never trust a client-sent amount).

export const DEPOSIT_RATE = 0.3;

export const packages = [
  { name: "Essential", price: 90, detail: "30 min · 15+ images" },
  { name: "Signature", price: 150, detail: "60 min · 30+ images" },
  { name: "Luxe", price: 240, detail: "90 min · 50+ images" },
] as const;

export const addOns = [
  { id: "4x6", label: "4×6 Print", price: 2 },
  { id: "5x7", label: "5×7 Print", price: 5 },
  { id: "8x10", label: "8×10 Print", price: 8 },
  { id: "11x14", label: "11×14 Print", price: 15 },
  { id: "polaroid", label: "Polaroid", price: 8 },
] as const;

export type Quantities = Record<string, number>;

export function computeTotals(packageName: string, quantities: Quantities) {
  const pkg = packages.find((p) => p.name === packageName);
  const packagePrice = pkg?.price ?? 0;
  const printsTotal = addOns.reduce(
    (sum, a) => sum + a.price * (quantities[a.id] || 0),
    0
  );
  const total = packagePrice + printsTotal;
  const deposit = Math.round(total * DEPOSIT_RATE);
  return { packagePrice, printsTotal, total, deposit, balance: total - deposit };
}

export function printsSummary(quantities: Quantities): string {
  return addOns
    .filter((a) => (quantities[a.id] || 0) > 0)
    .map((a) => `${quantities[a.id]}× ${a.label}`)
    .join(", ");
}
