import { adminPendingPrayers } from "@/lib/queries";
import { moderatePrayerAction } from "@/lib/actions";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "Prayer queue" };
export const dynamic = "force-dynamic";

export default async function AdminPrayer() {
  const pending = await adminPendingPrayers();

  return (
    <>
      <PageHero eyebrow="Prayer queue" title="Intentions awaiting review"
        lede="Nothing appears publicly until it is approved here." />
      <section className="section shell">
        {pending.length === 0 ? <Empty>The queue is clear.</Empty> : (
          <Rows>
            {pending.map((p) => (
              <Row key={p.id} title={p.intention}
                meta={`${p.displayName}${p.isPublic ? " · requested public" : " · private"}`}>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                  <form action={moderatePrayerAction.bind(null, p.id, "approved")}>
                    <button className="btn btn--primary" type="submit"
                      style={{ padding: "0.4rem 0.9rem", minHeight: "auto", fontSize: "0.82rem" }}>Approve</button>
                  </form>
                  <form action={moderatePrayerAction.bind(null, p.id, "rejected")}>
                    <button className="btn btn--ghost" type="submit"
                      style={{ padding: "0.4rem 0.9rem", minHeight: "auto", fontSize: "0.82rem" }}>Reject</button>
                  </form>
                </div>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
