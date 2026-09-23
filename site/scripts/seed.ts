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
} from "../lib/schema";
import { hashPassword } from "../lib/passwords";

async function main() {
  console.log("seeding…");

  const tiers = await db.insert(membershipTiers).values([
    { slug: "registered", name: "Registered", description: "An account on the site. Not a dues-paying membership.", amountCents: null, sortOrder: 0 },
    { slug: "member", name: "CAA Member", description: "Annual dues. Amount pending board confirmation.", amountCents: 3500, sortOrder: 1 },
    { slug: "clergy-religious", name: "Clergy & Religious", description: "Free by policy.", amountCents: 0, requiresVerification: true, sortOrder: 2 },
    { slug: "student", name: "Student", description: "Free by policy.", amountCents: 0, requiresVerification: true, sortOrder: 3 },
    { slug: "hardship", name: "Hardship", description: "Dues waived on request. No one is turned away.", amountCents: 0, requiresVerification: true, sortOrder: 4 },
  ]).returning();

  // The three chapters CAA actually has today, as listed on catholicaviation.org.
  const ch = await db.insert(chapters).values([
    { slug: "caa-dallas", name: "CAA Dallas", city: "Dallas", region: "Texas", status: "active",
      description: "Serving crews, maintenance staff and general aviation across North Texas.",
      meetingSchedule: "Monthly",
      photoBrief: "CAA Dallas chapter gathering, or a member at work airside." },
    { slug: "caa-indianapolis", name: "CAA Indianapolis", city: "Indianapolis", region: "Indiana", status: "active",
      description: "The chapter nearest CAA headquarters. Currently building a flight simulator from a glider fuselage section.",
      meetingSchedule: "Monthly",
      photoBrief: "CAA Indianapolis members at work on the simulator build." },
    { slug: "caa-kansas-city", name: "CAA Kansas City", city: "Kansas City", region: "Missouri", status: "active",
      description: "Catholics across the Kansas City aviation community.",
      meetingSchedule: "Monthly",
      photoBrief: "CAA Kansas City chapter members gathered." },
  ]).returning();

  const memberTier = tiers.find((t) => t.slug === "member")!;

  const [admin] = await db.insert(users).values({
    email: "admin@catholicaviation.org",
    passwordHash: await hashPassword("changeme-in-production"),
    name: "CAA Administrator", role: "admin",
    membershipStatus: "active", membershipTierId: memberTier.id,
    chapterId: ch[1].id, showInDirectory: false,
    aviationRole: "Association staff", city: "Carmel", region: "Indiana", country: "United States",
    memberSince: new Date("2012-07-27"),
  }).returning();

  await db.insert(users).values({
    email: "leader@catholicaviation.org",
    passwordHash: await hashPassword("changeme-in-production"),
    name: "Chapter Leader (example)", role: "chapter_leader",
    membershipStatus: "active", membershipTierId: memberTier.id,
    chapterId: ch[0].id, showInDirectory: true,
    aviationRole: "Airline pilot", city: "Dallas", region: "Texas", country: "United States",
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
      summary: "The Mass, the Divine Liturgy, and how to pray more deliberately.",
      body: "", sortOrder: 1 },
    { slug: "airport-chapels", title: "Airport Chapels Directory", category: "Travel",
      summary: "CAA's own directory of airport chapels. How much of the world it covers is still to be agreed.",
      body: "", sortOrder: 2 },
    { slug: "prayer", title: "Prayer", category: "Formation",
      summary: "Prayers for those who fly and those who keep them flying.", body: "", sortOrder: 3 },
  ]);

  await db.insert(prayerRequests).values([
    { displayName: "Michael", intention: "For safe travel for all crews this week.", isPublic: true, status: "approved" },
    { displayName: "Anne", intention: "For my father, who is unwell.", isPublic: true, status: "approved" },
  ]);

  await db.insert(sponsors).values([
    { name: "Partner name to be confirmed", tier: "partner",
      blurb: "Aviation and Catholic businesses that support the mission.", sortOrder: 1 },
  ]);

  await db.insert(products).values([
    { slug: "caa-lapel-pin", name: "CAA lapel pin", description: "The compact mark in enamel.",
      priceCents: 1200, photoBrief: "Product photograph of the pin on a neutral ground." },
  ]);

  await db.insert(pages).values([
    { slug: "about", title: "About CAA",
      body: "The Catholic Aviation Association is a nonprofit corporation registered in the state of Indiana and recognized under section 501(c)(3). It was founded by Thomas J. \"Tom\" Beckenbauer to unite the People of God working in every part of aviation. Chapters are being established across the country, and in time internationally. The association holds to fidelity to the Magisterium." },
    { slug: "contact", title: "Contact", body: "A simple contact form and information." },
  ]);

  console.log(`seeded: ${ch.length} chapters, ${tiers.length} tiers, admin=${admin.email}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
