import Link from "next/link";
import Image from "next/image";
import ArticleImage from "@/components/ArticleImage";
import PrayerWall from "@/components/PrayerWall";
import {
  hero,
  missionIntro,
  missionAreas,
  benefits,
  everyDay,
  articlesTeaser,
  closing,
} from "@/content/home";
import { getHomeArticles } from "@/lib/queries";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { featured, rest } = await getHomeArticles(3);

  return (
    <>
      {/* Hero. The photograph is the ground, not a panel beside the copy:
          the image was chosen for the room it leaves on the left. A navy
          scrim carries the type at contrast without flattening the sky. */}
      <section className={styles.hero}>
        <Image
          src="/home/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroScrim} />
        <div className={`shell ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>{hero.eyebrow}</p>
            <h1 className={styles.heroHeading}>{hero.heading}</h1>
            {/* CAA's own tagline sits under the headline rather than
                competing with it. */}
            <p className={styles.heroSubhead}>{hero.subhead}</p>
            <hr className={styles.heroRule} />
            <p className={styles.heroLede}>{hero.lede}</p>
            <div className={styles.heroActions}>
              <Link href={hero.cta.href} className="btn btn--primary">
                {hero.cta.label}
              </Link>
              <Link href={hero.secondary.href} className={styles.heroGhost}>
                {hero.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Approved public intentions, directly beneath the hero. */}
      <PrayerWall />

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

      {/* Articles. One lead carried large, three beneath it, then the
          way through to everything else. Real articles, not photo tiles. */}
      <section className="section">
        <div className="shell">
          <div className={styles.articlesHead}>
            <div>
              <p className="eyebrow">{articlesTeaser.eyebrow}</p>
              <h2>{articlesTeaser.heading}</h2>
              <p className={`prose ${styles.articlesLede}`}>
                {articlesTeaser.lede}
              </p>
            </div>
            <Link href={articlesTeaser.cta.href} className="btn btn--ghost">
              {articlesTeaser.cta.label}
            </Link>
          </div>

          {featured && (
            <Link href={`/articles/${featured.slug}`} className={styles.lead}>
              <ArticleImage
                article={featured}
                ratio="16 / 9"
                sizes="(min-width: 52rem) 40rem, 100vw"
                className={styles.leadPhoto}
              />
              <div className={styles.leadCopy}>
                <p className="eyebrow">{featured.authorName ?? "CAA"}</p>
                <h3 className={styles.leadTitle}>{featured.title}</h3>
                {featured.excerpt && (
                  <p className={`lede ${styles.leadExcerpt}`}>{featured.excerpt}</p>
                )}
                <span className={styles.readOn}>Read the Article</span>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <div className={styles.articlesGrid}>
              {rest.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className={styles.card}
                >
                  <ArticleImage
                    article={article}
                    ratio="3 / 2"
                    sizes="(min-width: 46rem) 22rem, 100vw"
                  />
                  <h4 className={styles.cardTitle}>{article.title}</h4>
                  {article.excerpt && (
                    <p className={styles.cardExcerpt}>{article.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
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
