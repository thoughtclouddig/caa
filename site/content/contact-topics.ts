/**
 * What a contact message can be about.
 *
 * Here rather than in lib/actions.ts because that file is "use server",
 * which may only export async functions. The action validates against
 * this list, and the form renders it, so the two cannot drift.
 */
export const CONTACT_TOPICS = [
  "Joining CAA",
  "Finding or starting a chapter",
  "Mentorship",
  "Corporate partnership",
  "Giving",
  "Something else",
] as const;
