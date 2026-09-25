import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getMyRsvps, getPublicPrayerRequests } from "@/lib/queries";
import { PageHero, Rows, Row, Empty, StatRow, Stat } from "@/components/ui";
import { MEMBERSHIP_STATUS, ROLE, RSVP_STATUS, label } from "@/lib/labels";

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
          <Stat label="Membership" value={label(MEMBERSHIP_STATUS, user.membershipStatus)} />
          <Stat label="Events booked" value={rsvps.length} />
          <Stat label="Role" value={label(ROLE, user.role)} />
        </StatRow>

        <h2 style={{ marginTop: "2.5rem" }}>Your next events</h2>
        {rsvps.length === 0 ? (
          <Empty>Nothing booked. <Link href="/portal/events">See what is coming up</Link>.</Empty>
        ) : (
          <Rows>
            {rsvps.map((r) => (
              <Row key={r.event.id} title={r.event.title} meta={fmt.format(r.event.startsAt)}>
                <p>{label(RSVP_STATUS, r.status)}</p>
              </Row>
            ))}
          </Rows>
        )}

        {/*
          These are the association's public intentions, not this member's
          own. The old heading said "Prayer intentions" on a personal
          dashboard, which read as if they belonged to whoever was signed
          in.
        */}
        <h2 style={{ marginTop: "2.5rem" }}>Pray for one another</h2>
        <p className="prose" style={{ marginTop: "0.6rem" }}>
          Intentions members have asked the association to carry.{" "}
          <Link href="/portal/prayer">Add yours, or say you are praying</Link>.
        </p>
        {prayers.length === 0 ? (
          <Empty>
            No intentions have been published yet.{" "}
            <Link href="/portal/prayer">Be the first to ask</Link>.
          </Empty>
        ) : (
          <Rows>
            {prayers.map((p) => (
              <Row
                key={p.id}
                title={p.intention}
                meta={
                  p.pledges === 0
                    ? p.displayName
                    : `${p.displayName} · ${p.pledges} praying`
                }
              />
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
