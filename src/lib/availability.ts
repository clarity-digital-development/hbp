// Booking availability rules.
//
// For the next 2 months, availability is limited to specific evening windows:
//   - Thursday  5:00 PM – 9:00 PM
//   - Saturday  6:00 PM – 9:00 PM
//   - Sunday    3:00 PM – 9:00 PM
// Beyond 2 months out, availability is completely open.

const DAY = { SUN: 0, THU: 4, SAT: 6 } as const;

// Bookable start times within each limited evening window (last start leaves
// time before the 9:00 PM close).
const LIMITED_WINDOWS: Record<number, string[]> = {
  [DAY.THU]: ["5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"],
  [DAY.SAT]: ["6:00 PM", "7:00 PM", "8:00 PM"],
  [DAY.SUN]: ["3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"],
};

// Open availability (dates beyond the 2-month limited window).
const OPEN_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
];

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** The last day still governed by the limited window (2 months from today). */
export function limitedWindowEnd(): Date {
  const d = startOfToday();
  d.setMonth(d.getMonth() + 2);
  return d;
}

function atMidnight(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Available start times for a given date ([] if the date is not bookable). */
export function getSlotsForDate(date: Date): string[] {
  const day = atMidnight(date);
  if (day < startOfToday()) return [];
  if (day <= limitedWindowEnd()) {
    return LIMITED_WINDOWS[day.getDay()] ?? [];
  }
  return OPEN_SLOTS;
}

export function isDateAvailable(date: Date): boolean {
  return getSlotsForDate(date).length > 0;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
