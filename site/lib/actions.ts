"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, prayerRequests, prayerPledges, eventRsvps, donations,
  chapters, events, articles, images, pages, resources, products, sponsors,
  newsletterSubscribers, newsletterIssues, newsletterIssueArticles,
} from "./schema";
import { sanitizeRichText } from "./richtext";
import { sendBroadcast } from "./email";
import { renderIssueHtml } from "./newsletter-html";
import { getIssueArticles, getActiveSubscribers } from "./queries";
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
    locationSlug: String(form.get("locationSlug") ?? ""),
    tierSlug: String(form.get("tier") ?? ""),
  });

  if (!result.ok) return { error: result.error };

  /*
   * Only when they asked. The checkbox is unticked by default and nothing
   * here infers consent from the act of joining.
   */
  if (form.get("newsletterConsent") === "on") {
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    await db.insert(newsletterSubscribers).values({
      email,
      name: String(form.get("name") ?? "").trim() || null,
      userId: result.userId,
      token: randomBytes(24).toString("base64url"),
      source: "joined CAA",
      status: "subscribed",
    }).onConflictDoNothing();
  }

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


/* -------------------------------------------------------------------------- */
/* newsletter                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Adds an address to the newsletter list.
 *
 * Re-subscribing someone who previously left is allowed and simply sets
 * them back to subscribed; the alternative is telling a person they may
 * not have what they just asked for.
 *
 * The same reply comes back whether or not the address was already on the
 * list, so the form cannot be used to find out who is subscribed.
 */
export async function subscribeAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim() || null;

  if (!email.includes("@") || email.length < 5) {
    return { error: "Enter a valid email address.", values: submitted(form) };
  }
  // Consent is the point of the checkbox; without it there is nothing to do.
  if (form.get("consent") !== "on") {
    return {
      error: "Tick the box to confirm you want CAA to write to you.",
      values: submitted(form),
    };
  }

  const existing = await db.select({ id: newsletterSubscribers.id })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);

  if (existing.length > 0) {
    await db.update(newsletterSubscribers)
      .set({ status: "subscribed", unsubscribedAt: null, name })
      .where(eq(newsletterSubscribers.id, existing[0].id));
  } else {
    await db.insert(newsletterSubscribers).values({
      email,
      name,
      token: randomBytes(24).toString("base64url"),
      source: String(form.get("source") ?? "website"),
      status: "subscribed",
    });
  }

  return { ok: "You are on the list. Every issue carries a link to leave it." };
}

/**
 * Removes an address, by the secret in its own unsubscribe link.
 *
 * No sign-in, no confirmation step: someone who wants out should get out
 * on one click, which is what the one-click header in every issue
 * promises.
 */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!token || token.length < 16) return false;

  const result = await db.update(newsletterSubscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.token, token))
    .returning({ id: newsletterSubscribers.id });

  return result.length > 0;
}

/** A member turning the newsletter on or off from their profile. */
export async function setNewsletterConsentAction(consent: boolean): Promise<void> {
  const user = await requireUser();

  const existing = await db.select({ id: newsletterSubscribers.id })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, user.email))
    .limit(1);

  if (consent) {
    if (existing.length > 0) {
      await db.update(newsletterSubscribers)
        .set({ status: "subscribed", unsubscribedAt: null, userId: user.id })
        .where(eq(newsletterSubscribers.id, existing[0].id));
    } else {
      await db.insert(newsletterSubscribers).values({
        email: user.email,
        name: user.name,
        userId: user.id,
        token: randomBytes(24).toString("base64url"),
        source: "member profile",
        status: "subscribed",
      });
    }
  } else if (existing.length > 0) {
    await db.update(newsletterSubscribers)
      .set({ status: "unsubscribed", unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.id, existing[0].id));
  }

  revalidatePath("/portal/profile");
}

/* ----------------------------- newsletter: admin ------------------------- */

