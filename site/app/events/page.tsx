import { getUpcomingEvents } from "@/lib/queries";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "Events" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" });

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="What Is Coming Up"
        lede="The worldwide Aviation Mass, and the chapter events anyone may attend."
      />
      <section className="section shell">
        {events.length === 0 ? (
          <Empty>Nothing is scheduled yet.</Empty>
        ) : (
          <Rows>
            {events.map((e) => (
              <Row key={e.id} title={e.title} meta={fmt.format(e.startsAt)}>
                <p>{e.description}</p>
                {e.location && <p>{e.location}</p>}
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
