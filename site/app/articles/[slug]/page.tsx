import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getPublishedArticles } from "@/lib/queries";
import ArticleImage from "@/components/ArticleImage";
import { bodyToHtml, toPlainText } from "@/lib/richtext";
import styles from "./article.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article" };
  return {
    title: article.title,
    description: article.excerpt ?? toPlainText(article.body, 160),
  };
}

function formatDate(date: Date | null) {
  if (!date) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const more = (await getPublishedArticles(4))
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  return (
    <>
      {/* Headline before photograph: the reader should know what they are
          looking at before they look at it. */}
      <header className={`shell ${styles.head}`}>
        <p className={styles.kicker}>
          {[article.authorName, formatDate(article.publishedAt)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <h1 className={styles.title}>{article.title}</h1>
        {article.excerpt && <p className={styles.standfirst}>{article.excerpt}</p>}
      </header>

      <div className="shell">
        <ArticleImage
          article={article}
          ratio="16 / 9"
          sizes="(min-width: 78rem) 72rem, 100vw"
          priority
        />
      </div>

      {/*
        Already sanitised: rich text is cleaned to the allowlist on save,
        and a plain-text body written before the editor existed is escaped
        on conversion. See lib/richtext.ts.
      */}
      <article
        className={`shell ${styles.body}`}
        dangerouslySetInnerHTML={{ __html: bodyToHtml(article.body) }}
      />

      {more.length > 0 && (
        <section className={`shell ${styles.more}`}>
          <h2 className={styles.moreHeading}>More From CAA</h2>
          <div className={styles.moreGrid}>
            {more.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className={styles.card}
              >
                <ArticleImage
                  article={a}
                  ratio="3 / 2"
                  sizes="(min-width: 62rem) 22rem, 100vw"
                />
                <h3 className={styles.cardTitle}>{a.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