export async function saveIssueAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const id = Number(form.get("id") ?? 0) || null;
  const title = String(form.get("title") ?? "").trim();
  const slug = slugify(String(form.get("slug") ?? "") || title);
  const status = String(form.get("status") ?? "draft") as "draft" | "published" | "sent";

  if (!title) return { error: "Give the issue a title.", values: submitted(form) };
  if (!slug) {
    return { error: "That title does not make a usable web address. Set one by hand.", values: submitted(form) };
  }

  const clash = await db.select({ id: newsletterIssues.id }).from(newsletterIssues)
    .where(eq(newsletterIssues.slug, slug)).limit(1);
  if (clash.length > 0 && clash[0].id !== id) {
    return { error: `Another issue already uses the address "${slug}".`, values: submitted(form) };
  }

  const intro = sanitizeRichText(String(form.get("intro") ?? ""));
  // Checkbox names carry the article id; their order comes from the number
  // beside each one.
  const chosen: { articleId: number; sortOrder: number }[] = [];
  for (const [key, value] of form.entries()) {
    if (!key.startsWith("article-")) continue;
    if (value !== "on") continue;
    const articleId = Number(key.slice("article-".length));
    if (!Number.isInteger(articleId)) continue;
    const order = Number(form.get(`order-${articleId}`) ?? 0);
    chosen.push({ articleId, sortOrder: Number.isFinite(order) ? order : 0 });
  }

  if (chosen.length === 0) {
    return { error: "Choose at least one article for the issue.", values: submitted(form) };
  }

  let issueId = id;

  if (issueId) {
    const [existing] = await db.select({ publishedAt: newsletterIssues.publishedAt })
      .from(newsletterIssues).where(eq(newsletterIssues.id, issueId)).limit(1);
    await db.update(newsletterIssues).set({
      slug, title, intro: intro === "<p></p>" ? null : intro, status,
      publishedAt:
        status === "draft"
          ? existing?.publishedAt ?? null
          : existing?.publishedAt ?? new Date(),
    }).where(eq(newsletterIssues.id, issueId));
  } else {
    const [created] = await db.insert(newsletterIssues).values({
      slug, title, intro: intro === "<p></p>" ? null : intro, status,
      publishedAt: status === "draft" ? null : new Date(),
    }).returning({ id: newsletterIssues.id });
    issueId = created.id;
  }

  // Replace the contents wholesale: simpler than reconciling, and an issue
  // is small.
  await db.delete(newsletterIssueArticles).where(eq(newsletterIssueArticles.issueId, issueId));
  await db.insert(newsletterIssueArticles).values(
    chosen
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c, index) => ({ issueId: issueId!, articleId: c.articleId, sortOrder: index })),
  );

  revalidatePath("/admin/newsletter");
  revalidatePath("/newsletter");
  redirect("/admin/newsletter?saved=1");
}

export async function deleteIssueAction(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(newsletterIssues).where(eq(newsletterIssues.id, id));
  revalidatePath("/admin/newsletter");
  revalidatePath("/newsletter");
}

/**
 * Sends an issue to everyone on the list.
 *
 * Refuses to send twice. An issue that has gone out is marked sent, and
 * the guard is here rather than only in the interface because a second
 * copy of the same newsletter is the kind of mistake that costs
 * subscribers.
 */
export async function sendIssueAction(id: number): Promise<void> {
  await requireAdmin();

  const issue = await db.select().from(newsletterIssues)
    .where(eq(newsletterIssues.id, id)).limit(1);
  if (issue.length === 0) return;
  if (issue[0].sentAt) return;

  const [items, recipients] = await Promise.all([
    getIssueArticles(id),
    getActiveSubscribers(),
  ]);

  if (items.length === 0 || recipients.length === 0) return;

  const result = await sendBroadcast({
    subject: issue[0].title,
    recipients,
    html: (unsubscribe) =>
      renderIssueHtml({
        title: issue[0].title,
        introHtml: issue[0].intro ?? "",
        articles: items,
        unsubscribe,
      }),
  });

  // A skipped send means no mail provider is configured. Nothing is marked
  // as sent, so it can go out properly once one is.
  if (result.skipped) return;

  await db.update(newsletterIssues).set({
    status: "sent",
    sentAt: new Date(),
    recipientCount: result.sent,
    publishedAt: issue[0].publishedAt ?? new Date(),
  }).where(eq(newsletterIssues.id, id));

  revalidatePath("/admin/newsletter");
  revalidatePath("/newsletter");
}

/* ------------------------------ admin: resources ------------------------- */

