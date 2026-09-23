"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, prayerRequests, prayerPledges, eventRsvps, donations,
  chapters, events, articles,
} from "./schema";
import {
  authenticate, createSession, destroySession, registerUser,
  currentUser, requireUser, requireAdmin,
} from "./auth";

export type FormState = { error?: string; ok?: string };

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

  await db.update(users).set({
    name: String(form.get("name") ?? user.name).trim() || user.name,
    aviationRole: String(form.get("aviationRole") ?? "").trim() || null,
    city: String(form.get("city") ?? "").trim() || null,
    region: String(form.get("region") ?? "").trim() || null,
    country: String(form.get("country") ?? "").trim() || null,
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

export async function setMemberRoleAction(userId: number, role: "member" | "chapter_leader" | "admin"): Promise<void> {
  await requireAdmin();
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/admin/members");
}

export async function setMembershipStatusAction(
  userId: number,
  status: "registered" | "active" | "lapsed" | "honorary",
): Promise<void> {
  await requireAdmin();
  await db.update(users).set({ membershipStatus: status }).where(eq(users.id, userId));
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

export async function upsertChapterAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const values = {
    slug: String(form.get("slug") ?? "").trim(),
    name: String(form.get("name") ?? "").trim(),
    city: String(form.get("city") ?? "").trim() || null,
    region: String(form.get("region") ?? "").trim() || null,
    description: String(form.get("description") ?? "").trim() || null,
    meetingSchedule: String(form.get("meetingSchedule") ?? "").trim() || null,
    status: String(form.get("status") ?? "forming") as "forming" | "active" | "dormant",
    latitude: coord(form.get("latitude"), 90),
    longitude: coord(form.get("longitude"), 180),
  };
  if (!values.slug || !values.name) return { error: "Name and slug are required." };
  if (
    (values.latitude === null) !== (values.longitude === null)
  ) {
    return { error: "Give both a latitude and a longitude, or neither." };
  }

  if (id) await db.update(chapters).set(values).where(eq(chapters.id, Number(id)));
  else await db.insert(chapters).values(values);

  revalidatePath("/admin/chapters");
  revalidatePath("/chapters");
  return { ok: "Saved." };
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
