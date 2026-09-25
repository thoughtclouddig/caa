/**
 * Demo data.
 *
 * Deliberately separate from the seed. The seed is what a real deployment
 * starts from; this is only what makes a walkthrough work: something in
 * the prayer queue to approve, a draft to publish, a few subscribers so
 * the list is not empty.
 *
 * Run with:  npm run db:demo
 * Clear with: npm run db:demo:clear
 *
 * Everything it writes is tagged so it can be removed again. None of it
 * should survive into a live site.
 */
import { db } from "../lib/db";
import {
  prayerRequests, articles, newsletterSubscribers, users, chapters,
  membershipTiers, mentorshipProfiles, eventRsvps, events, donations,
} from "../lib/schema";
import { like, inArray } from "drizzle-orm";
import { randomBytes } from "crypto";
import { hashPassword } from "../lib/passwords";

const DEMO_EMAIL_DOMAIN = "@demo.catholicaviation.invalid";

async function add() {
  /*
   * Members. A directory of one administrator demonstrates nothing, and a
   * profile with every field blank demonstrates less. These carry real
   * roles, real places from the published list, and real chapters.
   */
  const [ch, tiers] = await Promise.all([
    db.select().from(chapters),
    db.select().from(membershipTiers),
  ]);
  const chapterId = (slug: string) => ch.find((c) => c.slug === slug)?.id ?? null;
  const tierId = (slug: string) => tiers.find((t) => t.slug === slug)?.id ?? null;
  const password = await hashPassword("changeme-in-production");

  const people = [
    {
      email: `member${DEMO_EMAIL_DOMAIN}`, name: "Terry Garrity",
      aviationRole: "Commercial pilot, single and multi-engine",
      locationSlug: "indianapolis-in", chapterId: chapterId("caa-indianapolis"),
      membershipStatus: "active" as const, membershipTierId: tierId("founding-patron"),
      role: "member" as const, showInDirectory: true,
      memberSince: new Date("2012-09-14"),
    },
    {
      email: `maria${DEMO_EMAIL_DOMAIN}`, name: "Maria Delgado",
      aviationRole: "Air traffic controller", locationSlug: "dallas-tx",
      chapterId: chapterId("caa-dallas"), membershipStatus: "active" as const,
      membershipTierId: tierId("supporting"), role: "member" as const,
      showInDirectory: true, memberSince: new Date("2021-03-02"),
    },
    {
      email: `joseph${DEMO_EMAIL_DOMAIN}`, name: "Joseph Whitfield",
      aviationRole: "A&P mechanic, 22 years on radials",
      locationSlug: "kansas-city-mo", chapterId: chapterId("caa-kansas-city"),
      membershipStatus: "registered" as const, membershipTierId: tierId("member"),
      role: "chapter_leader" as const, showInDirectory: true,
      memberSince: new Date("2023-06-11"),
    },
    {
      email: `clare${DEMO_EMAIL_DOMAIN}`, name: "Clare Nwosu",
      aviationRole: "Dispatcher", locationSlug: "chicago-il", chapterId: null,
      membershipStatus: "registered" as const, membershipTierId: tierId("member"),
      role: "member" as const, showInDirectory: true,
      memberSince: new Date("2025-11-20"),
    },
    {
      email: `peter${DEMO_EMAIL_DOMAIN}`, name: "Peter Lindqvist",
      aviationRole: "Student pilot", locationSlug: "wichita-ks", chapterId: null,
      membershipStatus: "registered" as const, membershipTierId: tierId("member"),
      role: "member" as const, showInDirectory: true,
      memberSince: new Date("2026-02-04"),
    },
    {
      email: `anne${DEMO_EMAIL_DOMAIN}`, name: "Anne Boyle",
      aviationRole: "Cabin crew", locationSlug: "boston-ma", chapterId: null,
      membershipStatus: "registered" as const, membershipTierId: tierId("member"),
      role: "member" as const, showInDirectory: false,
      memberSince: new Date("2024-08-30"),
    },
  ];

  const made = await db.insert(users)
    .values(people.map((p) => ({ ...p, passwordHash: password })))
    .returning({ id: users.id, email: users.email, name: users.name });

  const byEmail = (local: string) =>
    made.find((m) => m.email === `${local}${DEMO_EMAIL_DOMAIN}`)!.id;

  // Mentorship only works as a demo when both sides of a match exist.
  await db.insert(mentorshipProfiles).values([
    { userId: byEmail("joseph"), role: "mentor", specialty: "Airframe and powerplant",
      note: "Happy to talk anyone through the A&P written, or through a first annual." },
    { userId: byEmail("maria"), role: "mentor", specialty: "Air traffic control",
      note: "Controller for eleven years. Ask me about the CTI route or the hiring bid." },
    { userId: byEmail("peter"), role: "seeking", specialty: "Flight training",
      note: "Student pilot, about forty hours. Looking for someone who has been through it." },
  ]);

  const upcoming = await db.select().from(events).limit(2);
  if (upcoming.length > 0) {
    await db.insert(eventRsvps).values(
      upcoming.map((e) => ({ eventId: e.id, userId: byEmail("member"), status: "going" as const })),
    );
  }

  await db.insert(donations).values([
    { userId: byEmail("member"), donorName: "Terry Garrity", amountCents: 25000,
      kind: "dues", status: "pending", note: "Founding Patron, annual." },
    { userId: byEmail("maria"), donorName: "Maria Delgado", amountCents: 5000,
      kind: "dues", status: "pending" },
  ]);

  await db.insert(prayerRequests).values([
    {
      displayName: "Michael",
      intention: "For safe travel for all crews this week.",
      isPublic: true,
      status: "approved",
    },
    {
      displayName: "Anne",
      intention: "For my father, who is unwell.",
      isPublic: true,
      status: "approved",
    },
    {
      displayName: "Stephen",
      intention: "For my check ride on Thursday, and for a steady head.",
      isPublic: true,
      status: "pending",
    },
    {
      displayName: "Rosa",
      intention: "For the crew of the flight my brother works, and for his return to the Sacraments.",
      isPublic: true,
      status: "pending",
    },
  ]);

  await db.insert(articles).values({
    slug: "demo-draft-chapter-forming-in-dayton",
    title: "A Chapter Is Forming in Dayton",
    excerpt: "Four people met after a Saturday Mass. That is how each of the others started.",
    body:
      "<p>Write the article here. This one is a draft, so nobody outside the admin can see it yet.</p>" +
      "<p>Publishing it puts it on the articles index and makes it available to the newsletter.</p>",
    authorName: "CAA",
    status: "draft",
    photoBrief: "The people who met. A room, not a runway.",
  });

  await db.insert(newsletterSubscribers).values([
    { email: `margaret${DEMO_EMAIL_DOMAIN}`, name: "Margaret", token: randomBytes(24).toString("base64url"), source: "newsletter page", status: "subscribed" },
    { email: `paul${DEMO_EMAIL_DOMAIN}`, name: "Paul", token: randomBytes(24).toString("base64url"), source: "joined CAA", status: "subscribed" },
    { email: `james${DEMO_EMAIL_DOMAIN}`, name: "James", token: randomBytes(24).toString("base64url"), source: "website", status: "unsubscribed" },
  ]);

  console.log(
    `demo data added: ${made.length} members, 3 mentorship profiles, ` +
      "2 intentions published and 2 waiting in the queue, 1 draft article, 3 subscribers",
  );
  console.log(`sign in as a member: member${DEMO_EMAIL_DOMAIN} / changeme-in-production`);
}

async function clear() {
  const demoUsers = await db.select({ id: users.id }).from(users)
    .where(like(users.email, `%${DEMO_EMAIL_DOMAIN}`));
  const ids = demoUsers.map((u) => u.id);
  if (ids.length > 0) {
    // Mentorship and RSVPs cascade from the user; donations do not.
    await db.delete(donations).where(inArray(donations.userId, ids));
    await db.delete(users).where(inArray(users.id, ids));
  }
  await db.delete(newsletterSubscribers).where(like(newsletterSubscribers.email, `%${DEMO_EMAIL_DOMAIN}`));
  await db.delete(articles).where(like(articles.slug, "demo-%"));
  // Every intention is demo data: the seed creates none.
  await db.delete(prayerRequests);
  console.log("demo data cleared");
}

const mode = process.argv[2] === "clear" ? clear : add;
mode().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
