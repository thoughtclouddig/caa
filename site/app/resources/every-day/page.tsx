import Link from "next/link";
import { getPublicPrayerRequests, getPublishedArticles } from "@/lib/queries";
import { Notice } from "@/components/ui";
import styles from "./every-day.module.css";

export const metadata = {
  title: "CAA Every Day",
  description:
    "The day's Scripture, the association's latest, and the intentions members have asked prayer for.",
};
export const dynamic = "force-dynamic";

export default async function EveryDayPage() {
  const [intentions, articles] = await Promise.all([
    getPublicPrayerRequests(6),
    getPublishedArticles(4),
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
            {/*
              Citations only. The USCCB lectionary translation is under
              copyright, so the full text cannot be reproduced here without
              permission. The citation feed itself is not connected yet.
            */}
            <Notice tone="info">
              The daily reading citations are not connected yet. Reproducing
              the reading text needs permission from the USCCB, so this page
              will carry the citations and CAA&rsquo;s own reflection rather
              than the translated text.
            </Notice>
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
