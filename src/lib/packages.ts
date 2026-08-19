export type Tier = {
  name: string;
  price: string;
  /** Render "starting at" above the price — used where add-ons commonly apply. */
  from?: boolean;
  description: string;
  image?: string;
  alt?: string;
};

/**
 * Prices follow the packages document, which supersedes the earlier styling
 * mock-up (that draft was ~20% lower across the wedding tiers).
 */
export const weddingTiers: Tier[] = [
  {
    name: "Micro / Elopements",
    price: "$499",
    from: true,
    description:
      "Built for intimate ceremonies and elopements. Includes up to 3 hours of coverage, a private online gallery, and sneak peek photos delivered within 24 hours.",
  },
  {
    name: "Half Day",
    price: "$1,249",
    from: true,
    description:
      "Includes up to 6 hours of coverage, a private online gallery, and sneak peek photos delivered within 48 hours. Also includes content creation for social media and a second shooter.",
  },
  {
    name: "Full Day Coverage",
    price: "$2,249",
    from: true,
    description:
      "Includes 8–10 hours of coverage, a private online gallery, and sneak peek photos delivered within 48 hours. Also includes content creation for social media, a second shooter, a physical photo album, and Polaroids taken the day of.",
  },
];

export const sessionTiers: Tier[] = [
  {
    name: "Mini session",
    price: "$100",
    description:
      "This session runs up to 30 minutes at a location of your choosing, and you'll get all of the best photos back from the shoot. If the session is held in-studio, studio fees will be added to the final invoice.",
    image: "/images/session-mini.jpg",
    alt: "Portrait session in a tree at golden hour",
  },
  {
    name: "Full session",
    price: "$175",
    description:
      "This session runs up to 1 hour at a location of your choosing, and includes one outfit change. You'll get all of the best photos back from the shoot. If the session is held in-studio, studio fees will be added to the final invoice.",
    image: "/images/session-full.jpg",
    alt: "Couples session lying in the grass",
  },
];

export const addOnNote =
  "Add ons such as Polaroids, film, and travel fees are added to the final invoice.";
