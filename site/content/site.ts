/**
 * Site-wide content and navigation.
 *
 * This file is the seam where Sanity plugs in later. Components read from
 * typed objects, never from hardcoded strings, so replacing these exports
 * with a CMS query is a swap rather than a rewrite.
 */

export type NavItem = {
  label: string;
  href: string;
};

export const org = {
  name: "Catholic Aviation Association",
  shortName: "CAA",
  /** CAA's own tagline, as it appears on catholicaviation.org. */
  heritageLine: "Faith, Flying and Fellowship",
  brandPromise: "Faith, Flying and Fellowship",
  descriptor: "The worldwide Catholic aviation community",
  /** CAA copy — mission statement as published on the existing site. */
  mission:
    "To connect Catholics interested or involved in any aspect of aviation, to facilitate networking and support one another as we journey through these challenging times.",
  /** CAA copy — vision statement as published on the existing site. */
  vision:
    "To be a witness for Jesus Christ and the Christian values that are the necessary foundation for a strong and fruitful society.",
  email: "CAA@CatholicAviation.org",
  /** Required on every page. CAA is an Indiana nonprofit corporation. */
  taxLine:
    "Catholic Aviation Association is a not-for-profit tax exempt organization organized under 501(c)(3) of the Internal Revenue Code. Contributions made to Catholic Aviation Association are tax deductible for federal income tax purposes.",
} as const;

/**
 * Top-level navigation, per the approved site map.
 * Deeper pages (Join, Donate, Starting a Chapter, the store) live under
 * Participate rather than competing for room in the header.
 */
export const primaryNav: NavItem[] = [
  { label: "Join", href: "/participate/join" },
  { label: "Participate", href: "/participate" },
  { label: "Resources", href: "/resources" },
  { label: "Chapters", href: "/chapters" },
  { label: "Articles", href: "/articles" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
];

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Participate",
    items: [
      { label: "Join, Renew or Register", href: "/participate/join" },
      { label: "Donate to CAA", href: "/participate/donate" },
      { label: "Starting a Chapter", href: "/participate/start-a-chapter" },
      { label: "CAA Product Catalog", href: "/participate/store" },
    ],
  },
  {
    heading: "Explore",
    items: [
      { label: "Resources", href: "/resources" },
      { label: "Chapters", href: "/chapters" },
      { label: "Articles", href: "/articles" },
      { label: "Events", href: "/events" },
      { label: "Newsletter", href: "/newsletter" },
      { label: "Photo Gallery", href: "/gallery" },
    ],
  },
  {
    heading: "About",
    items: [
      { label: "About CAA", href: "/about" },
      { label: "Where We Stand", href: "/about#where-we-stand" },
      { label: "Letter from the Chairman", href: "/about/letter-from-the-chairman" },
      { label: "Our Patron Saints", href: "/about/patron-saints" },
      { label: "Corporate Partners", href: "/sponsors" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const memberArea: NavItem = { label: "Member Login", href: "/login" };

/**
 * Primary call to action.
 *
 * Deliberately neutral. Membership pricing is still an open decision
 * (see "What We Need From You" in the brand and website overview), so the
 * homepage does not commit to "join free" or to a price.
 */
export const primaryCta: NavItem = {
  label: "Begin Your Journey Here",
  href: "/participate/join",
};
