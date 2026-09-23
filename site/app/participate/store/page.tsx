import { getProducts } from "@/lib/queries";
import { PageHero, Rows, Row, Empty, Notice } from "@/components/ui";

export const metadata = { title: "CAA Store" };
export const dynamic = "force-dynamic";

export default async function StorePage() {
  const products = await getProducts();
  return (
    <>
      <PageHero eyebrow="CAA Store" title="Association merchandise" />
      <section className="section shell">
        <Notice>Checkout is not connected yet. Items are listed, but nothing can be purchased.</Notice>
        {products.length === 0 ? <Empty>Nothing listed yet.</Empty> : (
          <Rows>
            {products.map((p) => (
              <Row key={p.id} title={p.name} meta={`$${(p.priceCents / 100).toFixed(2)}`}>
                <p>{p.description}</p>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
