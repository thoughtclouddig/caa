import Link from "next/link";
import PhotoSlot from "@/components/PhotoSlot";
import {
  hero,
  missionIntro,
  missionAreas,
  benefits,
  everyDay,
  storiesTeaser,
  closing,
} from "@/content/home";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      {/* Hero — one message, one call to action. No slider: most visitors
          never see past the first slide, so the page commits to one. */}
      <section className={styles.hero}>
        <div className={`shell ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1 className={styles.heroHeading}>{hero.heading}</h1>
            {/* CAA's own tagline sits under the headline rather than
                competing with it. */}
            <p className={styles.heroSubhead}>{hero.subhead}</p>
            <hr className="rule" />
            <p className={`lede ${styles.heroLede}`}>{hero.lede}</p>
            <div className={styles.heroActions}>
              <Link href={hero.cta.href} className="btn btn--primary">
                {hero.cta.label}
              </Link>
              <Link href={hero.secondary.href} className="btn btn--ghost">
                {hero.secondary.label}
              </Link>
            </div>
          </div>
          <PhotoSlot
            brief={hero.photo.brief}
            ratio="5 / 6"
            className={styles.heroPhoto}
          />
        </div>
      </section>

      {/* The three mission areas. Rows rather than a bank of cards, so the
          Flying entry can carry its honest status without looking broken. */}
      <section className="section">
        <div className="shell">
          <div className={styles.missionIntro}>
            <p className="eyebrow">{missionIntro.eyebrow}</p>
            <h2>{missionIntro.heading}</h2>
            <p className={`lede ${styles.missionLede}`}>{missionIntro.lede}</p>
          </div>

          <div className={styles.missionList}>
            {missionAreas.map((area) => (
              <article key={area.name} className={styles.missionRow}>
                <div className={styles.missionName}>
                  <span>{area.name}</span>
                  {area.status && (
                    <span className={styles.missionStatus}>{area.status}</span>
                  )}
                </div>
                <div className={styles.missionBody}>
                  <h3>{area.heading}</h3>
                  <p className="prose">{area.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits — written as reasons, not a feature grid. */}
      <section className="section section--warm">
        <div className={`shell ${styles.benefits}`}>
          <div>
            <p className="eyebrow">{benefits.eyebrow}</p>
            <h2>{benefits.heading}</h2>
            <p className={`prose ${styles.benefitsLede}`}>{benefits.lede}</p>
          </div>
          <ul className={styles.benefitsList}>
            {benefits.items.map((item) => (
              <li key={item.heading} className={styles.benefitItem}>
                <h3>{item.heading}</h3>
                <p className="prose">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CAA Every Day — the one dark moment on the page. */}
      <section className="section section--navy">
        <div className={`shell ${styles.everyDay}`}>
          <div>
            <p className="eyebrow">{everyDay.eyebrow}</p>
            <h2>{everyDay.heading}</h2>
          </div>
          <div className={styles.everyDayBody}>
            <p className="lede">{everyDay.lede}</p>
            <p className={styles.note}>{everyDay.readingNote}</p>
            <Link href={everyDay.cta.href} className="btn btn--ghost">
              {everyDay.cta.label}
            </Link>
          </div>
        </div>
      </section>

      {/* Stories — people carry the page from here down. */}
      <section className="section">
        <div className="shell">
          <div className={styles.storiesHead}>
            <div>
              <p className="eyebrow">{storiesTeaser.eyebrow}</p>
              <h2>{storiesTeaser.heading}</h2>
              <p className={`prose ${styles.storiesLede}`}>
                {storiesTeaser.lede}
              </p>
            </div>
            <Link href={storiesTeaser.cta.href} className="btn btn--ghost">
              {storiesTeaser.cta.label}
            </Link>
          </div>
          <div className={styles.storiesGrid}>
            {storiesTeaser.photos.map((photo) => (
              <PhotoSlot key={photo.brief} brief={photo.brief} ratio="3 / 2" />
            ))}
          </div>
        </div>
      </section>

      {/* One closing invitation. */}
      <section className="section--tight section">
        <div className={`shell shell--narrow ${styles.closing}`}>
          <h2>{closing.heading}</h2>
          <p className={`lede ${styles.closingLede}`}>{closing.lede}</p>
          <Link href={closing.cta.href} className="btn btn--primary">
            {closing.cta.label}
          </Link>
        </div>
      </section>
    </>
  );
}
