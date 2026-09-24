"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, prayerRequests, prayerPledges, eventRsvps, donations,
  chapters, events, articles, images, pages,
} from "./schema";
import { sanitizeRichText } from "./richtext";
import { findEditablePage } from "../content/editable-pages";
import { findMemberLocation } from "../content/member-locations";
import {
  authenticate, createSession, destroySession, registerUser,
  currentUser, requireUser, requireAdmin,
} from "./auth";

export type FormState = {
  error?: string;
  ok?: string;
  /**
   * What was submitted, echoed back on failure.
   *
   * React resets an uncontrolled form once its action returns, so without
   * this a rejected save empties every field. Losing a long article to a
   * duplicate web address is the kind of thing that stops people trusting
   * the tool, so every validation failure hands the work back.
   */
  values?: Record<string, string>;
};

/** Everything the form submitted, minus uploaded files. */
function submitted(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

/**
 * Turns a title into a web address. Administrators can override it, but
 * they should never have to invent one.
 */
function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/* --------------------------------- auth --------------------------------- */

export async function signInAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  const user = await authenticate(email, password);
  if (!user) return { error: "Those details did not match an account." };

  await createSession(user.id);
  redirect("/portal");
}

export async function registerAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = await registerUser({
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
    name: String(form.get("name") ?? ""),
    aviationRole: String(form.get("aviationRole") ?? ""),
    city: String(form.get("city") ?? ""),
    country: String(form.get("country") ?? ""),
  });

  if (!result.ok) return { error: result.error };

  await createSession(result.userId);
  redirect("/portal");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

/* ------------------------------- profile -------------------------------- */

export async function updateProfileAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { error: "Sign in first." };

  const chapterRaw = String(form.get("chapterId") ?? "");

  const DESIGNATIONS = ["none", "clergy", "religious", "student"] as const;
  const claimed = String(form.get("designation") ?? "none");
  const designation = (DESIGNATIONS as readonly string[]).includes(claimed)
    ? (claimed as (typeof DESIGNATIONS)[number])
    : "none";

  await db.update(users).set({
    name: String(form.get("name") ?? user.name).trim() || user.name,
    aviationRole: String(form.get("aviationRole") ?? "").trim() || null,
    /*
     * Only a slug from the published list is accepted. Anything else is
     * stored as no location rather than trusted, so the column cannot end
     * up holding a typed-in address.
     */
    locationSlug: findMemberLocation(String(form.get("locationSlug") ?? "")) ? String(form.get("locationSlug")) : null,
    /*
     * A member can say they are clergy, religious or a student. Claiming
     * it does not confirm it: the verified flag is staff-only, and changing
     * the claim clears it so a confirmed designation cannot be swapped for
     * an unconfirmed one while keeping the tick.
     */
    designation,
    designationVerified: designation === user.designation ? user.designationVerified : false,
    chapterId: chapterRaw ? Number(chapterRaw) : null,
    // Opt-in only: members are not listed in the directory unless they say so.
    showInDirectory: form.get("showInDirectory") === "on",
  }).where(eq(users.id, user.id));

  revalidatePath("/portal/profile");
  revalidatePath("/portal/directory");
  return { ok: "Saved." };
}

/* ------------------------------- prayer --------------------------------- */

export async function submitPrayerAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser();
  const intention = String(form.get("intention") ?? "").trim();
  if (intention.length < 4) return { error: "Write the intention first." };

  // First name only on public surfaces.
  const displayName =
    String(form.get("displayName") ?? "").trim() ||
    user?.name.split(" ")[0] ||
    "Anonymous";

  await db.insert(prayerRequests).values({
    userId: user?.id ?? null,
    displayName,
    intention,
    isPublic: form.get("isPublic") === "on",
    // Everything is reviewed before it appears publicly.
    status: "pending",
  });

  revalidatePath("/portal/prayer");
  return { ok: "Sent for review. It appears once a moderator approves it." };
}

export async function pledgePrayerAction(requestId: number): Promise<void> {
  const user = await requireUser();
  await db.insert(prayerPledges)
    .values({ requestId, userId: user.id })
    .onConflictDoNothing();
  revalidatePath("/portal/prayer");
  revalidatePath("/");
}

/* -------------------------------- events -------------------------------- */

export async function rsvpAction(eventId: number, status: "going" | "interested" | "declined"): Promise<void> {
  const user = await requireUser();
  await db.insert(eventRsvps)
    .values({ eventId, userId: user.id, status })
    .onConflictDoUpdate({ target: [eventRsvps.eventId, eventRsvps.userId], set: { status } });
  revalidatePath("/portal/events");
  revalidatePath("/events");
}

