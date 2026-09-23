import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getChapterMembers, getActiveChapters } from "@/lib/queries";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "My chapter" };
export const dynamic = "force-dynamic";

export default async function MyChapterPage() {
  const user = await requireUser();

  if (!user.chapterId) {
    const chapters = await getActiveChapters();
    return (
      <>
        <PageHero eyebrow="My chapter" title="You Are Not in a Chapter Yet"
          lede="Choose one under Profile, or start a new one where you live." />
        <section className="section shell">
          <Rows>
            {chapters.map((c) => (
              <Row key={c.id} title={c.name} href={`/chapters/${c.slug}`} meta={c.meetingSchedule ?? undefined}>
                <p>{c.description}</p>
              </Row>
            ))}
          </Rows>
          <p style={{ marginTop: "1.6rem" }}>
            <Link className="btn btn--ghost" href="/participate/start-a-chapter">Start a chapter</Link>
          </p>
        </section>
      </>
    );
  }

  const members = await getChapterMembers(user.chapterId);
  return (
    <>
      <PageHero eyebrow="My chapter" title="Your Chapter" />
      <section className="section shell">
        <h2>Members who are listed</h2>
        {members.length === 0 ? <Empty>No one in this chapter has opted into the directory.</Empty> : (
          <Rows>
            {members.map((m) => <Row key={m.id} title={m.name} meta={m.aviationRole ?? undefined} />)}
          </Rows>
        )}
      </section>
    </>
  );
}
