/**
 * Human labels for the database enums.
 *
 * Enum values are written for the schema, not for a member: "registered",
 * "chapter_leader", "going". Rendering them raw put lower-case machine
 * words in front of people, so everything shown to a member or to staff
 * comes through here.
 */

export const MEMBERSHIP_STATUS: Record<string, string> = {
  registered: "Member",
  active: "Member and giving",
  lapsed: "Gave previously",
  honorary: "Honorary member",
};

export const ROLE: Record<string, string> = {
  member: "Member",
  chapter_leader: "Chapter leader",
  admin: "Administrator",
};

export const RSVP_STATUS: Record<string, string> = {
  going: "Going",
  interested: "Interested",
  cancelled: "Cancelled",
};

export const DESIGNATION: Record<string, string> = {
  none: "—",
  clergy: "Clergy",
  religious: "Religious",
  student: "Student",
};

export const PAYMENT_STATUS: Record<string, string> = {
  pending: "Not charged",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

export const DONATION_KIND: Record<string, string> = {
  gift: "Wherever needed most",
  chapter_support: "Chapter support",
  scholarship: "Scholarship fund",
  dues: "Membership",
};

/** Falls back to the raw value rather than rendering nothing. */
export function label(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return "—";
  return map[value] ?? value;
}
