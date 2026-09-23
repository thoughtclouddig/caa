/**
 * Homepage content.
 *
 * Structure follows the approved brand and website overview: one hero
 * message and one call to action (no slider), then the three mission areas,
 * member benefits, CAA Every Day, a stories teaser, and a single closing
 * call to action.
 *
 * Copy discipline: nothing here claims a programme CAA does not currently
 * run. Where something is founding intent rather than present operation,
 * it says so.
 */

export type PhotoSlot = {
  /** What the photograph needs to show. Real CAA photography only. */
  brief: string;
  alt: string;
};

export type MissionArea = {
  name: string;
  heading: string;
  body: string;
  /** Set when the area is largely founding intent rather than current operation. */
  status?: string;
};

export const hero = {
  eyebrow: "The worldwide Catholic aviation community",
  heading: "Where Faith Takes Flight",
  lede: "Catholic Aviation Association brings together pilots, mechanics, controllers, cabin crew, students and everyone whose life runs through aviation, around a shared faith and a shared calling.",
  cta: { label: "Join CAA", href: "/participate/join" },
  secondary: { label: "Find a chapter", href: "/chapters" },
  photo: {
    brief:
      "Cinematic aviation photograph with room for type on the left. Aircraft must be real and believable.",
    alt: "",
  } satisfies PhotoSlot,
};

export const missionIntro = {
  eyebrow: "What CAA is for",
  heading: "Faith. Flying. Fellowship.",
  lede: "Those three words are not a tagline written for a website. They are how the association was organised when it was founded, and they still describe what it is here to do.",
};

export const missionAreas: MissionArea[] = [
  {
    name: "Faith",
    heading: "Proclaiming Christ in the world of aviation",
    body: "CAA exists to witness to the Good News of Jesus Christ among the people who work and fly in aviation. That means formation, prayer, the sacraments, and a Catholic life that holds up in an industry built on irregular hours and constant travel.",
  },
  {
    name: "Fellowship",
    heading: "Catholics who understand your world",
    body: "Local chapters, mentorship, and a community of people who share both the faith and the profession. Aviation can be isolating; this is the part of CAA that answers that directly.",
  },
  {
    name: "Flying",
    heading: "Opening aviation to the next generation",
    body: "From the beginning CAA's charter included affordable access to flying, youth mentoring, and support for people training toward an aviation career. It is the part of the founding vision with the furthest still to go.",
    status: "Founding intent — in development",
  },
];

export const benefits = {
  eyebrow: "What membership is for",
  heading: "What belonging to CAA actually gives you",
  lede: "Not a list of perks. The reasons people stay are closer to why they joined in the first place.",
  items: [
    {
      heading: "Growth in holiness",
      body: "Formation and prayer shaped for a life that does not follow a parish calendar.",
    },
    {
      heading: "Mutual support",
      body: "People who understand both the demands of the work and the practice of the faith, and who will pray for you by name.",
    },
    {
      heading: "Help in carrying your vocation",
      body: "Aviation treated as work worth sanctifying, not as a career that happens alongside your faith.",
    },
    {
      heading: "Confidence to help others",
      body: "Formation that leaves you able to answer honestly when someone in the crew room asks what you believe and why.",
    },
  ],
};

export const everyDay = {
  eyebrow: "CAA Every Day",
  heading: "A reason to come back tomorrow",
  lede: "The day's Scripture, the feasts worth knowing, and what is happening across the association — on CAA's own pages rather than sent somewhere else.",
  /**
   * Citations are shown rather than full reading text. The USCCB translation
   * is copyrighted, so reproducing the readings needs permission first.
   */
  readingNote:
    "Reading citations shown here. Displaying the full text requires permission from the copyright holder.",
  cta: { label: "See today's readings", href: "/resources/every-day" },
};

export const storiesTeaser = {
  eyebrow: "Stories",
  heading: "The people this is actually about",
  lede: "Members, chapters, and the ordinary working life of Catholics in aviation.",
  cta: { label: "Read the stories", href: "/stories" },
  photos: [
    {
      brief: "A real CAA chapter gathering. People, not an empty room.",
      alt: "",
    },
    {
      brief: "A member at work in aviation — ramp, hangar, flight deck or tower.",
      alt: "",
    },
    {
      brief: "Mass or prayer at an aviation gathering, where genuinely relevant.",
      alt: "",
    },
  ] satisfies PhotoSlot[],
};

export const closing = {
  heading: "Find the Catholics who share your work",
  lede: "Wherever you are in aviation, and wherever in the world you are based.",
  cta: { label: "Join CAA", href: "/participate/join" },
};
