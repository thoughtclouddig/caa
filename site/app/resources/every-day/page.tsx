import Link from "next/link";
import { getPublicPrayerRequests, getPublishedArticles } from "@/lib/queries";
import { getReadings, getLiturgicalDay } from "@/lib/readings";
import { Notice } from "@/components/ui";
import styles from "./every-day.module.css";

export const metadata = {
  title: "CAA Every Day",
  description:
    "The day's Scripture, the association's latest, and the intentions members have asked prayer for.",
};
export const dynamic = "force-dynamic";

export default async function EveryDayPage() {
  const [intentions, articles, readings, day] = await Promise.all([
    getPublicPrayerRequests(6),
    getPublishedArticles(4),
    getReadings(),
    getLiturgicalDay(),
  ]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <header className={`shell ${styles.head}`}>
        <p className="eyebrow">CAA Every Day</p>
        <h1 className={styles.title}>{today}</h1>
        {day?.title && (
          <p className={styles.liturgical}>
            {day.title}
            {day.colour && (
              <span
                className={styles.colour}
                data-colour={day.colour}
                title={`Liturgical colour: ${day.colour}`}
              />
            )}
          </p>
        )}
        <p className={`lede ${styles.lede}`}>
          A reason to come back tomorrow. The day&rsquo;s Scripture, what the
          association is asking of us, and the intentions members have put
          before the rest of us.
        </p>
      </header>

      <div className={`shell ${styles.columns}`}>
        <main className={styles.main}>
          <section>
            <h2 className={styles.sectionHeading}>Today&rsquo;s Readings</h2>

            {readings ? (
              <>
                <dl className={styles.readings}>
                  {readings.firstReading && (
                    <div>
                      <dt>First reading</dt>
                      <dd>{readings.firstReading}</dd>
                    </div>
                  )}
                  {readings.psalm && (
                    <div>
                      <dt>Responsorial psalm</dt>
                      <dd>{readings.psalm}</dd>
                    </div>
                  )}
                  {readings.secondReading && (
                    <div>
                      <dt>Second reading</dt>
                      <dd>{readings.secondReading}</dd>
                    </div>
                  )}
                  {readings.gospel && (
                    <div>
                      <dt>Gospel</dt>
                      <dd>{readings.gospel}</dd>
                    </div>
                  )}
                </dl>

                {/*
                  Citations here, text there. The reference is a fact; the
                  translation is the USCCB's, and reproducing it needs
                  their permission.
                */}
                {readings.usccbLink && (
                  <p className={styles.readingsNote}>
                    <a href={readings.usccbLink} rel="noopener noreferrer">
                      Read the passages at the USCCB
                    </a>
                    . CAA shows the references; the text of the readings
                    belongs to the bishops&rsquo; conference.
                  </p>
                )}
              </>
            ) : (
              <Notice tone="warn">
                The readings could not be fetched just now. They will be
                back shortly; in the meantime the USCCB publishes them at
                bible.usccb.org.
              </Notice>
            )}
          </section>

          <section className={styles.block}>
            <h2 className={styles.sectionHeading}>Latest From CAA</h2>
            <ul className={styles.articleList}>
              {articles.map((a) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}`} className={styles.articleLink}>
                    <h3 className={styles.articleTitle}>{a.title}</h3>
                    {a.excerpt && <p className={styles.articleExcerpt}>{a.excerpt}</p>}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/articles" className="btn btn--ghost">
              See All Articles
            </Link>
          </section>
        </main>

        <aside className={styles.aside}>
          <h2 className={styles.sectionHeading}>Pray With Us</h2>
          {intentions.length === 0 ? (
            <p className={styles.quiet}>No intentions are published today.</p>
          ) : (
            <ul className={styles.intentions}>
              {intentions.map((r) => (
                <li key={r.id} className={styles.intention}>
                  <p>{r.intention}</p>
                  <p className={styles.who}>{r.displayName}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/portal/prayer" className="btn btn--ghost">
            Add an Intention
          </Link>
        </aside>
      </div>
    </>
  );
}
