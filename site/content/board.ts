/**
 * The Board of Directors, as listed on catholicaviation.org.
 *
 * Held in code rather than the database: a board changes rarely, and a
 * table plus an admin screen for four names would be machinery nobody
 * would use twice a year. Editing this file and deploying is the honest
 * cost. If it starts changing often, it belongs in the database.
 */
export type BoardMember = { name: string; role: string };

export const BOARD: BoardMember[] = [
  { name: "Tom Beckenbauer", role: "Chairman of the Board" },
  { name: "Terry Garrity", role: "President" },
  { name: "Ed Jozsa", role: "Chief Financial Officer" },
  { name: "Abe Khadivi", role: "Social Media Chairman" },
];
