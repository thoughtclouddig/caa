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
