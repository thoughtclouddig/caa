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
        title="Formation, prayer and practical help"
        lede="Kept on CAA's own pages rather than sending you somewhere else."
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
