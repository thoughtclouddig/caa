import Link from "next/link";
import { getPublishedArticles } from "@/lib/queries";
import ArticleImage from "@/components/ArticleImage";
import { Empty } from "@/components/ui";
import styles from "./articles.module.css";

export const metadata = {
  title: "Articles",
  description:
    "Chapter news, member stories and announcements from the Catholic Aviation Association.",
};
export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * The articles index.
 *
 * Three tiers, so the page has a clear reading order instead of an even
 * wall of cards: the lead runs full width with its photograph above the
 * headline, the next two sit side by side, and everything after that falls
 * into a three-up river. An article without a supplied photograph still
 * works; the brief stands in for the image.
 */
export default async function ArticlesPage() {
  const articles = await getPublishedArticles(24);
  const [lead, ...rest] = articles;
  const seconds = rest.slice(0, 2);
  const river = rest.slice(2);

  return (
    <>
      <header className={`shell ${styles.masthead}`}>
        <p className="eyebrow">Articles</p>
        <h1 className={styles.mastheadTitle}>Faith, Flying and Fellowship</h1>
        <p className={`lede ${styles.mastheadLede}`}>
          Chapter news, member stories and what the association is asking of
          us right now.
        </p>
      </header>

      {articles.length === 0 ? (
        <section className="section shell">
          <Empty>No articles have been published yet.</Empty>
        </section>
      ) : (
        <>
          {/* The lead. Photograph first, at the widest ratio on the page,
              so the eye lands here before anything else. */}
          <section className="shell">
            <Link href={`/articles/${lead.slug}`} className={styles.lead}>
              <ArticleImage
                article={lead}
                ratio="21 / 9"
                sizes="(min-width: 78rem) 72rem, 100vw"
                priority
                className={styles.leadImage}
              />
              <div className={styles.leadCopy}>
                <p className={styles.kicker}>
                  {[lead.authorName, formatDate(lead.publishedAt)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <h2 className={styles.leadTitle}>{lead.title}</h2>
                {lead.excerpt && (
                  <p className={styles.leadExcerpt}>{lead.excerpt}</p>
                )}
                <span className={styles.more}>Read the Article</span>
              </div>
            </Link>
          </section>

          {seconds.length > 0 && (
            <section className={`shell ${styles.seconds}`}>
              {seconds.map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.slug}`}
                  className={styles.card}
                >
                  <ArticleImage
                    article={a}
                    ratio="3 / 2"
                    sizes="(min-width: 52rem) 36rem, 100vw"
                  />
                  <p className={styles.kicker}>
                    {[a.authorName, formatDate(a.publishedAt)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h3 className={styles.cardTitle}>{a.title}</h3>
                  {a.excerpt && <p className={styles.cardExcerpt}>{a.excerpt}</p>}
                </Link>
              ))}
            </section>
          )}

          {river.length > 0 && (
            <section className={`shell ${styles.river}`}>
              <h2 className={styles.riverHeading}>More From CAA</h2>
              <div className={styles.riverGrid}>
                {river.map((a) => (
                  <Link
                    key={a.id}
                    href={`/articles/${a.slug}`}
                    className={styles.card}
                  >
                    <ArticleImage
                      article={a}
                      ratio="3 / 2"
                      sizes="(min-width: 52rem) 24rem, 100vw"
                    />
                    <p className={styles.kicker}>
                      {[a.authorName, formatDate(a.publishedAt)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <h3 className={styles.cardTitle}>{a.title}</h3>
                    {a.excerpt && (
                      <p className={styles.cardExcerpt}>{a.excerpt}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
