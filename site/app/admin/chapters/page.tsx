import { getActiveChapters } from "@/lib/queries";
import { PageHero, Rows, Row, Empty } from "@/components/ui";
import ChapterForm from "./ChapterForm";

export const metadata = { title: "Chapters" };
export const dynamic = "force-dynamic";

export default async function AdminChapters() {
  const chapters = await getActiveChapters();

  return (
    <>
      <PageHero eyebrow="Chapters" title="Chapter management" />
      <section className="section shell">
        <h2>Add a chapter</h2>
        <div style={{ marginTop: "1.2rem" }}>
          <ChapterForm />
        </div>

        <h2 style={{ marginTop: "3rem" }}>Existing chapters</h2>
        {chapters.length === 0 ? <Empty>None yet.</Empty> : (
          <Rows>
            {chapters.map((c) => (
              <Row key={c.id} title={c.name} meta={c.status}>
                <p>{c.description}</p>
                <p>{c.meetingSchedule}</p>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
