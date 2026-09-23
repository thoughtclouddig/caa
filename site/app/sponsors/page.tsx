import { getSponsors } from "@/lib/queries";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "Sponsors & Partners" };
export const dynamic = "force-dynamic";

export default async function SponsorsPage() {
  const rows = await getSponsors();
  return (
    <>
      <PageHero
        eyebrow="Sponsors & Partners"
        title="Businesses That Share the Mission"
        lede="Aviation and Catholic businesses that support CAA. We ask them for partnership in the mission, not a discount code."
      />
      <section className="section shell">
        {rows.length === 0 ? <Empty>No partners are listed yet.</Empty> : (
          <Rows>
            {rows.map((s) => (
              <Row key={s.id} title={s.name} meta={s.tier}>
                <p>{s.blurb}</p>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
