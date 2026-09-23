import Link from "next/link";
import { getActiveChapters } from "@/lib/queries";
import { PageHero, Rows, Row, Empty } from "@/components/ui";
import ChapterMap from "@/components/ChapterMap";

export const metadata = {
  title: "Chapters",
  description:
    "Where CAA chapters meet, and how to start one where there is not yet a chapter near you.",
};
export const dynamic = "force-dynamic";

export default async function ChaptersPage() {
  const chapters = await getActiveChapters();

  return (
    <>
      <PageHero
        eyebrow="Chapters"
        title="Find a Chapter, or Start One"
        lede="A chapter is a handful of Catholics in aviation who meet, pray and know each other by name. If there is none near you, five or six people are enough to start one."
      >
        <Link className="btn btn--primary" href="/participate/start-a-chapter">
          Start a Chapter
        </Link>
      </PageHero>

      {chapters.length === 0 ? (
        <section className="section shell">
          <Empty>No chapters are listed yet.</Empty>
        </section>
      ) : (
        <>
          <section className="section shell">
            <ChapterMap
              chapters={chapters.map((c) => ({
                id: c.id,
                slug: c.slug,
                name: c.name,
                city: c.city,
                region: c.region,
                latitude: c.latitude,
                longitude: c.longitude,
              }))}
            />
          </section>

          <section className="section--warm">
            <div className="section shell">
              <h2>Every Chapter</h2>
              <Rows>
                {chapters.map((c) => (
                  <Row
                    key={c.id}
                    title={c.name}
                    href={`/chapters/${c.slug}`}
                    meta={
                      c.status === "active"
                        ? c.meetingSchedule ?? "Active"
                        : "Forming"
                    }
                  >
                    <p>{c.description}</p>
                  </Row>
                ))}
              </Rows>
            </div>
          </section>
        </>
      )}
    </>
  );
}
