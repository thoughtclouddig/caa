import { getUpcomingEvents, getMyRsvps } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { rsvpAction } from "@/lib/actions";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "Events" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" });

export default async function PortalEventsPage() {
  const user = await requireUser();
  const [events, mine] = await Promise.all([getUpcomingEvents(50), getMyRsvps(user.id)]);
  const byId = new Map(mine.map((m) => [m.event.id, m.status]));

  return (
    <>
      <PageHero eyebrow="Events" title="What is coming up" />
      <section className="section shell">
        {events.length === 0 ? <Empty>Nothing scheduled.</Empty> : (
          <Rows>
            {events.map((e) => (
              <Row key={e.id} title={e.title} meta={fmt.format(e.startsAt)}>
                <p>{e.description}</p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.7rem", flexWrap: "wrap" }}>
                  {(["going", "interested", "declined"] as const).map((s) => (
                    <form key={s} action={rsvpAction.bind(null, e.id, s)}>
                      <button type="submit"
                        className={byId.get(e.id) === s ? "btn btn--primary" : "btn btn--ghost"}
                        style={{ padding: "0.4rem 0.9rem", minHeight: "auto", fontSize: "0.82rem" }}>
                        {s}
                      </button>
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