/* -------------------------------- giving -------------------------------- */

/**
 * Records an intent to give. It does not move money.
 *
 * CAA already has a contract with a payment processor separate from
 * eCatholic, and we do not have those account details yet, so nothing here
 * pretends to charge a card. The row is stored as `pending` with an empty
 * processorRef, ready to be reconciled once the processor is wired in.
 */
export async function recordDonationIntentAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser();
  const dollars = Number(String(form.get("amount") ?? "0"));

  if (!Number.isFinite(dollars) || dollars <= 0) {
    return { error: "Enter an amount." };
  }

  await db.insert(donations).values({
    userId: user?.id ?? null,
    donorName: String(form.get("donorName") ?? "").trim() || user?.name || null,
    donorEmail: String(form.get("donorEmail") ?? "").trim() || user?.email || null,
    amountCents: Math.round(dollars * 100),
    kind: (String(form.get("kind") ?? "gift") as "gift" | "dues" | "scholarship" | "chapter_support"),
    status: "pending",
    note: String(form.get("note") ?? "").trim() || null,
  });

  revalidatePath("/portal/giving");
  return {
    ok: "Recorded. Payment processing is not connected yet, so nothing has been charged.",
  };
}

/* -------------------------------- admin --------------------------------- */

export async function moderatePrayerAction(id: number, decision: "approved" | "rejected"): Promise<void> {
  await requireAdmin();
  await db.update(prayerRequests).set({ status: decision }).where(eq(prayerRequests.id, id));
  revalidatePath("/admin/prayer");
  revalidatePath("/");
}

const ROLES = ["member", "chapter_leader", "admin"] as const;
const MEMBERSHIP_STATUSES = ["registered", "active", "lapsed", "honorary"] as const;

type Role = (typeof ROLES)[number];
type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

/**
 * Both of these read the new value out of the submitted form rather than
 * taking it bound in the URL, so one select and one button replace a row
 * of buttons per account.
 */
export async function setMemberRoleAction(userId: number, form: FormData): Promise<void> {
  await requireAdmin();
  const role = String(form.get("role") ?? "");
  if (!ROLES.includes(role as Role)) return;
  await db.update(users).set({ role: role as Role }).where(eq(users.id, userId));
  revalidatePath("/admin/members");
}

export async function setMembershipStatusAction(userId: number, form: FormData): Promise<void> {
  await requireAdmin();
  const status = String(form.get("status") ?? "");
  if (!MEMBERSHIP_STATUSES.includes(status as MembershipStatus)) return;
  await db.update(users)
    .set({ membershipStatus: status as MembershipStatus })
    .where(eq(users.id, userId));
  revalidatePath("/admin/members");
}

/**
 * Parses a map coordinate. Blank means "no pin", which is a legitimate
 * state; anything unparseable or out of range is also treated as no pin
 * rather than being written through to put a chapter in the sea.
 */
function coord(raw: FormDataEntryValue | null, limit: number): number | null {
  const text = String(raw ?? "").trim();
  if (!text) return null;
  const n = Number(text);
  if (!Number.isFinite(n) || Math.abs(n) > limit) return null;
  return n;
}

export async function saveChapterAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const id = Number(form.get("id") ?? 0) || null;
  const name = String(form.get("name") ?? "").trim();
  const slug = slugify(String(form.get("slug") ?? "") || name);
  if (!name) return { error: "Give the chapter a name.", values: submitted(form) };
  if (!slug) return { error: "That name does not make a usable web address. Set one by hand.", values: submitted(form) };

  const clash = await db.select({ id: chapters.id }).from(chapters)
    .where(eq(chapters.slug, slug)).limit(1);
  if (clash.length > 0 && clash[0].id !== id) {
    return { error: `Another chapter already uses the address "${slug}".`, values: submitted(form) };
  }

  const latitude = coord(form.get("latitude"), 90);
  const longitude = coord(form.get("longitude"), 180);
  if ((latitude === null) !== (longitude === null)) {
    return { error: "Give both a latitude and a longitude, or neither.", values: submitted(form) };
  }

  const values = {
    slug,
    name,
    city: String(form.get("city") ?? "").trim() || null,
    region: String(form.get("region") ?? "").trim() || null,
    description: String(form.get("description") ?? "").trim() || null,
    meetingSchedule: String(form.get("meetingSchedule") ?? "").trim() || null,
    status: String(form.get("status") ?? "forming") as "forming" | "active" | "dormant",
    latitude,
    longitude,
  };

  if (id) await db.update(chapters).set(values).where(eq(chapters.id, id));
  else await db.insert(chapters).values(values);

  revalidatePath("/admin/chapters");
  revalidatePath("/chapters");
  redirect("/admin/chapters?saved=1");
}

