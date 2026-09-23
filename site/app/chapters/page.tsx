import Link from "next/link";
import { getActiveChapters } from "@/lib/queries";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "Chapters" };
export const dynamic = "force-dynamic";

export default async function ChaptersPage() {
  const chapters = await getActiveChapters();

  return (
    <>
      <PageHero
        eyebrow="Chapters"
        title="Find a chapter, or start one"
        lede="A chapter is a few Catholics in aviation who meet, pray and know each other by name. If there is not one near you, starting one is the normal way they begin."
      >
        <Link className="btn btn--primary" href="/participate/start-a-chapter">Start a chapter</Link>
      </PageHero>

      <section className="section shell">
        {chapters.length === 0 ? (
          <Empty>No chapters are listed yet.</Empty>
        ) : (
          <Rows>
            {chapters.map((c) => (
              <Row key={c.id} title={c.name} href={`/chapters/${c.slug}`}
                meta={c.status === "active" ? c.meetingSchedule ?? "Active" : "Forming"}>
                <p>{c.description}</p>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
