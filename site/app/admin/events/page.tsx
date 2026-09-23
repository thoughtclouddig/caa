import { adminListEvents } from "@/lib/queries";
import { setEventStatusAction } from "@/lib/actions";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "Events" };
export const dynamic = "force-dynamic";

const STATES = ["draft", "published", "archived"] as const;
const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminEvents() {
  const rows = await adminListEvents();
  return (
    <>
      <PageHero eyebrow="Events" title="Event Management" />
      <section className="section shell">
        {rows.length === 0 ? <Empty>No events yet.</Empty> : (
          <Rows>
            {rows.map((e) => (
              <Row key={e.id} title={e.title} meta={fmt.format(e.startsAt)}>
                <p>{e.location}</p>
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem" }}>
                  {STATES.map((st) => (
                    <form key={st} action={setEventStatusAction.bind(null, e.id, st)}>
                      <button type="submit"
                        className={e.status === st ? "btn btn--primary" : "btn btn--ghost"}
                        style={{ padding: "0.3rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>{st}</button>
                    </form>
                  ))}
                </div>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
