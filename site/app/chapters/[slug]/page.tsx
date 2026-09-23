import { notFound } from "next/navigation";
import Link from "next/link";
import { getChapterBySlug } from "@/lib/queries";
import { PageHero } from "@/components/ui";
import PhotoSlot from "@/components/PhotoSlot";

export const dynamic = "force-dynamic";

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = await getChapterBySlug(slug);
  if (!chapter) notFound();

  const place = [chapter.city, chapter.region].filter(Boolean).join(", ");

  return (
    <>
      <PageHero eyebrow={place || "Chapter"} title={chapter.name} lede={chapter.description ?? undefined}>
        <Link className="btn btn--primary" href="/register">Join CAA</Link>
      </PageHero>

      <section className="section shell shell--narrow">
        <dl>
          <dt className="eyebrow">Meets</dt>
          <dd className="prose">{chapter.meetingSchedule ?? "Schedule to be confirmed."}</dd>
        </dl>
        {chapter.photoBrief && (
          <div style={{ marginTop: "2.5rem" }}>
            <PhotoSlot brief={chapter.photoBrief} ratio="16 / 9" />
          </div>
        )}
      </section>
    </>
  );
}
