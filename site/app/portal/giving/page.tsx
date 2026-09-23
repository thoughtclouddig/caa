import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getMyDonations } from "@/lib/queries";
import { PageHero, Rows, Row, Empty, Notice } from "@/components/ui";

export const metadata = { title: "Giving" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function GivingPage() {
  const user = await requireUser();
  const rows = await getMyDonations(user.id);

  return (
    <>
      <PageHero eyebrow="Giving" title="Your giving history">
        <Link className="btn btn--primary" href="/participate/donate">Make a gift</Link>
      </PageHero>
      <section className="section shell">
        <Notice tone="warn">
          Payments are not connected yet, so anything here is recorded intent rather
          than a completed transaction.
        </Notice>
        {rows.length === 0 ? <Empty>Nothing recorded yet.</Empty> : (
          <Rows>
            {rows.map((d) => (
              <Row key={d.id} title={`$${(d.amountCents / 100).toFixed(2)} · ${d.kind.replace("_", " ")}`}
                meta={`${fmt.format(d.createdAt)} · ${d.status}`}>
                {d.note && <p>{d.note}</p>}
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