export async function saveResourceAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const id = Number(form.get("id") ?? 0) || null;
  const title = String(form.get("title") ?? "").trim();
  const slug = slugify(String(form.get("slug") ?? "") || title);
  const category = String(form.get("category") ?? "").trim();

  if (!title) return { error: "Give the resource a title.", values: submitted(form) };
  if (!category) return { error: "Give it a category, so it groups with its kind.", values: submitted(form) };
  if (!slug) {
    return { error: "That title does not make a usable web address. Set one by hand.", values: submitted(form) };
  }

  const clash = await db.select({ id: resources.id }).from(resources)
    .where(eq(resources.slug, slug)).limit(1);
  if (clash.length > 0 && clash[0].id !== id) {
    return { error: `Another resource already uses the address "${slug}".`, values: submitted(form) };
  }

  const body = sanitizeRichText(String(form.get("body") ?? ""));

  const values = {
    slug,
    title,
    category,
    summary: String(form.get("summary") ?? "").trim() || null,
    body: body === "<p></p>" ? null : body,
    sortOrder: Number(form.get("sortOrder") ?? 0) || 0,
    status: String(form.get("status") ?? "draft") as "draft" | "published" | "archived",
  };

  if (id) await db.update(resources).set(values).where(eq(resources.id, id));
  else await db.insert(resources).values(values);

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  redirect("/admin/resources?saved=1");
}

export async function deleteResourceAction(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(resources).where(eq(resources.id, id));
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

/* ------------------------- admin: products & partners -------------------- */

export async function saveProductAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const id = Number(form.get("id") ?? 0) || null;
  const name = String(form.get("name") ?? "").trim();
  const slug = slugify(String(form.get("slug") ?? "") || name);
  const dollars = Number(form.get("price") ?? NaN);

  if (!name) return { error: "Give the item a name.", values: submitted(form) };
  if (!slug) return { error: "That name does not make a usable web address.", values: submitted(form) };
  if (!Number.isFinite(dollars) || dollars < 0) {
    return { error: "Give a price, in dollars.", values: submitted(form) };
  }

  const clash = await db.select({ id: products.id }).from(products)
    .where(eq(products.slug, slug)).limit(1);
  if (clash.length > 0 && clash[0].id !== id) {
    return { error: `Another item already uses the address "${slug}".`, values: submitted(form) };
  }

  const values = {
    slug,
    name,
    description: String(form.get("description") ?? "").trim() || null,
    // Money is stored in integer cents, never a float.
    priceCents: Math.round(dollars * 100),
    imagePath: String(form.get("imagePath") ?? "").trim() || null,
    imageAlt: String(form.get("imageAlt") ?? "").trim() || null,
    photoBrief: String(form.get("photoBrief") ?? "").trim() || null,
    printfulProductId: String(form.get("printfulProductId") ?? "").trim() || null,
    sortOrder: Number(form.get("sortOrder") ?? 0) || 0,
    active: form.get("active") === "on",
  };

  if (id) await db.update(products).set(values).where(eq(products.id, id));
  else await db.insert(products).values(values);

  revalidatePath("/admin/store");
  revalidatePath("/participate/store");
  redirect("/admin/store?saved=1");
}

export async function deleteProductAction(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/store");
  revalidatePath("/participate/store");
}

export async function savePartnerAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const id = Number(form.get("id") ?? 0) || null;
  const name = String(form.get("name") ?? "").trim();
  if (!name) return { error: "Give the partner a name.", values: submitted(form) };

  const url = String(form.get("url") ?? "").trim();
  if (url && !/^https?:\/\//i.test(url)) {
    return { error: "A web address needs to start with http:// or https://", values: submitted(form) };
  }

  const values = {
    name,
    url: url || null,
    blurb: String(form.get("blurb") ?? "").trim() || null,
    memberOffer: String(form.get("memberOffer") ?? "").trim() || null,
    tier: String(form.get("tier") ?? "friend") as "friend" | "partner" | "supporter",
    sortOrder: Number(form.get("sortOrder") ?? 0) || 0,
    active: form.get("active") === "on",
  };

  if (id) await db.update(sponsors).set(values).where(eq(sponsors.id, id));
  else await db.insert(sponsors).values(values);

  revalidatePath("/admin/partners");
  revalidatePath("/sponsors");
  redirect("/admin/partners?saved=1");
}

export async function deletePartnerAction(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(sponsors).where(eq(sponsors.id, id));
  revalidatePath("/admin/partners");
  revalidatePath("/sponsors");
}
