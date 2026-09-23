import { notFound } from "next/navigation";
import { getStoryBySlug } from "@/lib/queries";
import { PageHero } from "@/components/ui";
import PhotoSlot from "@/components/PhotoSlot";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();

  return (
    <>
      <PageHero eyebrow={story.authorName ?? "Stories"} title={story.title} lede={story.excerpt ?? undefined} />
      <article className="section shell shell--narrow">
        {story.photoBrief && <PhotoSlot brief={story.photoBrief} ratio="16 / 9" />}
        <div className="prose" style={{ marginTop: "2rem", maxWidth: "none" }}>
          {story.body.split("\n\n").map((p, i) => <p key={i} style={{ marginBottom: "1rem" }}>{p}</p>)}
        </div>
      </article>
    </>
  );
}
