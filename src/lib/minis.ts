/**
 * Christmas minis: one fixed date, fixed time slots, one client per slot.
 *
 * Shared by the page and the checkout route, so the price a client sees is the
 * price the server charges. No Node-only imports: the booking form uses this.
 *
 * Hailey and Tionna alternate half-hours on the day; these are Hailey's slots.
 */
export const CHRISTMAS_MINIS = {
  sessionType: "Christmas Mini",
  packageName: "Christmas Minis",
  date: "2026-11-21",
  location: "Lexington, Kentucky",
  minutes: 15,
  photos: 10,
  times: ["12:30 PM", "1:30 PM", "2:30 PM", "3:30 PM", "4:30 PM", "5:30 PM"],
  price: 95,
  deposit: 45,
  addOns: [
    { id: "rush", label: "Rush delivery", price: 25, detail: "Your images delivered within 48 hours." },
    { id: "sneak", label: "Sneak peeks", price: 15, detail: "1–2 photos sent the next day." },
    {
      id: "cards",
      label: "Physical holiday cards",
      price: 55,
      detail:
        "Dropped off to you within a week of the shoot if you're in Lexington; pick-up if you live outside Lexington.",
    },
  ],
} as const;

export type MiniAddOnId = (typeof CHRISTMAS_MINIS.addOns)[number]["id"];

export function isMiniTime(time: string): boolean {
  return (CHRISTMAS_MINIS.times as readonly string[]).includes(time);
}

/** Keeps known ids only, once each, in the listed order. */
export function cleanAddOns(ids: unknown): MiniAddOnId[] {
  const wanted = new Set(Array.isArray(ids) ? ids : []);
  return CHRISTMAS_MINIS.addOns.filter((a) => wanted.has(a.id)).map((a) => a.id);
}

/**
 * Add-ons are always paid at booking. Paying in full covers everything now;
 * a deposit leaves the rest of the session price for after the shoot.
 */
export function miniTotals(payInFull: boolean, addOnIds: readonly string[]) {
  const addOnsTotal = CHRISTMAS_MINIS.addOns
    .filter((a) => addOnIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const total = CHRISTMAS_MINIS.price + addOnsTotal;
  const dueNow = (payInFull ? CHRISTMAS_MINIS.price : CHRISTMAS_MINIS.deposit) + addOnsTotal;
  return { addOnsTotal, total, dueNow, balance: total - dueNow };
}

export function addOnsSummary(addOnIds: readonly string[]): string {
  return CHRISTMAS_MINIS.addOns
    .filter((a) => addOnIds.includes(a.id))
    .map((a) => a.label)
    .join(", ");
}

/** "12:30 PM" → minutes after midnight. */
function minutesOf(time: string): number {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time);
  if (!m) return 0;
  const h = (Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0);
  return h * 60 + Number(m[2]);
}

/** Kentucky's current date (yyyy-mm-dd) and minutes after midnight. */
function kentuckyNow(now: Date): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

/** A slot can't be booked once its start time has passed in Kentucky. */
export function miniSlotIsPast(time: string, now: Date): boolean {
  const k = kentuckyNow(now);
  if (k.date !== CHRISTMAS_MINIS.date) return k.date > CHRISTMAS_MINIS.date;
  return k.minutes >= minutesOf(time);
}
