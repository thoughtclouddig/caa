import { getPublishedStories } from "@/lib/queries";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "Stories" };
export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const stories = await getPublishedStories();

  return (
    <>
      <PageHero
        eyebrow="Stories"
        title="The people this is actually about"
        lede="Members, chapters, and the ordinary working life of Catholics in aviation."
      />
      <section className="section shell">
        {stories.length === 0 ? (
          <Empty>No stories have been published yet.</Empty>
        ) : (
          <Rows>
            {stories.map((s) => (
              <Row key={s.id} title={s.title} href={`/stories/${s.slug}`} meta={s.authorName ?? undefined}>
                <p>{s.excerpt}</p>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
