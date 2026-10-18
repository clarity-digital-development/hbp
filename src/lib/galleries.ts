export type Slide = { src: string; wide: boolean; alt: string };
export type Gallery = {
  slug: string;
  title: string;
  note: string;
  cover: string;
  /** Authored rather than templated — "Branding photography" reads fine but
      "Couples & portraits photography" does not. */
  description: string;
  slides: Slide[];
};

// Landscape frames span the full grid width; everything else is 2:3 and pairs
// up. Measured from the sources rather than assumed.
const LANDSCAPE = new Set([
  "taylor-03", "taylor-05", "wedding-04", "wedding-06", "wedding-11",
  "couples-02", "couples-10", "couples-19", "branding-02",
]);

// Alt text is per-gallery rather than per-file: these are portfolio frames, so
// the useful information is the kind of work, not a description of each photo.
const ALT: Record<string, string> = {
  couples: "Couples and portrait photography by Hailey Brooke",
  branding: "Brand photography by Hailey Brooke",
  taylor: "Wedding photography by Hailey Brooke",
  wedding: "Wedding photography by Hailey Brooke",
};

const slide = (name: string): Slide => ({
  src: `/images/portfolio/${name}.jpg`,
  wide: LANDSCAPE.has(name),
  alt: ALT[name.replace(/-\d+$/, "")] ?? "Photography by Hailey Brooke",
});

// Order is deliberate: the wide frames are spaced out so the grid breaks its
// two-up rhythm at intervals rather than clustering.
const COUPLES = [
  // Newest session work leads. Eight portrait frames — an even count — so
  // prepending them cannot shift the parity of the wide frames below.
  "couples-21","couples-22","couples-23","couples-24",
  "couples-25","couples-26","couples-27","couples-28",
  "couples-01","couples-03","couples-04","couples-05","couples-02",
  "couples-06","couples-07","couples-08","couples-09","couples-10",
  "couples-11","couples-12","couples-13","couples-14","couples-15",
  "couples-16","couples-17","couples-18","couples-19","couples-20",
];

const BRANDING = [
  // Newest work leads; four portrait frames, so parity is preserved.
  "branding-11","branding-12","branding-13","branding-14",
  "branding-01","branding-03","branding-04","branding-05","branding-02",
  "branding-06","branding-07","branding-08","branding-09","branding-10",
];

// Newest work leads: Hailey's chosen cover opens the gallery, then the
// golf-course wedding and a second couple's details, paired by subject. That's
// ten cells, an even count, so the wide frames below keep their parity. Then
// the Taylors, then Joshua & Courtni. taylor-14 is omitted — it is a second
// frame of the same moment as taylor-13. The cake topper (wedding-20) closes
// the gallery and completes the last row.
const WEDDINGS = [
  "wedding-11",
  "wedding-12","wedding-13","wedding-14","wedding-15",
  "wedding-16","wedding-18","wedding-17","wedding-19",
  "taylor-01","taylor-02","taylor-03","taylor-04","taylor-06","taylor-07",
  "taylor-08","taylor-05","taylor-09","taylor-10","taylor-11","taylor-12",
  "taylor-13","taylor-15","taylor-16","taylor-17","taylor-18",
  "wedding-01","wedding-02","wedding-03","wedding-04","wedding-05",
  "wedding-07","wedding-06","wedding-08","wedding-09","wedding-10",
  "wedding-20",
];

// A `col-span-2` tile can only begin in column one, and CSS grid's default
// (sparse) auto-placement will not backfill the cell it skips. So every wide
// frame must be preceded by an even number of grid cells. assertNoGaps guards
// that at module load rather than leaving it to be spotted in a screenshot.
function assertNoGaps(names: string[], label: string) {
  let cells = 0;
  for (const n of names) {
    const wide = LANDSCAPE.has(n);
    if (wide && cells % 2 !== 0) {
      throw new Error(
        `${label}: "${n}" is a wide frame preceded by ${cells} cells (odd), ` +
          `which leaves a blank half-cell. Move it one position.`
      );
    }
    cells += wide ? 2 : 1;
  }
}

assertNoGaps(COUPLES, "COUPLES");
assertNoGaps(BRANDING, "BRANDING");
assertNoGaps(WEDDINGS, "WEDDINGS");

export const galleries: Gallery[] = [
  {
    slug: "couples",
    title: "Couples & portraits",
    note: "Golden hour, gentle light, real laughter",
    description: "Couple, family and portrait sessions across Kentucky by Hailey Brooke.",
    cover: "/images/portfolio/couples-10.jpg",
    slides: COUPLES.map(slide),
  },
  {
    slug: "branding",
    title: "Branding",
    note: "For the people behind the business",
    description: "Brand and small-business photography across Kentucky by Hailey Brooke.",
    cover: "/images/portfolio/branding-02.jpg",
    slides: BRANDING.map(slide),
  },
  {
    slug: "weddings",
    title: "Weddings",
    note: "From first looks to last dances",
    description: "Kentucky wedding photography by Hailey Brooke, from first looks to last dances.",
    // Hailey's pick for the Weddings cover.
    cover: "/images/portfolio/wedding-11.jpg",
    slides: WEDDINGS.map(slide),
  },
];

export const galleryBySlug = (slug: string) =>
  galleries.find((g) => g.slug === slug);

/** The gallery that follows this one, for the "Next —" link. */
export const nextGallery = (slug: string) => {
  const i = galleries.findIndex((g) => g.slug === slug);
  return galleries[(i + 1) % galleries.length];
};
