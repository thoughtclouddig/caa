/**
 * Database schema for the CAA site.
 *
 * Covers all three layers from the approved site map: the public site,
 * the member portal, and the admin tools.
 *
 * Money is stored in integer cents, never floats.
 * Nothing here assumes a membership price — pricing is still an open
 * decision, so tiers are named but amounts live in `membership_tiers`
 * and can be changed without a migration.
 */

import {
  customType,
  doublePrecision,
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* -------------------------------------------------------------------------- */
/* enums                                                                      */
/* -------------------------------------------------------------------------- */

export const userRole = pgEnum("user_role", [
  "member",
  "chapter_leader",
  "admin",
]);

/**
 * Basic membership is free, so "registered" and "active" describe the same
 * person: someone who joined. The distinction is kept because it costs
 * nothing and because a paid-membership decision could return.
 */
/**
 * Drizzle has no first-class bytea, so this maps Postgres bytea to Node
 * Buffer in both directions.
 */
const customBytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

/**
 * A state of life the association recognises, kept separate from giving.
 *
 * These were once free membership tiers, which made them look like a
 * discount on a fee. Membership is free for everyone now, so they are what
 * they always should have been: a mark of who someone is, carrying no
 * price and no privilege.
 *
 * PARKED FOR LAUNCH. Nothing reads or writes these columns. Publishing
 * "clergy" beside a member's name means CAA vouching for it, and members
 * will approach that person for sacramental and pastoral reasons, so what
 * counts as confirmation is a board decision rather than a code one. The
 * columns stay so the decision has somewhere to land. Until then a student
 * who wants to be found belongs in mentorship, as "seeking".
 */
export const memberDesignation = pgEnum("member_designation", [
  "none",
  "clergy",
  "religious",
  "student",
]);

export const membershipStatus = pgEnum("membership_status", [
  "registered", // joined; basic membership carries no dues
  "active",     // joined and giving at one of the support levels
  "lapsed",     // was giving, no longer
  "honorary",   // recognised by the board
]);

export const chapterStatus = pgEnum("chapter_status", [
  "forming",
  "active",
  "dormant",
]);

export const publishStatus = pgEnum("publish_status", [
  "draft",
  "published",
  "archived",
]);

export const moderationStatus = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
]);

export const rsvpStatus = pgEnum("rsvp_status", ["going", "interested", "declined"]);

export const mentorshipRole = pgEnum("mentorship_role", ["mentor", "seeking"]);

