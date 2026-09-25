import styles from "./VideoSlot.module.css";

/**
 * A place for a film.
 *
 * Until CAA supplies one this renders a labelled frame describing what
 * belongs there, the same way PhotoSlot does for photography: a visible
 * gap that says what it is beats a blank column, and beats a stock clip.
 *
 * Give it a `src` and it plays a self-hosted file. Self-hosted rather than
 * embedded on purpose, so the homepage does not load a tracker from a
 * video platform just to show a two-minute film.
 */
export default function VideoSlot({
  src,
  poster,
  brief,
  caption,
  className = "",
}: {
  src?: string;
  poster?: string;
  brief?: string;
  caption?: string;
  className?: string;
}) {
  if (src) {
    return (
      <figure className={`${styles.wrap} ${className}`}>
        <video className={styles.video} controls preload="metadata" poster={poster}>
          <source src={src} />
          Your browser cannot play this video.
        </video>
        {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
      </figure>
    );
  }

  return (
    <div className={`${styles.wrap} ${className}`}>
      <div className={styles.placeholder}>
        {/* A mark, not an icon set: one triangle in a ring, in the gold
            that only ever appears on navy. */}
        <span className={styles.play} aria-hidden="true">
          <svg viewBox="0 0 64 64" width="56" height="56">
            <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M26 21 L45 32 L26 43 Z" fill="currentColor" />
          </svg>
        </span>
        <p className={styles.label}>Film to come</p>
        {brief && <p className={styles.brief}>{brief}</p>}
      </div>
    </div>
  );
}
