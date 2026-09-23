/**
 * Seed data.
 *
 * Deliberately conservative: real chapter counts, no invented membership
 * numbers, no fabricated member stories. Terry's note was that only three
 * chapters are actually functioning, so that is what this reflects.
 */
import { db } from "../lib/db";
import {
  users, chapters, membershipTiers, events, stories, resources,
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

  const ch = await db.insert(chapters).values([
    { slug: "carmel-indiana", name: "Carmel, Indiana", city: "Carmel", region: "Indiana", status: "active",
      description: "The founding chapter, near CAA's headquarters.", meetingSchedule: "Monthly",
      photoBrief: "The Carmel chapter gathered. Real members, not an empty room." },
    { slug: "dallas-fort-worth", name: "Dallas–Fort Worth", city: "Dallas", region: "Texas", status: "active",
      description: "Serving crews and maintenance staff across the DFW area.", meetingSchedule: "Monthly",
      photoBrief: "DFW chapter gathering or a member at work airside." },
    { slug: "phoenix", name: "Phoenix", city: "Phoenix", region: "Arizona", status: "active",
      description: "General aviation and airline members across the Valley.", meetingSchedule: "Monthly",
      photoBrief: "Phoenix chapter members, ideally with general aviation context." },
  ]).returning();

  const memberTier = tiers.find((t) => t.slug === "member")!;

  const [admin] = await db.insert(users).values({
    email: "admin@catholicaviation.org",
    passwordHash: await hashPassword("changeme-in-production"),
    name: "CAA Administrator", role: "admin",
    membershipStatus: "active", membershipTierId: memberTier.id,
    chapterId: ch[0].id, showInDirectory: false,
    aviationRole: "Association staff", city: "Carmel", region: "Indiana", country: "United States",
    memberSince: new Date("2012-07-27"),
  }).returning();

  await db.insert(users).values({
    email: "leader@catholicaviation.org",
    passwordHash: await hashPassword("changeme-in-production"),
    name: "Chapter Leader (example)", role: "chapter_leader",
    membershipStatus: "active", membershipTierId: memberTier.id,
    chapterId: ch[1].id, showInDirectory: true,
    aviationRole: "Airline pilot", city: "Dallas", region: "Texas", country: "United States",
    memberSince: new Date("2019-03-01"),
  });

  await db.insert(events).values([
    { slug: "annual-aviation-mass", title: "Annual Aviation Mass",
      description: "Offered for everyone who works in aviation, and for those who have died in it.",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), location: "To be confirmed",
      isPublic: true, status: "published" },
    { slug: "carmel-monthly", title: "Carmel chapter meeting",
      description: "Monthly gathering: prayer, formation, and time together.",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), location: "Carmel, Indiana",
      chapterId: ch[0].id, isPublic: true, status: "published" },
  ]);

  await db.insert(stories).values([
    { slug: "why-a-catholic-aviation-association", title: "Why a Catholic aviation association",
      excerpt: "Aviation runs on hours that do not match a parish calendar. That is the problem CAA was founded to answer.",
      body: "Placeholder. Real member writing replaces this before launch.",
      authorName: "CAA", status: "published", publishedAt: new Date(),
      photoBrief: "A member at work in aviation — ramp, hangar, flight deck or tower." },
  ]);

  await db.insert(resources).values([
    { slug: "catholic-foundations", title: "Catholic Foundations", category: "Formation",
      summary: "The Mass, the Divine Liturgy, and how to pray more deliberately.",
      body: "Renamed from “Knowledge”, which undersold it and told a visitor nothing.", sortOrder: 1 },
    { slug: "airport-chapels", title: "Airport Chapels Directory", category: "Travel",
      summary: "CAA's own directory of airport chapels. Coverage scope still to be agreed.",
      body: "Kept as CAA's own directory rather than a link out.", sortOrder: 2 },
    { slug: "prayer", title: "Prayer", category: "Formation",
      summary: "Prayers for those who fly and those who keep them flying.", body: "", sortOrder: 3 },
  ]);

  await db.insert(prayerRequests).values([
    { displayName: "Michael", intention: "For safe travel for all crews this week.", isPublic: true, status: "approved" },
    { displayName: "Anne", intention: "For my father, who is unwell.", isPublic: true, status: "approved" },
  ]);

  await db.insert(sponsors).values([
    { name: "Partner name to be confirmed", tier: "partner",
      blurb: "Aviation and Catholic-aligned businesses, framed around shared mission.", sortOrder: 1 },
  ]);

  await db.insert(products).values([
    { slug: "caa-lapel-pin", name: "CAA lapel pin", description: "The compact mark in enamel.",
      priceCents: 1200, photoBrief: "Product photograph of the pin on a neutral ground." },
  ]);

  await db.insert(pages).values([
    { slug: "about", title: "About CAA",
      body: "CAA exists to witness to the Good News of Jesus Christ in the world of aviation. Fidelity to the Magisterium, leadership and history belong on this page." },
    { slug: "contact", title: "Contact", body: "A simple contact form and information." },
  ]);

  console.log(`seeded: ${ch.length} chapters, ${tiers.length} tiers, admin=${admin.email}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
