import "server-only";

import { eq, and, desc, asc, gte, sql, count } from "drizzle-orm";
import { db } from "./db";
import {
  users, chapters, events, eventRsvps, articles, resources,
  prayerRequests, prayerPledges, sponsors, products, pages,
  membershipTiers, donations, mentorshipProfiles,
} from "./schema";

/* ----------------------------- public reads ----------------------------- */

export async function getPublishedArticles(limit = 12) {
  return db.select().from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt)).limit(limit);
}

/**
 * The homepage lead plus the articles that sit under it.
 *
 * Falls back to the most recent published article when staff have not marked
 * one as featured, so the homepage always has a lead. The three below it
 * are the next most recent, with the lead itself filtered out.
 */
export async function getHomeArticles(count = 3) {
  const recent = await db.select().from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.isFeatured), desc(articles.publishedAt))
    .limit(count + 1);

  const [featured, ...rest] = recent;
  return { featured: featured ?? null, rest };
}

export async function getArticleBySlug(slug: string) {
  const [row] = await db.select().from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, "published"))).limit(1);
  return row ?? null;
}

export async function getActiveChapters() {
  return db.select().from(chapters).orderBy(asc(chapters.name));
}

export async function getChapterBySlug(slug: string) {
  const [row] = await db.select().from(chapters).where(eq(chapters.slug, slug)).limit(1);
  return row ?? null;
}

export async function getUpcomingEvents(limit = 20) {
  return db.select().from(events)
    .where(and(eq(events.status, "published"), eq(events.isPublic, true), gte(events.startsAt, new Date())))
    .orderBy(asc(events.startsAt)).limit(limit);
}

export async function getEventBySlug(slug: string) {
  const [row] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return row ?? null;
}

export async function getResources() {
  return db.select().from(resources)
    .where(eq(resources.status, "published"))
    .orderBy(asc(resources.sortOrder), asc(resources.title));
}

export async function getPage(slug: string) {
  const [row] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return row ?? null;
}

export async function getSponsors() {
  return db.select().from(sponsors).where(eq(sponsors.active, true))
    .orderBy(asc(sponsors.sortOrder), asc(sponsors.name));
}

export async function getProducts() {
  return db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.name));
}

export async function getMembershipTiers() {
  return db.select().from(membershipTiers).where(eq(membershipTiers.active, true))
    .orderBy(asc(membershipTiers.sortOrder));
}

/** Approved, public intentions only — first names, as agreed. */
export async function getPublicPrayerRequests(limit = 20) {
  return db.select({
    id: prayerRequests.id,
    displayName: prayerRequests.displayName,
    intention: prayerRequests.intention,
    createdAt: prayerRequests.createdAt,
    pledges: count(prayerPledges.id),
  })
    .from(prayerRequests)
    .leftJoin(prayerPledges, eq(prayerPledges.requestId, prayerRequests.id))
    .where(and(eq(prayerRequests.status, "approved"), eq(prayerRequests.isPublic, true)))
    .groupBy(prayerRequests.id)
    .orderBy(desc(prayerRequests.createdAt))
    .limit(limit);
}

/* ----------------------------- member portal ---------------------------- */

/** Directory shows only members who opted in. City-level location only. */
export async function getDirectory() {
  return db.select({
    id: users.id, name: users.name, aviationRole: users.aviationRole,
    city: users.city, region: users.region, country: users.country,
    chapterName: chapters.name,
  })
    .from(users)
    .leftJoin(chapters, eq(users.chapterId, chapters.id))
    .where(eq(users.showInDirectory, true))
    .orderBy(asc(users.name));
}

export async function getChapterMembers(chapterId: number) {
  return db.select({ id: users.id, name: users.name, aviationRole: users.aviationRole })
    .from(users)
    .where(and(eq(users.chapterId, chapterId), eq(users.showInDirectory, true)))
    .orderBy(asc(users.name));
}

export async function getMyRsvps(userId: number) {
  return db.select({ event: events, status: eventRsvps.status })
    .from(eventRsvps)
    .innerJoin(events, eq(eventRsvps.eventId, events.id))
    .where(eq(eventRsvps.userId, userId))
    .orderBy(asc(events.startsAt));
}

export async function getMyDonations(userId: number) {
  return db.select().from(donations)
    .where(eq(donations.userId, userId)).orderBy(desc(donations.createdAt));
}

export async function getMentors() {
  return db.select({
    id: mentorshipProfiles.id, role: mentorshipProfiles.role,
    specialty: mentorshipProfiles.specialty, note: mentorshipProfiles.note,
    name: users.name, aviationRole: users.aviationRole,
  })
    .from(mentorshipProfiles)
    .innerJoin(users, eq(mentorshipProfiles.userId, users.id))
    .where(eq(mentorshipProfiles.active, true));
}

/* --------------------------------- admin -------------------------------- */

export async function adminStats() {
  const [[u], [c], [e], [p]] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(chapters),
    db.select({ n: count() }).from(events),
    db.select({ n: count() }).from(prayerRequests).where(eq(prayerRequests.status, "pending")),
  ]);
  return { members: u.n, chapters: c.n, events: e.n, pendingPrayers: p.n };
}

export async function adminListMembers() {
  return db.select({
    id: users.id, name: users.name, email: users.email, role: users.role,
    membershipStatus: users.membershipStatus, createdAt: users.createdAt,
    chapterName: chapters.name,
  })
    .from(users)
    .leftJoin(chapters, eq(users.chapterId, chapters.id))
    .orderBy(desc(users.createdAt));
}

export async function adminPendingPrayers() {
  return db.select().from(prayerRequests)
    .where(eq(prayerRequests.status, "pending"))
    .orderBy(desc(prayerRequests.createdAt));
}

export async function adminListArticles() {
  return db.select().from(articles).orderBy(desc(articles.createdAt));
}

export async function adminListEvents() {
  return db.select().from(events).orderBy(desc(events.startsAt));
}

export async function adminDonationTotals() {
  const [row] = await db.select({
    total: sql<number>`coalesce(sum(${donations.amountCents}), 0)`,
    n: count(),
  }).from(donations).where(eq(donations.status, "paid"));
  return row;
}
