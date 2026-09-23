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
  /** Set when the area varies by place or is not yet running everywhere. */
  status?: string;
};

export const hero = {
  eyebrow: "The Worldwide Catholic Aviation Community",
  heading: "Where Faith Takes Flight",
  /** CAA's own tagline, carried under the headline. */
  subhead: "Faith, Flying and Fellowship",
  /** CAA copy, condensed from the homepage. */
  lede: "Wherever you are in your aviation journey, join a community where faith comes first and you are never flying alone.",
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
  /** CAA copy, from the published mission statement. */
  lede: "Our vision is to be a witness for Jesus Christ and the Christian values that are the necessary foundation for a strong and fruitful society. Our mission is to connect Catholics involved in any aspect of aviation, and to support one another as we journey through these challenging times.",
};

export const missionAreas: MissionArea[] = [
  {
    name: "Faith",
    heading: "Bringing the Good News to the World of Aviation",
    /** Drawn from the Chairman's letter. */
    body: "CAA was founded to unite the People of God who work in aviation, so that we can support each other and help rebuild the moral foundation of our nation. Aviation keeps hours that no parish calendar was built around. Prayer, the Sacraments and formation have to reach you where the work actually puts you.",
  },
  {
    name: "Fellowship",
    heading: "Catholics Who Understand Your World",
    /** Drawn from "Come Follow Me" and the chapters page. */
    body: "To act in concert with fellow aviation people on a mission of mercy, to counsel young people, to pray together and to worship together in spirit and in truth. Join a chapter where one exists, start one where none does, or take part as a member at large.",
  },
  {
    name: "Flying",
    heading: "There Are No Limitations",
    /** CAA copy, from the chapters page, lightly condensed. */
    body: "Chapters run flight training, teach aviation at Catholic schools, arrange guest speakers and field trips, set up internships, build flight simulators, carry the Sacraments to disaster areas, and help design adaptive tools for the handicapped. For those who believe and strive to love, the sky truly is the limit.",
    status: "Chapter-led, so the work varies by place",
  },
];

export const benefits = {
  eyebrow: "Why Members Join",
  heading: "What Belonging to CAA Gives You",
  lede: "The reasons people stay are close to the reasons they joined.",
  items: [
    {
      heading: "Growth in Holiness",
      body: "Formation and prayer that hold up against irregular hours and constant travel.",
    },
    {
      heading: "Mutual Support",
      body: "People who understand the demands of the work and the practice of the faith, and who will pray for you by name.",
    },
    {
      heading: "A Chapter, or a Home Without One",
      body: "Join a chapter, form a new one, or take part as a member at large. Nobody is left out for want of a chapter nearby.",
    },
    {
      heading: "Networking Across the Industry",
      body: "Career and job conversations among people who already share your work and your faith.",
    },
  ],
};

export const everyDay = {
  eyebrow: "CAA Every Day",
  heading: "A Reason to Come Back Tomorrow",
  /** CAA copy, from the "CAA Every Day" page. */
  lede: "The daily Scripture readings, the latest Catholic news from reputable sources, and a community always waiting to hear from you.",
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
  heading: "The People Behind the Association",
  lede: "Members, chapters, and the ordinary working life of Catholics in aviation.",
  cta: { label: "See All Articles", href: "/stories" },
};

export const closing = {
  /** CAA copy, from the Chairman's letter. */
  heading: "Come Aboard",
  lede: "Become a member of our association and join a growing organization that will change our society for the better.",
  cta: { label: "Join or Renew Your Membership", href: "/participate/join" },
};
