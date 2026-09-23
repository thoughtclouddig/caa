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
  heritageLine: "Faith. Flying. Fellowship.",
  brandPromise: "Where Faith Takes Flight",
  descriptor: "The worldwide Catholic aviation community",
  /** From CAA's founding documents (2012). */
  mission:
    "Witnessing to the Good News of Jesus Christ in the world of aviation.",
} as const;

/**
 * Top-level navigation, per the approved site map.
 * Deeper pages (Join, Donate, Starting a Chapter, the store) live under
 * Participate rather than competing for room in the header.
 */
export const primaryNav: NavItem[] = [
  { label: "Participate", href: "/participate" },
  { label: "Resources", href: "/resources" },
  { label: "Chapters", href: "/chapters" },
  { label: "Stories", href: "/stories" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
];

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Participate",
    items: [
      { label: "Join or Renew", href: "/participate/join" },
      { label: "Donate", href: "/participate/donate" },
      { label: "Start a Chapter", href: "/participate/start-a-chapter" },
      { label: "CAA Store", href: "/participate/store" },
    ],
  },
  {
    heading: "Explore",
    items: [
      { label: "Resources", href: "/resources" },
      { label: "Chapters", href: "/chapters" },
      { label: "Stories", href: "/stories" },
      { label: "Events", href: "/events" },
    ],
  },
  {
    heading: "About",
    items: [
      { label: "About CAA", href: "/about" },
      { label: "Our Patron Saints", href: "/about/patron-saints" },
      { label: "Sponsors & Partners", href: "/sponsors" },
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
export const primaryCta: NavItem = { label: "Join CAA", href: "/participate/join" };
