import { getDirectory } from "@/lib/queries";
import { PageHero, Rows, Row, Empty, Notice } from "@/components/ui";

export const metadata = { title: "Member directory" };
export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const members = await getDirectory();

  return (
    <>
      <PageHero
        eyebrow="Directory"
        title="Member Directory"
        lede="Only members who asked to be listed appear here, and only down to the city."
      />
      <section className="section shell">
        <Notice>
          You control whether you are listed. Change it any time under Profile.
        </Notice>
        {members.length === 0 ? <Empty>No members have opted in yet.</Empty> : (
          <Rows>
            {members.map((m) => (
              <Row key={m.id} title={m.name}
                meta={[m.city, m.region, m.country].filter(Boolean).join(", ")}>
                <p>{[m.aviationRole, m.chapterName].filter(Boolean).join(" · ")}</p>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
