import { getResources } from "@/lib/queries";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "Resources" };
export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const rows = await getResources();

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Formation, Prayer and Practical Help"
        lede="Everything here lives on CAA's own pages, so you are not sent off somewhere else to find it."
      />
      <section className="section shell">
        {rows.length === 0 ? <Empty>Nothing here yet.</Empty> : (
          <Rows>
            {rows.map((r) => (
              <Row key={r.id} title={r.title} meta={r.category}>
                <p>{r.summary}</p>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
