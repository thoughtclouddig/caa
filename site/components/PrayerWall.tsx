import Link from "next/link";
import { getPublicPrayerRequests } from "@/lib/queries";
import styles from "./PrayerWall.module.css";

/**
 * The prayer wall: approved public intentions moving slowly across a navy
 * band beneath the hero.
 *
 * What is shown is the intention, with a first name after it. Never a
 * surname, never an initial. Only requests a member marked public and an
 * administrator approved reach this component.
 *
 * The track is duplicated so the loop has no seam, and the copy is hidden
 * from screen readers so the intentions are not read out twice. The list
 * beneath the band is the accessible version, and the whole strip stops
 * moving on hover, on keyboard focus, and under prefers-reduced-motion.
 */
export default async function PrayerWall() {
  const requests = await getPublicPrayerRequests(12);
  if (requests.length === 0) return null;

  const items = requests.map((r) => (
    <span key={r.id} className={styles.item}>
      {r.intention}
      <span className={styles.who}>{r.displayName}</span>
    </span>
  ));

  return (
    <section className={styles.wall} aria-labelledby="prayer-wall-label">
      <Link href="/portal/prayer" className={styles.label} id="prayer-wall-label">
        Pray With Us
      </Link>

      <div className={styles.viewport}>
        <div className={styles.track}>
          <div className={styles.run}>{items}</div>
          <div className={styles.run} aria-hidden="true">
            {requests.map((r) => (
              <span key={`echo-${r.id}`} className={styles.item}>
                {r.intention}
                <span className={styles.who}>{r.displayName}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
