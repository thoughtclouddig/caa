/**
 * Password hashing, kept separate from auth.ts so scripts that run outside
 * the Next runtime (seeding, migrations) can use it without pulling in
 * "server-only".
 */
import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
