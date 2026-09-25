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
import { prayerRequests, articles, newsletterSubscribers } from "../lib/schema";
import { eq, like } from "drizzle-orm";
import { randomBytes } from "crypto";

const DEMO_EMAIL_DOMAIN = "@demo.catholicaviation.invalid";

async function add() {
  await db.insert(prayerRequests).values([
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

  console.log("demo data added: 2 prayer intentions pending, 1 draft article, 3 subscribers");
}

async function clear() {
  await db.delete(newsletterSubscribers).where(like(newsletterSubscribers.email, `%${DEMO_EMAIL_DOMAIN}`));
  await db.delete(articles).where(like(articles.slug, "demo-%"));
  await db.delete(prayerRequests).where(eq(prayerRequests.status, "pending"));
  console.log("demo data cleared");
}

const mode = process.argv[2] === "clear" ? clear : add;
mode().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
