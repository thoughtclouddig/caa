/**
 * Homepage content.
 *
 * Structure follows the approved brand and website overview: one hero
 * message and one call to action (no slider), then the three mission areas,
 * member benefits, CAA Every Day, a stories teaser, and a single closing
 * call to action.
 *
 * Copy source: wherever CAA has already said a thing in its own words on
 * catholicaviation.org, that wording is used here rather than something
 * newly written. Lines drawn from the existing site are marked "CAA copy".
 * Nothing here claims a programme CAA does not currently run; where
 * something is founding intent rather than present operation, it says so.
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
  heading: "Faith, Flying and Fellowship",
  /** CAA copy — homepage, condensed. */
  lede: "Wherever you are in your aviation journey, be part of a community where faith matters first, where you are never flying alone, and where you are soaring with something larger than all of us.",
  cta: { label: "Begin Your Journey Here", href: "/participate/join" },
  secondary: { label: "Find a Chapter", href: "/chapters" },
  photo: {
    brief:
      "Cinematic aviation photograph with room for type on the left. Aircraft must be real and believable.",
    alt: "",
  } satisfies PhotoSlot,
};

export const missionIntro = {
  eyebrow: "Our Vision and Mission",
  heading: "The Meeting Place for Catholics in Aviation",
  /** CAA copy — mission statement, "Come Follow Me". */
  lede: "Our vision is to be a witness for Jesus Christ and the Christian values that are the necessary foundation for a strong and fruitful society. Our mission is to connect Catholics interested or involved in any aspect of aviation, to facilitate networking and support one another as we journey through these challenging times.",
};

export const missionAreas: MissionArea[] = [
  {
    name: "Faith",
    heading: "Bringing the Good News to the World of Aviation",
    /** Drawn from the Chairman's letter. */
    body: "CAA was founded to unite the People of God involved in every aspect of aviation, so that we may support each other and help rebuild the moral foundation of our nation. Prayer, the Sacraments and formation, shaped for a working life that does not follow a parish calendar.",
  },
  {
    name: "Fellowship",
    heading: "Catholics Who Understand Your World",
    /** Drawn from "Come Follow Me" and the chapters page. */
    body: "To act in concert with fellow aviation people on a mission of mercy, to counsel young people, to pray together, to worship together in spirit and in truth. Join a chapter, start one where there is none, or take part as a member at large.",
  },
  {
    name: "Flying",
    heading: "There Are No Limitations",
    /** CAA copy — chapters page, lightly condensed. */
    body: "Chapters engage in flight training, teach aviation at Catholic schools, arrange guest speakers and field trips, set up internships, build flight simulators, take the Sacraments to disaster areas, do career counseling, and assist with adaptive tools for the handicapped. For those who believe and strive to love, the sky truly is the limit.",
    status: "Chapter-led — varies by location",
  },
];

export const benefits = {
  eyebrow: "Why Members Join",
  heading: "What Belonging to CAA Gives You",
  lede: "Not a list of perks. The reasons people stay are close to why they joined in the first place.",
  items: [
    {
      heading: "Growth in Holiness",
      body: "Formation and prayer shaped for a life spent in irregular hours and constant travel.",
    },
    {
      heading: "Mutual Support",
      body: "People who understand both the demands of the work and the practice of the faith, and who will pray for you by name.",
    },
    {
      heading: "A Chapter or a Home Without One",
      body: "Join a chapter, form a new one, or take part as a member at large. No one is left out for want of a chapter nearby.",
    },
    {
      heading: "Networking Across the Industry",
      body: "Catholic topics and job and career networking alike, among people who already share your work.",
    },
  ],
};

export const everyDay = {
  eyebrow: "CAA Every Day",
  heading: "A Reason to Come Back Tomorrow",
  /** CAA copy — "CAA Every Day", condensed. */
  lede: "The daily Scripture readings, the latest Catholic news from reputable sources, and a community always waiting to hear from you. Everything from Catholic topics to job and career networking, all in one place.",
  /**
   * Citations are shown rather than full reading text. The USCCB translation
   * is copyrighted, so reproducing the readings needs permission first.
   */
  readingNote:
    "Reading citations shown here. Displaying the full text requires permission from the copyright holder.",
  cta: { label: "See Today's Readings", href: "/resources/every-day" },
};

export const storiesTeaser = {
  eyebrow: "Stories",
  heading: "The People This Is Actually About",
  lede: "Members, chapters, and the ordinary working life of Catholics in aviation.",
  cta: { label: "Read the Stories", href: "/stories" },
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
  /** CAA copy — Chairman's letter. */
  heading: "Come Aboard",
  lede: "Become a member of our association and become a part of a growing organization that will positively impact our society for the better.",
  cta: { label: "Join or Renew Your Membership", href: "/participate/join" },
};