export const donationKind = pgEnum("donation_kind", [
  "dues",
  "gift",
  "scholarship",
  "chapter_support",
]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const sponsorTier = pgEnum("sponsor_tier", [
  "partner",
  "supporter",
  "friend",
]);

/* -------------------------------------------------------------------------- */
/* people                                                                     */
/* -------------------------------------------------------------------------- */

export const chapters = pgTable(
  "chapters",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    city: text("city"),
    region: text("region"),
    country: text("country").default("United States"),
    /** Public pages show city only; precise addresses stay in the portal. */
    description: text("description"),
    meetingSchedule: text("meeting_schedule"),
    status: chapterStatus("status").notNull().default("forming"),
    photoBrief: text("photo_brief"),
    /**
     * Where the pin sits on the chapter map. City centre is precise enough
     * and is all that goes on a public page; a chapter's actual meeting
     * address belongs in the portal. Stored as text so Postgres numeric
     * precision is not lost through the driver, and parsed at render.
     */
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("chapters_slug_idx").on(t.slug)],
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: userRole("role").notNull().default("member"),

    // aviation identity
    aviationRole: text("aviation_role"),

    // membership
    membershipStatus: membershipStatus("membership_status")
      .notNull()
      .default("registered"),
    membershipTierId: integer("membership_tier_id"),
    memberSince: timestamp("member_since", { withTimezone: true }),
    renewalDue: timestamp("renewal_due", { withTimezone: true }),

    chapterId: integer("chapter_id").references(() => chapters.id, {
      onDelete: "set null",
    }),

    /** Members opt in before appearing in the member directory. */
    showInDirectory: boolean("show_in_directory").notNull().default(false),

    /**
     * Which listed place a member said they are near. Chosen from a fixed
     * menu, never geocoded and never an address: enough to draw a map of
     * CAA's reach, not enough to find anybody. See
     * content/member-locations.ts.
     */
    locationSlug: text("location_slug"),

    designation: memberDesignation("designation").notNull().default("none"),
    /** Set by staff once a designation has been confirmed. */
    designationVerified: boolean("designation_verified").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    index("users_chapter_idx").on(t.chapterId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/**
 * Tiers are data, not code, because pricing is unresolved. Amount may be
 * null for tiers that are free by policy (clergy, religious, students).
 */
/**
 * Membership levels.
 *
 * Basic membership is free. Everything above it is voluntary support, so
 * these are giving levels rather than gates: nothing on the site is held
 * back from a member who gives nothing.
 *
 * Amounts live here rather than in code so the board can change them
 * without a release.
 */
export const membershipTiers = pgTable("membership_tiers", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  /** Integer cents. Zero means free; null means no fixed amount. */
  amountCents: integer("amount_cents"),
  /** How often it is given: "none" for free, "annual", or "once". */
  cadence: text("cadence").notNull().default("annual"),
  requiresVerification: boolean("requires_verification").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

/* -------------------------------------------------------------------------- */
/* community                                                                  */
/* -------------------------------------------------------------------------- */

export const prayerRequests = pgTable(
  "prayer_requests",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    /** First name only on public surfaces. */
    displayName: text("display_name").notNull(),
    intention: text("intention").notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    status: moderationStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("prayer_status_idx").on(t.status)],
);

export const prayerPledges = pgTable(
  "prayer_pledges",
  {
    id: serial("id").primaryKey(),
    requestId: integer("request_id")
      .notNull()
      .references(() => prayerRequests.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("pledge_unique_idx").on(t.requestId, t.userId)],
);

export const mentorshipProfiles = pgTable("mentorship_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: mentorshipRole("role").notNull(),
  specialty: text("specialty"),
  note: text("note"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* -------------------------------------------------------------------------- */
/* events                                                                     */
/* -------------------------------------------------------------------------- */

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    location: text("location"),
    chapterId: integer("chapter_id").references(() => chapters.id, {
      onDelete: "set null",
    }),
    isPublic: boolean("is_public").notNull().default(true),
    status: publishStatus("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("events_slug_idx").on(t.slug), index("events_start_idx").on(t.startsAt)],
);

export const eventRsvps = pgTable(
  "event_rsvps",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: rsvpStatus("status").notNull().default("going"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("rsvp_unique_idx").on(t.eventId, t.userId)],
);

/* -------------------------------------------------------------------------- */
/* content                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Articles. CAA's blog: chapter news, member articles, and the association's
 * own announcements. Called "articles" throughout, in the site navigation
 * and here.
 */
export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    body: text("body").notNull(),
    authorName: text("author_name"),
    /**
     * Lead image. `imagePath` is a path under /public once CAA has supplied
     * the photograph; until then `photoBrief` describes what is needed and
     * the layout renders a brief in its place. Credit lines matter here:
     * CAA's photographs are taken by members and are credited by name.
     */
    imagePath: text("image_path"),
    imageAlt: text("image_alt"),
    imageCredit: text("image_credit"),
    photoBrief: text("photo_brief"),
    /**
     * The one article carried large on the homepage and at the top of the
     * articles index. Staff set it in admin; if none is set, the most
     * recent published article is used, so the lead is never empty.
     */
    isFeatured: boolean("is_featured").notNull().default(false),
    status: publishStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("articles_slug_idx").on(t.slug)],
);

/**
 * Uploaded images.
 *
 * Bytes live in Postgres rather than on disk. A Replit deployment runs on
 * an ephemeral filesystem, so anything written next to the app disappears
 * on the next deploy, and an image an administrator uploaded in October
 * would quietly vanish in November. The database is the one place on this
 * stack that persists, and it needs no account with anybody.
 *
 * At a few hundred kilobytes each this stays small for a long time. If CAA
 * ever outgrows it, the swap is a storage service behind the same
 * /api/images/:id URL, and nothing that references an image changes.
 */
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  data: customBytea("data").notNull(),
  /** Written by whoever uploads it. Required before an image can be used. */
  alt: text("alt"),
  /** CAA's photographs are taken by members and are credited by name. */
  credit: text("credit"),
  uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Resources section: formation and educational material, kept on CAA's own pages. */
export const resources = pgTable(
  "resources",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    summary: text("summary"),
    body: text("body"),
    status: publishStatus("status").notNull().default("published"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("resources_slug_idx").on(t.slug)],
);

/** Editable copy for otherwise-static pages, so staff can change it without a deploy. */
export const pages = pgTable(
  "pages",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("pages_slug_idx").on(t.slug)],
);

/* -------------------------------------------------------------------------- */
/* giving and store                                                           */
/* -------------------------------------------------------------------------- */

export const donations = pgTable(
  "donations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    donorName: text("donor_name"),
    donorEmail: text("donor_email"),
    amountCents: integer("amount_cents").notNull(),
    kind: donationKind("kind").notNull().default("gift"),
    status: paymentStatus("status").notNull().default("pending"),
    /**
     * Reference from whichever processor CAA uses. Left blank until the
     * processor account details are available.
     */
    processorRef: text("processor_ref"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("donations_user_idx").on(t.userId)],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    photoBrief: text("photo_brief"),
    active: boolean("active").notNull().default(true),
  },
  (t) => [uniqueIndex("products_slug_idx").on(t.slug)],
);

export const sponsors = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tier: sponsorTier("tier").notNull().default("friend"),
  url: text("url"),
  blurb: text("blurb"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* -------------------------------------------------------------------------- */
/* relations                                                                  */
/* -------------------------------------------------------------------------- */

export const usersRelations = relations(users, ({ one, many }) => ({
  chapter: one(chapters, { fields: [users.chapterId], references: [chapters.id] }),
  prayerRequests: many(prayerRequests),
  rsvps: many(eventRsvps),
  donations: many(donations),
}));

export const chaptersRelations = relations(chapters, ({ many }) => ({
  members: many(users),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  chapter: one(chapters, { fields: [events.chapterId], references: [chapters.id] }),
  rsvps: many(eventRsvps),
}));

export const prayerRequestsRelations = relations(prayerRequests, ({ one, many }) => ({
  user: one(users, { fields: [prayerRequests.userId], references: [users.id] }),
  pledges: many(prayerPledges),
}));

export type User = typeof users.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type EventRow = typeof events.$inferSelect;
export type PrayerRequest = typeof prayerRequests.$inferSelect;
