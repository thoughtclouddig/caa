import { geoAlbersUsa } from "d3-geo";
import { MAP_WIDTH, MAP_HEIGHT, MAP_SCALE, MAP_TRANSLATE, MAP_SRC } from "@/lib/us-map";
import { findMemberLocation } from "@/content/member-locations";
import styles from "./MemberMap.module.css";

type DirectoryMember = { locationSlug: string | null };

/**
 * Where CAA's members are, as they chose to describe it.
 *
 * Pins come from the fixed list of places members pick from, never from an
 * address, so several members in one place share one mark. That is the
 * point rather than a limitation: the map shows the association's reach
 * without showing where anybody lives.
 *
 * Members who chose nothing, or chose somewhere off the list, are counted
 * in the note beneath rather than dropped.
 */
export default function MemberMap({ members }: { members: DirectoryMember[] }) {
  const projection = geoAlbersUsa().scale(MAP_SCALE).translate(MAP_TRANSLATE);

  const counts = new Map<string, number>();
  let unplaced = 0;

  for (const m of members) {
    const place = findMemberLocation(m.locationSlug);
    if (!place || place.latitude === null || place.longitude === null) {
      unplaced++;
      continue;
    }
    counts.set(place.slug, (counts.get(place.slug) ?? 0) + 1);
  }

  const pins = [...counts.entries()].flatMap(([slug, count]) => {
    const place = findMemberLocation(slug)!;
    const point = projection([place.longitude!, place.latitude!]);
    if (!point) return [];
    return [{ place, count, x: point[0], y: point[1] }];
  });

  const placed = members.length - unplaced;

  return (
    <figure className={styles.wrap}>
      <div className={styles.frame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MAP_SRC} alt="" className={styles.base} width={MAP_WIDTH} height={MAP_HEIGHT} />
        <svg
          className={styles.pins}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="img"
          aria-label={
            pins.length === 0
              ? "No member locations to show yet."
              : `Members in ${pins.length} ${pins.length === 1 ? "place" : "places"} across the United States.`
          }
        >
          {pins.map(({ place, count, x, y }) => (
            <g key={place.slug}>
              <title>{`${place.label}: ${count} ${count === 1 ? "member" : "members"}`}</title>
              {/* Radius grows with the count but slowly, so one busy city
                  cannot swamp the rest of the map. */}
              <circle cx={x} cy={y} r={9 + Math.min(Math.sqrt(count) * 4, 16)} className={styles.halo} />
              <circle cx={x} cy={y} r={6} className={styles.dot} />
            </g>
          ))}
        </svg>
      </div>

      <figcaption className={styles.caption}>
        {placed > 0 && (
          <>
            {placed} {placed === 1 ? "member has" : "members have"} named a place
            {pins.length > 0 && <> across {pins.length} {pins.length === 1 ? "city" : "cities"}</>}.{" "}
          </>
        )}
        {unplaced > 0 && (
          <>
            {unplaced} {unplaced === 1 ? "is" : "are"} elsewhere or chose not to say.{" "}
          </>
        )}
        Locations are the nearest listed city, chosen by each member. CAA does
        not hold anyone&rsquo;s address.
      </figcaption>
    </figure>
  );
}