/**
 * Removes a chapter. Members who belonged to it keep their accounts and
 * are simply left without a chapter, which the schema already allows for
 * members at large.
 */
export async function deleteChapterAction(id: number): Promise<void> {
  await requireAdmin();
  await db.update(users).set({ chapterId: null }).where(eq(users.chapterId, id));
  await db.delete(chapters).where(eq(chapters.id, id));
  revalidatePath("/admin/chapters");
  revalidatePath("/chapters");
}

/* -------------------------------------------------------------------------- */
/* admin: events                                                              */
/* -------------------------------------------------------------------------- */

export async function saveEventAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const id = Number(form.get("id") ?? 0) || null;
  const title = String(form.get("title") ?? "").trim();
  const slug = slugify(String(form.get("slug") ?? "") || title);
  const startsAtRaw = String(form.get("startsAt") ?? "").trim();

  if (!title) return { error: "Give the event a title.", values: submitted(form) };
  if (!slug) return { error: "That title does not make a usable web address. Set one by hand.", values: submitted(form) };
  if (!startsAtRaw) return { error: "An event needs a date and time.", values: submitted(form) };

  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) return { error: "That date could not be read.", values: submitted(form) };

  const clash = await db.select({ id: events.id }).from(events)
    .where(eq(events.slug, slug)).limit(1);
  if (clash.length > 0 && clash[0].id !== id) {
    return { error: `Another event already uses the address "${slug}".`, values: submitted(form) };
  }

  const chapterId = Number(form.get("chapterId") ?? 0) || null;

  const values = {
    slug,
    title,
    description: String(form.get("description") ?? "").trim() || null,
    location: String(form.get("location") ?? "").trim() || null,
    startsAt,
    chapterId,
    isPublic: form.get("isPublic") === "on",
    status: String(form.get("status") ?? "draft") as "draft" | "published" | "archived",
  };

  if (id) await db.update(events).set(values).where(eq(events.id, id));
  else await db.insert(events).values(values);

  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect("/admin/events?saved=1");
}

export async function deleteEventAction(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/admin/events");
  revalidatePath("/events");
}


/**
 * Marks one article as the homepage lead. Only one can hold it, so this
 * clears the flag everywhere else in the same breath. Passing the id of
 * the article that already leads clears it, and the homepage falls back to
 * the most recent published article.
 */
export async function setFeaturedArticleAction(id: number): Promise<void> {
  await requireAdmin();

  const [current] = await db.select({ isFeatured: articles.isFeatured })
    .from(articles).where(eq(articles.id, id)).limit(1);

  await db.update(articles).set({ isFeatured: false });
  if (!current?.isFeatured) {
    await db.update(articles).set({ isFeatured: true }).where(eq(articles.id, id));
  }

  revalidatePath("/admin/articles");
  revalidatePath("/");
}

export async function setArticleStatusAction(
  id: number,
  status: "draft" | "published" | "archived",
): Promise<void> {
  await requireAdmin();
  await db.update(articles).set({
    status,
    publishedAt: status === "published" ? new Date() : null,
  }).where(eq(articles.id, id));
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/");
}

