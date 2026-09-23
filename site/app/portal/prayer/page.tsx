import { getPublicPrayerRequests } from "@/lib/queries";
import { pledgePrayerAction } from "@/lib/actions";
import { PageHero, Rows, Row, Empty } from "@/components/ui";
import PrayerForm from "./PrayerForm";

export const metadata = { title: "Prayer requests" };
export const dynamic = "force-dynamic";

export default async function PrayerPage() {
  const requests = await getPublicPrayerRequests(40);

  return (
    <>
      <PageHero eyebrow="Prayer" title="Prayer requests"
        lede="Intentions are shown with a first name only, and are reviewed before they appear." />

      <section className="section shell">
        <PrayerForm />

        <h2 style={{ marginTop: "3rem" }}>Current intentions</h2>
        {requests.length === 0 ? <Empty>No intentions yet.</Empty> : (
          <Rows>
            {requests.map((r) => (
              <Row key={r.id} title={r.intention} meta={`${r.displayName} · ${r.pledges} praying`}>
                <form action={pledgePrayerAction.bind(null, r.id)}>
                  <button className="btn btn--ghost" type="submit"
                    style={{ padding: "0.45rem 1rem", minHeight: "auto", fontSize: "0.85rem" }}>
                    I am praying for this
                  </button>
                </form>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
