import Link from "next/link";
import { geoAlbersUsa } from "d3-geo";
import { MAP_WIDTH, MAP_HEIGHT, MAP_SCALE, MAP_TRANSLATE, MAP_SRC } from "@/lib/us-map";
import styles from "./ChapterMap.module.css";

type MappableChapter = {
  id: number;
  slug: string;
  name: string;
  city: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
};

/**
 * The chapter map.
 *
 * Built from a projected Census outline served as one cacheable SVG, with
 * pins placed through the same projection. Nothing here calls a mapping
 * service: no API key, no tiles, no cookie banner, and no third party
 * being told where CAA's chapters and members are. That last point is the
 * reason it is worth doing this way rather than dropping in an embed.
 *
 * The list beside the map is not a caption. It is the same information in
 * a form that works without the image, on a phone, and in a screen reader,
 * so the map can stay decorative and the links stay real.
 */
export default function ChapterMap({ chapters }: { chapters: MappableChapter[] }) {
  const projection = geoAlbersUsa().scale(MAP_SCALE).translate(MAP_TRANSLATE);

  const pins = chapters.flatMap((c) => {
    if (c.latitude === null || c.longitude === null) return [];
    const point = projection([c.longitude, c.latitude]);
    // geoAlbersUsa returns null for anything outside the United States.
    // Those chapters keep their place in the list and simply carry no pin.
    if (!point) return [];
    return [{ chapter: c, x: point[0], y: point[1] }];
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.mapCol}>
        <div className={styles.frame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MAP_SRC} alt="" className={styles.base} width={MAP_WIDTH} height={MAP_HEIGHT} />
          <svg
            className={styles.pins}
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            aria-hidden="true"
          >
            {pins.map(({ chapter, x, y }) => (
              <g key={chapter.id} className={styles.pin}>
                <circle cx={x} cy={y} r={15} className={styles.halo} />
                <circle cx={x} cy={y} r={8} className={styles.dot} />
                <text x={x} y={y - 24} className={styles.pinLabel}>
                  {chapter.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
        {pins.length < chapters.length && (
          <p className={styles.note}>
            Chapters outside the United States are listed but not pinned.
          </p>
        )}
      </div>

      <ol className={styles.list}>
        {chapters.map((c) => (
          <li key={c.id}>
            <Link href={`/chapters/${c.slug}`} className={styles.listLink}>
              <span className={styles.listName}>{c.name}</span>
              <span className={styles.listPlace}>
                {[c.city, c.region].filter(Boolean).join(", ")}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
