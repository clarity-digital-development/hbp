export type Tier = {
  name: string;
  price: string;
  /** Render "starting at" above the price — used where add-ons commonly apply. */
  from?: boolean;
  description: string;
  /** Small label beside the price, e.g. "Best value" on the top collection. */
  badge?: string;
  /** Italic line under the description, e.g. what the collection saves. */
  note?: string;
  image?: string;
  alt?: string;
};

export type AddOn = {
  name: string;
  price: string;
  detail?: string;
  /** Longer explanation behind "Learn more", for extras couples rarely know. */
  more?: string;
};

/**
 * Four fixed-price collections (October 2026 pricing research). The second
 * photographer and the album separate the tiers, so Signature carries a
 * 4-hour second photographer and Heirloom the full-day one, the album, the
 * engagement session and the Polaroids. Heirloom's note is the add-on prices
 * below summed: 2 hours $450 + 4 second-photographer hours $400 + engagement
 * $250 + album $450 + Polaroids ~$160 + social $250 + priority $250 = $2,210,
 * against a $755 step up from Signature.
 */
export const weddingTiers: Tier[] = [
  {
    name: "Elopement",
    price: "$795",
    description:
      "Built for intimate ceremonies and elopements. Up to 3 hours of coverage, help planning your location, a private online gallery with full-resolution downloads and a print release, and sneak peek photos within 24 hours.",
  },
  {
    name: "Essentials",
    price: "$1,495",
    description:
      "Six hours of coverage for the heart of your day, from getting ready through the first part of the reception. Includes timeline planning, a private online gallery with full-resolution downloads and a print release, and sneak peek photos within 48 hours.",
  },
  {
    name: "Signature",
    price: "$2,195",
    description:
      "Eight hours of coverage, plus a second photographer for up to 4 hours to catch the ceremony and family photos from a second angle. Includes everything in Essentials.",
  },
  {
    name: "Heirloom",
    price: "$2,950",
    badge: "Best value",
    description:
      "Up to 10 hours of coverage with a second photographer for up to 8 hours. Includes an engagement session, a 10x10 heirloom album, Polaroids taken throughout the day, content for social media, sneak peeks within 24 hours, and priority delivery of your full gallery within 4 weeks.",
    note: "Booked separately, everything Heirloom adds to Signature would come to $2,210. Here it's $755.",
  },
];

/** Published so couples see every cost before they inquire. */
export const weddingAddOns: AddOn[] = [
  { name: "Extra hour of coverage", price: "$225 / hour" },
  {
    name: "Second photographer",
    price: "$100 / hour",
    detail: "Included in Signature (4 hours) and Heirloom (8 hours)",
    more: "A second photographer lets two moments happen at once: one of us with each of you while you get ready, or one on family photos while the other catches your guests. During the ceremony you get both angles, the walk down the aisle and the face waiting at the end of it. It's the easiest way to make sure nothing important happens out of frame.",
  },
  {
    name: "Engagement session",
    price: "$250",
    detail: "One hour, within 50 miles of Lexington. Included in Heirloom",
  },
  { name: "10x10 heirloom album", price: "$450", detail: "Included in Heirloom" },
  {
    name: "Parent album",
    price: "$250",
    detail: "A smaller copy of your album",
    more: "The same photos and layout as your album, in a smaller size, made for your parents or grandparents. It's the gift they'll actually keep out on the coffee table, and because your album's design is already done, it costs far less than starting a new one later.",
  },
  {
    name: "Social-media content",
    price: "$250",
    detail: "Included in Heirloom",
    more: "Quick vertical photos and short behind-the-scenes clips captured through the day and sent soon after, so you can share it while everyone is still talking about it. Sneak peeks show the finished photos; this is the moments in between.",
  },
  {
    name: "Priority gallery delivery",
    price: "$250",
    detail: "Your full gallery within 4 weeks. Included in Heirloom",
  },
  {
    name: "Rehearsal or day-after session",
    price: "$225 / hour",
    detail: "Two-hour minimum",
    more: "Rehearsal coverage catches the toasts, the out-of-town family and the calmer night before, when everyone actually has time to talk. A day-after session puts you back in your wedding clothes somewhere that didn't fit the timeline, like a field at golden hour or downtown at night, with no schedule to keep.",
  },
  {
    name: "Film photography",
    price: "Quoted",
    detail: "Priced per wedding",
    more: "Rolls of film shot alongside digital through the day, developed and scanned to sit with your gallery. Film gives softer tones and real grain that a filter can't quite copy. It's quoted per wedding because film, developing and scanning depend on how much you'd like shot.",
  },
];

export const weddingTravelNote =
  "Travel within 50 miles of Lexington is included. Beyond that, mileage is added, plus lodging for weddings more than about three hours away.";

export const sessionTiers: Tier[] = [
  {
    name: "Mini session",
    price: "$125",
    description:
      "This session runs up to 30 minutes at a location of your choosing, and you'll get all of the best photos back from the shoot. If the session is held in-studio, studio fees will be added to the final invoice.",
    image: "/images/session-mini.jpg",
    alt: "Portrait session in a tree at golden hour",
  },
  {
    name: "Full session",
    price: "$200",
    description:
      "This session runs up to 1 hour at a location of your choosing, and includes one outfit change. You'll get all of the best photos back from the shoot. If the session is held in-studio, studio fees will be added to the final invoice.",
    image: "/images/session-full.jpg",
    alt: "Couples session lying in the grass",
  },
];

export const addOnNote =
  "Add ons such as Polaroids, film, and travel fees are added to the final invoice.";
