import styles from "./PhotoSlot.module.css";

type Props = {
  /** What the photograph needs to show. */
  brief: string;
  /** Optional aspect ratio, e.g. "16 / 9". Defaults to 4:3. */
  ratio?: string;
  className?: string;
};

/**
 * A deliberate, labelled gap where real CAA photography goes.
 *
 * CAA_BRAND.md rules out generated imagery and generic stock. Rather than
 * fill these spaces with something that would have to be torn out later,
 * the brief stays visible so it is obvious what is still needed.
 */
export default function PhotoSlot({ brief, ratio = "4 / 3", className }: Props) {
  return (
    <figure
      className={`${styles.slot} ${className ?? ""}`}
      style={{ aspectRatio: ratio }}
    >
      <figcaption className={styles.caption}>
        <span className={styles.label}>Photography needed</span>
        <span className={styles.brief}>{brief}</span>
      </figcaption>
    </figure>
  );
}