export async function setEventStatusAction(
  id: number,
  status: "draft" | "published" | "archived",
): Promise<void> {
  await requireAdmin();
  await db.update(events).set({ status }).where(eq(events.id, id));
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

/* -------------------------------------------------------------------------- */
/* admin: images                                                              */
/* -------------------------------------------------------------------------- */

/** What the browser is allowed to send, and what the site will serve back. */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/**
 * Stores an uploaded image and returns the path to reference it by.
 *
 * Alt text is required rather than encouraged. An image with no alt text
 * is unusable to anyone on a screen reader, and "required at upload" is
 * the only point where that is cheap to enforce.
 */
export async function uploadImageAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState & { imagePath?: string }> {
  const user = await requireAdmin();

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Images must be JPEG, PNG, WebP or AVIF." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 8MB.` };
  }

  const alt = String(form.get("alt") ?? "").trim();
  if (!alt) {
    return { error: "Describe the photograph, so it works for anyone who cannot see it." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const [row] = await db.insert(images).values({
    filename: file.name,
    mimeType: file.type,
    byteSize: file.size,
    data: bytes,
    alt,
    credit: String(form.get("credit") ?? "").trim() || null,
    uploadedBy: user.id,
  }).returning({ id: images.id });

  return { ok: "Image uploaded.", imagePath: `/api/images/${row.id}` };
}

/* -------------------------------------------------------------------------- */
/* admin: articles                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Creates or updates an article.
 *
 * Publishing stamps publishedAt the first time only, so correcting a typo
 * on a published article does not shuffle it back to the top of the
 * index.
 */
export async function saveArticleAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const id = Number(form.get("id") ?? 0) || null;
  const title = String(form.get("title") ?? "").trim();
  // Whatever the editor produced is cleaned to the allowlist before it is
  // stored, so a paste from Word cannot bring fonts and tables with it.
  const body = sanitizeRichText(String(form.get("body") ?? ""));
  const slug = slugify(String(form.get("slug") ?? "") || title);
  const status = String(form.get("status") ?? "draft") as "draft" | "published" | "archived";

  if (!title) return { error: "Give the article a title.", values: submitted(form) };
  // An empty editor still emits "<p></p>".
  if (!body || body === "<p></p>") {
    return { error: "An article needs something in the body.", values: submitted(form) };
  }
  if (!slug) return { error: "That title does not make a usable web address. Set one by hand.", values: submitted(form) };

  const clash = await db.select({ id: articles.id }).from(articles)
    .where(eq(articles.slug, slug)).limit(1);
  if (clash.length > 0 && clash[0].id !== id) {
    return { error: `Another article already uses the address "${slug}".`, values: submitted(form) };
  }

  const values = {
    slug,
    title,
    body,
    excerpt: String(form.get("excerpt") ?? "").trim() || null,
    authorName: String(form.get("authorName") ?? "").trim() || null,
    imagePath: String(form.get("imagePath") ?? "").trim() || null,
    imageAlt: String(form.get("imageAlt") ?? "").trim() || null,
    imageCredit: String(form.get("imageCredit") ?? "").trim() || null,
    photoBrief: String(form.get("photoBrief") ?? "").trim() || null,
    status,
  };

  if (id) {
    const [existing] = await db.select({ publishedAt: articles.publishedAt })
      .from(articles).where(eq(articles.id, id)).limit(1);
    await db.update(articles).set({
      ...values,
      publishedAt:
        status === "published"
          ? existing?.publishedAt ?? new Date()
          : existing?.publishedAt ?? null,
    }).where(eq(articles.id, id));
  } else {
    await db.insert(articles).values({
      ...values,
      publishedAt: status === "published" ? new Date() : null,
    });
  }

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/");
  redirect("/admin/articles?saved=1");
}

export async function deleteArticleAction(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(articles).where(eq(articles.id, id));
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/");
}

/* -------------------------------------------------------------------------- */
/* admin: page copy                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Saves one block of editable page copy.
 *
 * The slug must be one the site actually reads, so a typo cannot create a
 * row that renders nowhere and leaves someone wondering why their edit did
 * not appear.
 */
export async function savePageAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const slug = String(form.get("slug") ?? "").trim();
  const known = findEditablePage(slug);
  if (!known) return { error: "That is not a page this site edits." };

  const body = sanitizeRichText(String(form.get("body") ?? ""));
  if (!body || body === "<p></p>") {
    return { error: "There is nothing to save.", values: submitted(form) };
  }

  const existing = await db.select({ id: pages.id }).from(pages)
    .where(eq(pages.slug, slug)).limit(1);

  if (existing.length > 0) {
    await db.update(pages).set({ body, updatedAt: new Date() }).where(eq(pages.slug, slug));
  } else {
    await db.insert(pages).values({ slug, title: known.title, body });
  }

  revalidatePath("/admin/pages");
  revalidatePath(`/${slug}`);
  redirect("/admin/pages?saved=1");
}

/**
 * Confirms or withdraws a member's designation.
 *
 * Anyone can say they are clergy; this is staff saying CAA has checked.
 * Until it is set, the claim is invisible to other members.
 */
export async function setDesignationVerifiedAction(
  userId: number,
  verified: boolean,
): Promise<void> {
  await requireAdmin();
  await db.update(users).set({ designationVerified: verified }).where(eq(users.id, userId));
  revalidatePath("/admin/members");
  revalidatePath("/portal/directory");
}
