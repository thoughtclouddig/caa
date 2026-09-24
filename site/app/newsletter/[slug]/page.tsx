import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssueBySlug, getIssueArticles } from "@/lib/queries";
import { bodyToHtml, toPlainText } from "@/lib/richtext";
import ArticleImage from "@/components/ArticleImage";
import styles from "./issue.module.css";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const issue = await getIssueBySlug(slug);
  if (!issue) return { title: "Newsletter" };
  return {
    title: issue.title,
    description: issue.intro ? toPlainText(issue.intro, 160) : undefined,
  };
}

/**
 * An issue in the archive.
 *
 * Articles are referenced rather than copied, so a correction made to an
 * article later shows here too. The email that went out is fixed at the
 * moment it was sent; this is the living version.
 */
export default async function IssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const issue = await getIssueBySlug(slug);
  if (!issue) notFound();

  const articles = await getIssueArticles(issue.id);

  return (
    <>
      <header className={`shell ${styles.head}`}>
        <Link href="/newsletter" className={styles.back}>&larr; All issues</Link>
        <p className="eyebrow">
          {issue.publishedAt ? fmt.format(issue.publishedAt) : "Newsletter"}
        </p>
        <h1 className={styles.title}>{issue.title}</h1>
        {issue.intro && (
          <div
            className={`rich ${styles.intro}`}
            dangerouslySetInnerHTML={{ __html: bodyToHtml(issue.intro) }}
          />
        )}
      </header>

      <div className={`shell ${styles.items}`}>
        {articles.map((a) => (
          <article key={a.id} className={styles.item}>
            <Link href={`/articles/${a.slug}`} className={styles.itemLink}>
              <ArticleImage
                article={a}
                ratio="3 / 2"
                sizes="(min-width: 52rem) 20rem, 100vw"
                className={styles.itemImage}
              />
              <div>
                <h2 className={styles.itemTitle}>{a.title}</h2>
                {a.excerpt && <p className={styles.itemExcerpt}>{a.excerpt}</p>}
                <span className={styles.more}>Read the Article</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
