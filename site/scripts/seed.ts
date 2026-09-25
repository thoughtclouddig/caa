/**
 * Seed data.
 *
 * Deliberately conservative: real chapter counts, no invented membership
 * numbers, no fabricated member articles. Terry's note was that only three
 * chapters are actually functioning, so that is what this reflects.
 */
import { db } from "../lib/db";
import {
  users, chapters, membershipTiers, events, articles, resources,
  prayerRequests, sponsors, products, pages,
  newsletterIssues, newsletterIssueArticles,
} from "../lib/schema";
import { hashPassword } from "../lib/passwords";

async function main() {
  console.log("seeding…");

  /*
   * Membership levels.
   *
   * Basic membership is free, by board direction. The support levels are
   * set against what comparable organisations charge: EAA national
   * membership is $48 a year and AOPA is $49 digital or $59 standard, with
   * AOPA Premier at $99. CAA gives fellowship, formation and chapters
   * rather than magazines, legal services and insurance, so nothing here
   * sits above that band, and the entry level is free where theirs is not.
   *
   * Amounts are read from this table at runtime, so the board can change
   * any of them without a release.
   */
  const tiers = await db.insert(membershipTiers).values([
    {
      slug: "member",
      name: "Member",
      description:
        "Free, and a real membership. A chapter, the member directory, the map, prayer and everything the association does in public. Nobody is asked for money to belong.",
      amountCents: 0,
      cadence: "none",
      benefits: [
        "The member directory and the worldwide member map",
        "The chapter directory, and a chapter to join near you",
        "The airport chapel and Mass finder",
        "Prayer requests, member stories and the forum",
        "The newsletter",
      ],
      sortOrder: 0,
    },
    {
      slug: "supporting",
      name: "Supporting Member",
      description:
        "For members who want to carry part of the cost. Roughly what a national aviation membership runs to, given to an apostolate instead.",
      amountCents: 5000,
      cadence: "annual",
      benefits: [
        "Everything in the free membership",
        "Mentorship matching, by role and by what you actually fly or fix",
        "Corporate partner discounts: Avemco, King Schools, EveryLife, Purdue and the rest",
        "The Catholic Airman, CAA's publication",
      ],
      sortOrder: 1,
    },
    {
      slug: "sustaining",
      name: "Sustaining Member",
      description:
        "Pays for the things a chapter cannot fund on its own: materials, travel to start a new chapter, a priest's expenses for an Aviation Mass.",
      amountCents: 10000,
      cadence: "annual",
      benefits: [
        "Everything in Supporting Member",
        "Your giving is directed to a named chapter if you want it to be",
        "An invitation to the annual members' meeting",
      ],
      sortOrder: 2,
    },
    {
      slug: "founding-patron",
      name: "Founding Patron",
      description:
        "For those building the association in its first years, while the work still depends on a small number of people.",
      amountCents: 25000,
      cadence: "annual",
      benefits: [
        "Everything in Sustaining Member",
        "A voice in how the association is governed",
        "Founding recognition, permanently",
      ],
      sortOrder: 3,
    },
    {
      slug: "life",
      name: "Life Member",
      description:
        "Given once. For members who want their support settled and done with.",
      amountCents: 100000,
      cadence: "once",
      benefits: [
        "Everything in Founding Patron",
        "No renewal, ever",
      ],
      sortOrder: 4,
    },
  ]).returning();

  // The three chapters CAA actually has today, as listed on catholicaviation.org.
  // The three chapters CAA actually has, with the patron each has taken
  // and what each is doing, from catholicaviation.org.
  const ch = await db.insert(chapters).values([
    {
      slug: "caa-dallas", name: "CAA Dallas",
      patronName: "Cupertino Chapter",
      tagline: "Flight and faith in the Lone Star state.",
      city: "Dallas", region: "Texas", status: "active",
      description: "Serving crews, maintenance staff and general aviation across North Texas.",
      body:
        "<p>The Dallas chapter is both a CAA affiliate and a Cupertino Flying Club.</p>" +
        "<p>God has allowed us to use our aviation skills this year, as in past years, to deliver priests for Sacramental support. Those involved have encountered Christ in ways too profound to express in words.</p>" +
        "<p>We maintain a low profile, and do not post these experiences to social media. If you would like to join us and get involved, we would love to hear from you. In our chapter, we prefer people bring their skills and time to serve Christ in aviation in lieu of donations.</p>" +
        "<p>What may Christ be calling you to do?</p>",
      meetingSchedule: "Monthly", latitude: 32.7767, longitude: -96.797,
      photoBrief: "CAA Dallas members, or a priest being flown for Sacramental support.",
    },
    {
      slug: "caa-indianapolis", name: "CAA Indianapolis",
      patronName: "Loreto Chapter",
      tagline: "Faith, flying and fellowship at the Crossroads of America.",
      city: "Indianapolis", region: "Indiana", status: "active",
      description: "The chapter nearest CAA headquarters, and the one building the flight simulator.",
      body:
        "<h2>What is happening</h2>" +
        "<ul>" +
        "<li>The flight simulator is nearly finished.</li>" +
        "<li>The dressing hook design for Jessica Cox's Rightfooted Foundation is ready for production and distribution. A chapter member's manufacturing background was applied to help improve the design and the manufacturing method.</li>" +
        "<li>We provided a tour for the local high school aviation class at Vincennes University's Aviation Tech Center, a guest speaker from the National Weather Service, and arranged a spring semester internship for two students at an area FBO.</li>" +
        "</ul>",
      meetingSchedule: "Monthly", latitude: 39.7684, longitude: -86.1581,
      imagePath: "/gallery/flight-simulator-build.jpg",
      imageAlt: "CAA Indianapolis members at work on the flight simulator in a workshop.",
    },
    {
      slug: "caa-kansas-city", name: "CAA Kansas City",
      patronName: "St. Padre Pio Chapter",
      tagline: "City of fountains, flight and faith.",
      city: "Kansas City", region: "Missouri", status: "active",
      description: "Catholics across the Kansas City aviation community.",
      body:
        "<p>The Kansas City chapter is both a CAA affiliate and a Cupertino Flying Club.</p>" +
        "<p>We meet at Lumen Christi Monastery, the Community of the Lamb, for six o'clock Mass followed by fellowship at Callsign Brewing.</p>" +
        "<h2>The Cupertino Aviation Club</h2>" +
        "<p>Our affiliated club at St. Michael the Archangel High School has had a good year. In March students toured Millennium International Avionics and learned about the repair and overhaul of avionics systems. In April they visited EAA Chapter 91 at Lee's Summit Airport. In May they went to Summit Flight Academy and Midwest Avionics, and in June to the control tower at Johnson County Executive.</p>",
      meetingSchedule: "Monthly", latitude: 39.0997, longitude: -94.5786,
      photoBrief: "CAA Kansas City members, or the Cupertino Aviation Club on a field trip.",
    },
  ]).returning();

  const memberTier = tiers.find((t) => t.slug === "member")!;

  const [admin] = await db.insert(users).values({
    email: "admin@catholicaviation.org",
    passwordHash: await hashPassword("changeme-in-production"),
    name: "CAA Administrator", role: "admin",
    membershipStatus: "active", membershipTierId: memberTier.id,
    chapterId: ch[1].id, showInDirectory: false,
    aviationRole: "Association staff", locationSlug: "indianapolis-in",
    memberSince: new Date("2012-07-27"),
  }).returning();

  await db.insert(users).values({
    email: "leader@catholicaviation.org",
    passwordHash: await hashPassword("changeme-in-production"),
    name: "Chapter Leader (example)", role: "chapter_leader",
    membershipStatus: "active", membershipTierId: memberTier.id,
    chapterId: ch[0].id, showInDirectory: true,
    aviationRole: "Airline pilot", locationSlug: "dallas-tx",
    memberSince: new Date("2019-03-01"),
  });

  await db.insert(events).values([
    { slug: "annual-aviation-mass", title: "Annual Aviation Mass",
      description: "Offered for everyone who works in aviation, and for those who have died in it.",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), location: "To be confirmed",
      isPublic: true, status: "published" },
    { slug: "caa-indianapolis-monthly", title: "CAA Indianapolis chapter meeting",
      description: "Monthly gathering: prayer, formation, and time together.",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), location: "Indianapolis, Indiana",
      chapterId: ch[1].id, isPublic: true, status: "published" },
  ]);

  // Articles. BRING ONE! is the current membership drive and leads the
  // homepage; the rest are real chapter and member news from CAA.
  // Photographs are CAA's own, carried over from catholicaviation.org and
  // credited where the existing site credits them.
  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - 1000 * 60 * 60 * 24 * n);

  await db.insert(articles).values([
    {
      slug: "bring-one",
      title: "Bring One!",
      excerpt:
        "Our goal is to bring one new member to CAA by the end of October. One each. That is the whole drive.",
      body:
        "BRING ONE! Our goal is to bring just one new member to CAA by the end of October, extended from the end of September.\n\n" +
        "One is a small number on purpose. It is not a quota and it is not a campaign target handed down from headquarters. It is the person you already know: the one in the next hangar, on the other end of the radio, in the seat beside you on the jumpseat. You already know who they are.\n\n" +
        "Please take part in the membership drive and help us fill what we need to fulfill our aviation vocation as servants of other Christs, and to fill in what is needed in our Catholic lives, for ourselves, for those we love, and for one another.\n\n" +
        "BRING ONE!",
      authorName: "CAA",
      imagePath: "/articles/bring-one.jpg",
      imageAlt:
        "A carved relief of Christ above two airliners, with people carried upward beneath them. The base reads: Bring one. Together we fly to Christ. Catholic Aviation Association.",
      isFeatured: true,
      status: "published",
      publishedAt: daysAgo(3),
    },
    {
      slug: "indianapolis-flight-simulator",
      title: "A Glider Fuselage Becomes a Flight Simulator",
      excerpt:
        "CAA Indianapolis is building a flight simulator out of a section of glider fuselage.",
      body:
        "CAA Indianapolis is developing a flight simulator from a glider fuselage section.\n\n" +
        "It is the kind of project a chapter can actually carry: real airframe, real work, and something a visitor can sit in at the end of it. Chapter members are doing the build themselves.\n\n" +
        "Full write-up and photographs to follow from the chapter.",
      authorName: "CAA Indianapolis",
      imagePath: "/articles/indianapolis-flight-simulator.jpg",
      imageAlt:
        "Three CAA Indianapolis members standing around a glider fuselage section in a workshop.",
      status: "published",
      publishedAt: daysAgo(12),
    },
    {
      slug: "why-a-catholic-aviation-association",
      title: "Why a Catholic Aviation Association",
      excerpt:
        "Aviation keeps hours no parish calendar was built around. That is the problem CAA was founded to answer.",
      body:
        "Aviation does not keep parish hours. Crews are away on Sundays, mechanics work nights, controllers rotate through shifts that put Mass out of reach for weeks at a time. People who would never describe themselves as having left the faith find they have simply stopped being able to practice it.\n\n" +
        "The Catholic Aviation Association was founded to answer that directly: to unite the People of God involved in every aspect of aviation so that we can support one another, and so that nobody is doing this alone.\n\n" +
        "A fuller account from members belongs here. If you have one, write to us.",
      authorName: "CAA",
      imagePath: "/articles/citabria-sunset.jpg",
      imageAlt:
        "The view out under the wing of a Citabria at sunset, over Indiana farmland.",
      imageCredit: "Photo: Laura Stants",
      status: "published",
      publishedAt: daysAgo(26),
    },
    {
      slug: "blessing-of-an-aircraft",
      title: "The Blessing of an Aircraft",
      excerpt:
        "A priest, a bottle of holy water, and an Aeronca Chief on the grass.",
      body:
        "An aircraft blessing is a small thing to arrange and a hard thing to forget. A priest, a bottle of holy water, and whatever is parked on the grass that morning.\n\n" +
        "It is one of the most direct answers to what CAA is for. The work and the faith are not kept in separate compartments, brought together only when something goes wrong. The aircraft is part of the life, so the aircraft is blessed.\n\n" +
        "If your chapter has arranged one, send us the photographs and the details and we will run them here.",
      authorName: "CAA",
      imagePath: "/articles/airplane-blessing.jpg",
      imageAlt:
        "A priest holding holy water stands beside an owner in front of a blue and white Aeronca Chief.",
      status: "published",
      publishedAt: daysAgo(40),
    },
    {
      slug: "meeting-jessica-cox-at-airventure",
      title: "Meeting Jessica Cox at AirVenture",
      excerpt:
        "Chairman Tom Beckenbauer and Christian Tombers with the first armless private pilot in history.",
      body:
        "Chairman Tom Beckenbauer and Christian Tombers met Jessica Cox at the 2026 EAA AirVenture in Oshkosh.\n\n" +
        "Jessica is the first armless private pilot in history. She also scuba dives and holds a black belt in tae kwon do, and she was recently inducted into the Arizona Aviation Hall of Fame.\n\n" +
        "She heads the Rightfooted Foundation, which promotes independence and ability for armless and other handicapped people. That work sits close to something CAA chapters already do: assisting with the design and manufacture of adaptive tools for the handicapped.",
      authorName: "CAA",
      photoBrief:
        "Tom Beckenbauer and Christian Tombers with Jessica Cox at AirVenture 2026. CAA holds this photograph; it is on the CAA Every Day page of the existing site.",
      status: "published",
      publishedAt: daysAgo(54),
    },
    {
      slug: "caa-at-ncyc",
      title: "CAA at the National Catholic Youth Conference",
      excerpt:
        "Tom Beckenbauer and Christian Tombers working the CAA stand, under a banner reading Faith, Flying and Fellowship.",
      body:
        "Tom Beckenbauer and Christian Tombers took CAA to the National Catholic Youth Conference, with a sailplane wing, a table of aviation material and a stand full of people asking what the association is.\n\n" +
        "Young people are the part of the founding vision with the furthest still to go. Getting in front of them at an event like this is how a chapter starts somewhere new.\n\n" +
        "A fuller account belongs here. If you were there, write to us.",
      authorName: "CAA",
      imagePath: "/articles/tom-and-christian-ncyc.jpg",
      imageAlt:
        "Tom Beckenbauer and Christian Tombers at the Catholic Aviation Association stand, holding a sailplane component beneath CAA banners.",
      status: "published",
      publishedAt: daysAgo(70),
    },
  ]);

  await db.insert(resources).values([
    { slug: "catholic-foundations", title: "Catholic Foundations", category: "Formation",
      summary: "The Mass, the Sacraments, and how to pray more deliberately.", imagePath: "/gallery/eucharist.jpg",
      imageAlt: "The Blessed Sacrament exposed for adoration.",
      sortOrder: 1 },
    { slug: "prayer-page", title: "CAA Prayer Page", category: "Formation",
      summary: "Prayers for those who fly and those who keep them flying.", imagePath: "/gallery/divine-mercy.jpg",
      imageAlt: "An image of the Divine Mercy.",
      sortOrder: 2 },
    { slug: "apologetics", title: "Ask the Apologist", category: "Formation",
      summary: "Answers to the questions members actually get asked in a crew room.", photoBrief: "A member in conversation. Two people talking, not a lectern.",
      sortOrder: 3 },
    { slug: "become-a-catholic", title: "Become a Catholic", category: "Formation",
      summary: "For anyone reading who is not Catholic, or who has been away a while.", photoBrief: "A church interior, or someone at the back of a Mass. Welcoming, not grand.",
      sortOrder: 4 },
    { slug: "airport-chapels", title: "Airport Chapels Directory", category: "Travel",
      summary: "CAA's own directory. Most large airports have a chapel and almost nobody knows where.", imagePath: "/gallery/westfield.jpg",
      imageAlt: "CAA members gathered at Westfield, Indiana.",
      sortOrder: 5 },
    { slug: "caa-youth", title: "CAA Youth", category: "Youth",
      summary: "Internships, tours, guest speakers and the Cupertino flying clubs.", imagePath: "/gallery/hillsdale-flag-jump.jpg",
      imageAlt: "A parachutist under canopy carrying the flag at Hillsdale College.",
      sortOrder: 6 },
    { slug: "caa-media", title: "CAA Media", category: "Media",
      summary: "Talks, recordings and where CAA has appeared.", imagePath: "/gallery/caa-banner.jpg",
      imageAlt: "The Catholic Aviation Association banner reading Faith, Flying and Fellowship.",
      sortOrder: 7 },
  ]);

  /*
   * No prayer intentions are seeded. They are written by members, and a
   * live site opening with invented ones attributed to people who do not
   * exist would be a lie on the most personal page there is. Sample
   * intentions for a walkthrough live in scripts/demo-data.ts.
   */

  /*
   * CAA's real corporate partners. Their framing, from the existing site:
   * partnership is about organisations that demonstrate fidelity to
   * Catholic teaching and offer members an alternative to companies
   * funding abortion. The discount is the practical part, not the point.
   */
  await db.insert(sponsors).values([
    { name: "Avemco Insurance Company", tier: "partner", sortOrder: 1,
      blurb: "The only direct aircraft insurance carrier. Avemco cuts out the middleman, which lets them offer straightforward, reliable cover at competitive rates.",
      memberOffer: "5% discount for CAA members" },
    { name: "Charity Mobile", tier: "partner", sortOrder: 2,
      blurb: "The pro-life phone company.",
      memberOffer: "A percentage of your monthly charge rebated to CAA" },
    { name: "King Schools", tier: "partner", sortOrder: 3,
      blurb: "The King Study Method is not about memorising answers to pass a test. You come away understanding the concepts and the terminology, which makes you a better and a safer pilot.",
      memberOffer: "At least 20% off all King Schools courses" },
    { name: "EveryLife", tier: "partner", sortOrder: 4,
      blurb: "Infant diapers, pants and bath and body products. Unlike the major producers, who donate to Planned Parenthood, EveryLife is entirely pro-life.",
      memberOffer: "25% off and free shipping" },
    { name: "Purdue University", tier: "partner", sortOrder: 5,
      blurb: "Home to 27 US astronauts, more than any other university. Degree programmes in Aviation Management and Professional Pilot among 150 programmes.",
      memberOffer: "20% or more off 150 Purdue programmes" },
    { name: "Angel Flight NE", tier: "partner", sortOrder: 6,
      blurb: "Free medical air transportation. For nearly thirty years their volunteer pilots, ground crew and airline partners have flown patients to specialist care across the country at no cost to the patient. CAA encourages members to give time, talent and aircraft.",
      memberOffer: null },
    { name: "Presence of God Encounters", tier: "friend", sortOrder: 7,
      blurb: "After a near-fatal car accident in 2017, FedEx pilot and CAA board member Ed Jozsa tells his own account of an encounter with God, and the journey of faith that followed.",
      memberOffer: "Both books free to paid members" },
  ]);

  /*
   * The eight items from CAA's own Merchandise Guide. Prices are
   * provisional: they are a sensible retail on Printful's blank costs, not
   * a decision anyone has made, and they live in this table so the board
   * can change them without a release.
   */
  await db.insert(products).values([
    { slug: "caa-cap", name: "CAA Cap", priceCents: 2800, sortOrder: 1,
      description: "Embroidered, structured, navy. One size, adjustable.",
      imagePath: "/store/cap.jpg", imageAlt: "A navy cap embroidered with the CAA logo." },
    { slug: "caa-polo-shirt", name: "CAA Polo Shirt", priceCents: 4500, sortOrder: 2,
      description: "Embroidered on the chest, navy. Sizes S to XXL.",
      imagePath: "/store/polo-shirt.jpg", imageAlt: "A navy polo shirt embroidered with the CAA logo." },
    { slug: "caa-t-shirt", name: "CAA T-Shirt", priceCents: 2800, sortOrder: 3,
      description: "Screen printed, heather grey. Sizes S to XXL.",
      imagePath: "/store/t-shirt.jpg", imageAlt: "A grey t-shirt screen printed with the CAA logo." },
    { slug: "caa-jacket", name: "CAA Jacket", priceCents: 7500, sortOrder: 4,
      description: "Embroidered, full zip, navy. Sizes S to XXL.",
      imagePath: "/store/jacket.jpg", imageAlt: "A navy full-zip jacket embroidered with the CAA logo." },
    { slug: "caa-fleece-vest", name: "CAA Fleece Vest", priceCents: 6500, sortOrder: 5,
      description: "Embroidered, navy. Sizes S to XXL.",
      imagePath: "/store/fleece-vest.jpg", imageAlt: "A navy fleece vest embroidered with the CAA logo." },
    { slug: "caa-tumbler", name: "CAA Tumbler", priceCents: 3200, sortOrder: 6,
      description: "Laser engraved, insulated, 20oz.",
      imagePath: "/store/tumbler.jpg", imageAlt: "An insulated black tumbler carrying the CAA logo." },
    { slug: "caa-flight-bag", name: "CAA Flight Bag", priceCents: 8500, sortOrder: 7,
      description: "Embroidered, navy, with room for headset, charts and a tablet.",
      imagePath: "/store/flight-bag.jpg", imageAlt: "A navy flight bag embroidered with the CAA logo." },
    { slug: "caa-challenge-coin", name: "CAA Challenge Coin", priceCents: 1500, sortOrder: 8,
      description: "Die struck and enamelled. Faith, Flight, Mission.",
      imagePath: "/store/challenge-coin.jpg", imageAlt: "A die struck challenge coin reading Faith, Flight, Mission." },
  ]);

  /*
   * Editable page copy. Every slug here is registered in
   * content/editable-pages.ts, so staff can find and change each one.
   * The Chairman's letter is carried over word for word.
   */
  await db.insert(pages).values([
    { slug: "about", title: "About CAA",
      body: "<p>The Catholic Aviation Association is a nonprofit corporation registered in the state of Indiana and recognized under section 501(c)(3). It was founded by Thomas J. \"Tom\" Beckenbauer to unite the People of God working in every part of aviation. Chapters are being established across the country, and in time internationally. The association holds to fidelity to the Magisterium.</p>" },
    { slug: "contact", title: "Contact",
      body: "<p>Write to us and someone will come back to you. We are a volunteer association, so please allow a few days for a reply.</p><p>Tell us where you are and what part of aviation you work in, and we will point you to the nearest chapter.</p>" },
    { slug: "letter-from-the-chairman", title: "Letter from the Chairman",
      body:
        "<p>Dear Brothers and Sisters in Christ,</p>" +
        "<p>God has placed a burden on my heart to bring the good news of JESUS CHRIST to the world of aviation! Our world is on a cultural decline, and this has affected our economy, our youth and the Church. There is a decay that is affecting the roots of our society, including the aviation industry. It is my desire to unite the People of God involved in all aspects of aviation so that we may support each other, help stop this decay, and rebuild the moral foundation of our nation.</p>" +
        "<p>To this end, I started the Catholic Aviation Association (CAA), a nonprofit corporation registered in the state of Indiana, to help transform hearts and minds within the world of aviation through FAITH, FLYING &amp; FELLOWSHIP!</p>" +
        "<p>An enthusiastic Board is actively planning projects and activities that will edify all CAA members and be a positive witness to those around us. Chapters are being establishing around the country (and eventually internationally) to bring the People of God together.</p>" +
        "<p>To continue this mission we need your prayers and financial support.</p>" +
        "<p>Become a member of our association and become a part of a growing organization that will positively impact our society for the better.</p>" +
        "<p>May God bless you now and forevermore,</p>" +
        "<p><strong>Thomas J. \"Tom\" Beckenbauer</strong><br />Chairman of the Board, Catholic Aviation Association</p>" },
    { slug: "come-follow-me", title: "Come Follow Me",
      body:
        "<p>Few things compare to the impulse some feel with their first flight that leads to a flying vocation. Or a fine weld on chromalloy steel on an airframe. Or to watch the first moon walk, or an airshow. Or a SpaceX first stage rocket being recaptured, or a space walk. All evoke emotions of awe and a kind of satisfaction for being present at a special time in life and sometimes, history.</p>" +
        "<p>And to change your life by responding to grace is also deeply satisfying. To help a friend in distress, to forgive and let go of chronic anger, or to see a loved one come back to their Catholic faith. To act in concert with fellow aviation people on a mission of mercy, to counsel young people, or to pray together, to worship together \"in spirit and in truth\" (John 4:24).</p>" +
        "<p>The possibilities are literally limitless.</p>" +
        "<p>We combine some of life's deepest emotional events and missions into a single organization, and then we share them with one another.</p>" +
        "<p>We want you to be a part of this, and more.</p>" },
  ]);

  /*
   * A first newsletter issue, assembled from the articles above rather
   * than written separately. Published to the archive but deliberately
   * not marked sent: nothing has gone to anybody, and sentAt is what
   * records that it did.
   */
  const [issue] = await db.insert(newsletterIssues).values({
    slug: "caa-update-autumn-2026",
    title: "CAA Update, Autumn 2026",
    intro:
      "<p>A short one to begin with. The drive is on, the Indianapolis simulator is nearly finished, and there is an aircraft blessed on the grass at the bottom of this letter.</p>" +
      "<p>If you know one person in aviation who ought to be with us, this is the month to ask them.</p>",
    status: "published",
    publishedAt: daysAgo(2),
  }).returning();

  const issueArticles = ["bring-one", "indianapolis-flight-simulator", "blessing-of-an-aircraft", "caa-at-ncyc"];
  const chosen = await db.select({ id: articles.id, slug: articles.slug }).from(articles);
  await db.insert(newsletterIssueArticles).values(
    issueArticles.map((slug, index) => ({
      issueId: issue.id,
      articleId: chosen.find((a) => a.slug === slug)!.id,
      sortOrder: index,
    })),
  );

  console.log(`seeded: ${ch.length} chapters, ${tiers.length} tiers, admin=${admin.email}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
