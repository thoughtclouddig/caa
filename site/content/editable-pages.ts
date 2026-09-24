/**
 * The blocks of copy staff can edit on otherwise fixed pages.
 *
 * Registered here rather than discovered from the database, so the admin
 * can say where each block appears and so nobody can create an orphan row
 * that renders nowhere. Adding a block is two steps: add it here, and read
 * it in the page with getPage().
 */
export type EditablePage = {
  slug: string;
  title: string;
  /** Where it shows on the public site, in plain words. */
  where: string;
  /** What belongs in it, for whoever is editing. */
  guidance: string;
};

export const EDITABLE_PAGES: EditablePage[] = [
  {
    slug: "letter-from-the-chairman",
    title: "Letter from the Chairman",
    where: "Its own page under About, linked from the About page.",
    guidance:
      "Tom Beckenbauer's letter to members. Carried over word for word from the existing site; change it only if he does.",
  },
  {
    slug: "come-follow-me",
    title: "Come Follow Me",
    where: "Its own page under Participate.",
    guidance:
      "The invitation: what it feels like to respond to grace, and what CAA gathers into one place.",
  },
  {
    slug: "catholic-foundations",
    title: "Catholic Foundations",
    where: "Resources. Renamed from “Knowledge” on the old site.",
    guidance:
      "The Mass, the Sacraments and how to pray more deliberately. What a Catholic in aviation needs to hand.",
  },
  {
    slug: "apologetics",
    title: "Ask the Apologist",
    where: "Resources.",
    guidance:
      "Answering the questions members actually get asked in a crew room. Say how a member sends a question in.",
  },
  {
    slug: "become-a-catholic",
    title: "Become a Catholic",
    where: "Resources.",
    guidance:
      "For someone reading who is not Catholic, or who has been away. What the first step is and who to speak to.",
  },
  {
    slug: "airport-chapels",
    title: "Airport Chapels Directory",
    where: "Resources.",
    guidance:
      "CAA's own directory. Members send in the airport and where in the terminal the chapel is.",
  },
  {
    slug: "prayer-page",
    title: "CAA Prayer Page",
    where: "Resources.",
    guidance:
      "Prayers for those who fly and those who keep them flying, including Our Lady of Loreto and St. Joseph of Cupertino.",
  },
  {
    slug: "caa-youth",
    title: "CAA Youth",
    where: "Resources.",
    guidance:
      "What the association offers young people: internships, tours, guest speakers, the Cupertino flying clubs.",
  },
  {
    slug: "caa-media",
    title: "CAA Media",
    where: "Resources.",
    guidance: "Talks, recordings and anything CAA has published or appeared in.",
  },
  {
    slug: "benefits-access",
    title: "Member Benefits",
    where: "Participate. Members only on the old site.",
    guidance:
      "What membership carries, including the corporate partner discounts.",
  },
  {
    slug: "chapter-meeting-content",
    title: "Chapter Meeting Content",
    where: "Participate. Material chapters use when they meet.",
    guidance:
      "Formation material, discussion outlines and anything a chapter leader needs to run a meeting.",
  },
  {
    slug: "about",
    title: "About CAA",
    where: "The About page, under the heading “Who We Are”.",
    guidance:
      "Who the association is and where it came from. The vision and mission above it, and the Where We Stand section below it, are fixed and are not edited here.",
  },
  {
    slug: "contact",
    title: "Contact",
    where: "The Contact page, above the form.",
    guidance:
      "How to reach CAA, and what to expect after getting in touch.",
  },
];

export function findEditablePage(slug: string): EditablePage | undefined {
  return EDITABLE_PAGES.find((p) => p.slug === slug);
}
