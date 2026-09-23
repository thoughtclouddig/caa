import { getMentors } from "@/lib/queries";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "Mentorship" };
export const dynamic = "force-dynamic";

export default async function MentorshipPage() {
  const people = await getMentors();
  const mentors = people.filter((p) => p.role === "mentor");
  const seeking = people.filter((p) => p.role === "seeking");

  return (
    <>
      <PageHero eyebrow="Mentorship" title="Mentors and those looking"
        lede="Matched by the part of aviation you work in." />
      <section className="section shell">
        <h2>Offering mentorship</h2>
        {mentors.length === 0 ? <Empty>No one has offered yet.</Empty> : (
          <Rows>
            {mentors.map((m) => (
              <Row key={m.id} title={m.name} meta={m.specialty ?? m.aviationRole ?? undefined}>
                <p>{m.note}</p>
              </Row>
            ))}
          </Rows>
        )}

        <h2 style={{ marginTop: "2.5rem" }}>Looking for a mentor</h2>
        {seeking.length === 0 ? <Empty>No requests yet.</Empty> : (
          <Rows>
            {seeking.map((m) => (
              <Row key={m.id} title={m.name} meta={m.specialty ?? m.aviationRole ?? undefined}>
                <p>{m.note}</p>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
