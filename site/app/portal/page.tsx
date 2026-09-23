import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getMyRsvps, getPublicPrayerRequests } from "@/lib/queries";
import { PageHero, Rows, Row, Empty, StatRow, Stat } from "@/components/ui";

export const metadata = { title: "Member dashboard" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function PortalHome() {
  const user = await requireUser();
  const [rsvps, prayers] = await Promise.all([
    getMyRsvps(user.id),
    getPublicPrayerRequests(5),
  ]);

  return (
    <>
      <PageHero eyebrow={`Signed in as ${user.email}`} title={`Welcome, ${user.name.split(" ")[0]}`} />

      <section className="section shell">
        <StatRow>
          <Stat label="Membership" value={user.membershipStatus} />
          <Stat label="Events booked" value={rsvps.length} />
          <Stat label="Role" value={user.role.replace("_", " ")} />
        </StatRow>

        <h2 style={{ marginTop: "2.5rem" }}>Your next events</h2>
        {rsvps.length === 0 ? (
          <Empty>Nothing booked. <Link href="/portal/events">See what is coming up</Link>.</Empty>
        ) : (
          <Rows>
            {rsvps.map((r) => (
              <Row key={r.event.id} title={r.event.title} meta={fmt.format(r.event.startsAt)}>
                <p>{r.status}</p>
              </Row>
            ))}
          </Rows>
        )}

        <h2 style={{ marginTop: "2.5rem" }}>Prayer intentions</h2>
        {prayers.length === 0 ? <Empty>No intentions yet.</Empty> : (
          <Rows>
            {prayers.map((p) => (
              <Row key={p.id} title={p.intention} meta={`${p.displayName} · ${p.pledges} praying`} />
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
