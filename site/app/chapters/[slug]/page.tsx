import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getChapterBySlug, getActiveChapters } from "@/lib/queries";
import { bodyToHtml } from "@/lib/richtext";
import PhotoSlot from "@/components/PhotoSlot";
import styles from "./chapter.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = await getChapterBySlug(slug);
  if (!chapter) return { title: "Chapter" };
  return { title: chapter.name, description: chapter.tagline ?? chapter.description ?? undefined };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = await getChapterBySlug(slug);
  if (!chapter) notFound();

  const others = (await getActiveChapters()).filter((c) => c.id !== chapter.id);
  const place = [chapter.city, chapter.region].filter(Boolean).join(", ");

  return (
    <>
      {/* The patron above the name, the chapter's own line below it: the
          shape the existing site uses, where each chapter has taken a
          saint and says so before anything else. */}
      <header className={styles.head}>
        <div className={`shell ${styles.headInner}`}>
          <div className={styles.headCopy}>
            {chapter.patronName && (
              <p className={styles.patron}>{chapter.patronName}</p>
            )}
            <h1 className={styles.name}>{chapter.name}</h1>
            {chapter.tagline && <p className={styles.tagline}>{chapter.tagline}</p>}
            <dl className={styles.facts}>
              {place && (
                <div>
                  <dt>Where</dt>
                  <dd>{place}</dd>
                </div>
              )}
              {chapter.meetingSchedule && (
                <div>
                  <dt>Meets</dt>
                  <dd>{chapter.meetingSchedule}</dd>
                </div>
              )}
              <div>
                <dt>Status</dt>
                <dd>{chapter.status === "active" ? "Active" : "Forming"}</dd>
              </div>
            </dl>
            <div className={styles.actions}>
              <Link className="btn btn--primary" href="/register">Join CAA</Link>
              <Link className="btn btn--ghost" href="/contact">Contact the chapter</Link>
            </div>
          </div>

          <div className={styles.headPhoto}>
            {chapter.imagePath ? (
              <div className={styles.frame}>
                <Image
                  src={chapter.imagePath}
                  alt={chapter.imageAlt ?? ""}
                  fill
                  sizes="(min-width: 58rem) 42vw, 100vw"
                  priority
                  className={styles.image}
                />
              </div>
            ) : (
              <PhotoSlot brief={chapter.photoBrief ?? ""} ratio="4 / 3" />
            )}
          </div>
        </div>
      </header>

      {(chapter.body || chapter.description) && (
        <section className="section shell">
          <div className={styles.body}>
            {chapter.body ? (
              <div
                className="rich"
                dangerouslySetInnerHTML={{ __html: bodyToHtml(chapter.body) }}
              />
            ) : (
              <p className="prose">{chapter.description}</p>
            )}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="section--warm">
          <div className="section shell">
            <h2 className={styles.othersHeading}>Other Chapters</h2>
            <div className={styles.others}>
              {others.map((c) => (
                <Link key={c.id} href={`/chapters/${c.slug}`} className={styles.other}>
                  {c.patronName && <span className={styles.otherPatron}>{c.patronName}</span>}
                  <span className={styles.otherName}>{c.name}</span>
                  {c.tagline && <span className={styles.otherTagline}>{c.tagline}</span>}
                </Link>
              ))}
              <Link href="/participate/start-a-chapter" className={styles.other}>
                <span className={styles.otherPatron}>Nowhere near you?</span>
                <span className={styles.otherName}>Start a Chapter</span>
                <span className={styles.otherTagline}>
                  Five or six people are enough to begin.
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
