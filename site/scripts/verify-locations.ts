/**
 * Checks every listed member location against the map it will be drawn on.
 *
 * Run with: npx tsx scripts/verify-locations.ts
 *
 * Coordinates typed by hand are easy to get subtly wrong: a transposed
 * digit or a dropped minus sign puts a member in the Gulf of Mexico. Each
 * entry is tested against the actual Census state polygon it claims to be
 * in, so a wrong pin fails here rather than on the site.
 */
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";
import topo from "us-atlas/states-10m.json" with { type: "json" };
import { MEMBER_LOCATIONS } from "../content/member-locations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = topo as any;
const states = (feature(t, t.objects.states) as unknown as {
  features: { properties: { name: string } }[];
}).features;

let failures = 0;

for (const loc of MEMBER_LOCATIONS) {
  if (loc.latitude === null || loc.longitude === null) continue;

  const point: [number, number] = [loc.longitude, loc.latitude];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const containing = states.find((s: any) => geoContains(s, point));
  const actual = containing?.properties.name ?? "nowhere in the United States";

  if (actual !== loc.region) {
    failures++;
    console.log(`FAIL  ${loc.label.padEnd(28)} claims ${loc.region}, lands in ${actual}`);
  }
}

const slugs = MEMBER_LOCATIONS.map((l) => l.slug);
const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dupes.length) {
  failures += dupes.length;
  console.log(`FAIL  duplicate slugs: ${[...new Set(dupes)].join(", ")}`);
}

console.log(
  `\n${MEMBER_LOCATIONS.filter((l) => l.latitude !== null).length} located entries checked, ${failures} failure(s)`,
);
process.exit(failures === 0 ? 0 : 1);
