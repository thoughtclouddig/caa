import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, timingSafeEqual } from "crypto";
import { eq, and, gt, asc } from "drizzle-orm";
import { db } from "./db";
import { hashPassword, verifyPassword } from "./passwords";
import { users, sessions, membershipTiers, type User } from "./schema";
import { findMemberLocation } from "../content/member-locations";

const COOKIE = "caa_session";
const SESSION_DAYS = 30;

/* -------------------------------------------------------------------------- */
/* passwords                                                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* sessions                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Sessions are opaque random tokens stored server-side rather than signed
 * JWTs. That keeps revocation immediate: deleting the row ends the session,
 * which matters for an org that needs to be able to cut off access.
 */
function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createSession(userId: number): Promise<void> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({ id: token, userId, expiresAt });

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  jar.delete(COOKIE);
}

/** The signed-in user, or null. Safe to call from any server component. */
export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return rows[0]?.user ?? null;
}

/* -------------------------------------------------------------------------- */
/* guards                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Send anonymous visitors to sign in rather than throwing. A thrown error
 * surfaces as a 500; a redirect is what someone hitting a members-only page
 * should actually get.
 */
export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  // A signed-in member who is not staff belongs in the member area, not an error page.
  if (user.role !== "admin") redirect("/portal");
  return user;
}

export function isStaff(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "chapter_leader";
}

/* -------------------------------------------------------------------------- */
/* registration                                                               */
/* -------------------------------------------------------------------------- */

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  aviationRole?: string;
  /** A slug from content/member-locations.ts. Never an address. */
  locationSlug?: string;
  /** The membership level being taken out. Falls back to the free one. */
  tierSlug?: string;
};

export async function registerUser(
  input: RegisterInput,
): Promise<{ ok: true; userId: number } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();

  if (!email.includes("@")) return { ok: false, error: "Enter a valid email address." };
  if (input.password.length < 10) {
    return { ok: false, error: "Use a password of at least 10 characters." };
  }
  if (!input.name.trim()) return { ok: false, error: "Enter your name." };

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length) {
    return { ok: false, error: "An account with that email already exists." };
  }

  /*
   * The level they chose, or the free one. Looked up rather than
   * hardcoded, because the board can rename or re-price the tiers without
   * touching this.
   */
  const [freeTier] = await db
    .select({ id: membershipTiers.id })
    .from(membershipTiers)
    .where(eq(membershipTiers.amountCents, 0))
    .orderBy(asc(membershipTiers.sortOrder))
    .limit(1);

  let chosenTierId = freeTier?.id ?? null;
  if (input.tierSlug) {
    const [chosen] = await db
      .select({ id: membershipTiers.id })
      .from(membershipTiers)
      .where(eq(membershipTiers.slug, input.tierSlug))
      .limit(1);
    if (chosen) chosenTierId = chosen.id;
  }

  const [created] = await db
    .insert(users)
    .values({
      email,
      passwordHash: await hashPassword(input.password),
      name: input.name.trim(),
      aviationRole: input.aviationRole?.trim() || null,
      // Only a slug from the published list; anything else is no location.
      locationSlug: findMemberLocation(input.locationSlug ?? null)
        ? (input.locationSlug as string)
        : null,
      /*
       * Basic membership is free, so registering is joining. There is no
       * second step and nothing to pay, and the free tier is attached here
       * rather than left null so a new member is a member in the data as
       * well as on the page.
       */
      membershipStatus: "registered",
      membershipTierId: chosenTierId,
      memberSince: new Date(),
    })
    .returning({ id: users.id });

  return { ok: true, userId: created.id };
}

export async function authenticate(
  email: string,
  password: string,
): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);

  // Always run a comparison so a missing account and a wrong password take
  // a similar amount of time.
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
  const ok = await verifyPassword(password, hash);

  return user && ok ? user : null;
}

/** Constant-time compare for any future token checks. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export { hashPassword, verifyPassword };
