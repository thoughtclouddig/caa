import Link from "next/link";
import { notFound } from "next/navigation";
import { getResourceBySlug, getResources } from "@/lib/queries";
import { findEditablePage } from "@/content/editable-pages";
import { getPage } from "@/lib/queries";
import { bodyToHtml } from "@/lib/richtext";
import { PageHero, Notice } from "@/components/ui";
import styles from "./resource.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) return { title: "Resource" };
  return { title: resource.title, description: resource.summary ?? undefined };
}

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) notFound();

  /*
   * A resource can carry its own body, or draw one from the editable page
   * copy registered under the same slug. The second is how most of these
   * are written, so staff edit them in one place alongside every other
   * block of page copy.
   */
  const registered = findEditablePage(slug);
  const shared = registered ? await getPage(slug) : null;
  const body = resource.body || shared?.body || null;

  const siblings = (await getResources()).filter(
    (r) => r.id !== resource.id && r.category === resource.category,
  );

  return (
    <>
      <PageHero eyebrow={resource.category} title={resource.title} lede={resource.summary ?? undefined}>
        <Link className="btn btn--ghost" href="/resources">All Resources</Link>
      </PageHero>

      <section className="section shell shell--narrow">
        {body ? (
          <div className="rich" dangerouslySetInnerHTML={{ __html: bodyToHtml(body) }} />
        ) : (
          <Notice>
            This page is still being written. If you have something that
            belongs here, <Link href="/contact">write to us</Link>.
          </Notice>
        )}
      </section>

      {siblings.length > 0 && (
        <section className="section--warm">
          <div className="section shell">
            <h2 className={styles.moreHeading}>More in {resource.category}</h2>
            <ul className={styles.more}>
              {siblings.map((r) => (
                <li key={r.id}>
                  <Link href={`/resources/${r.slug}`} className={styles.moreLink}>
                    <span className={styles.moreName}>{r.title}</span>
                    {r.summary && <span className={styles.moreSummary}>{r.summary}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
