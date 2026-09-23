import { adminListMembers } from "@/lib/queries";
import { setMemberRoleAction, setMembershipStatusAction } from "@/lib/actions";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "Members" };
export const dynamic = "force-dynamic";

const ROLES = ["member", "chapter_leader", "admin"] as const;
const STATUSES = ["registered", "active", "lapsed", "honorary"] as const;

export default async function AdminMembers() {
  const members = await adminListMembers();

  return (
    <>
      <PageHero eyebrow="Members" title="Accounts and Membership" />
      <section className="section shell">
        {members.length === 0 ? <Empty>No accounts yet.</Empty> : (
          <Rows>
            {members.map((m) => (
              <Row key={m.id} title={m.name} meta={m.chapterName ?? "No chapter"}>
                <p>{m.email}</p>
                <div style={{ display: "flex", gap: "1.4rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
                  <span style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.8rem" }}>Role:</strong>
                    {ROLES.map((r) => (
                      <form key={r} action={setMemberRoleAction.bind(null, m.id, r)}>
                        <button type="submit"
                          className={m.role === r ? "btn btn--primary" : "btn btn--ghost"}
                          style={{ padding: "0.3rem 0.7rem", minHeight: "auto", fontSize: "0.78rem" }}>
                          {r.replace("_", " ")}
                        </button>
                      </form>
                    ))}
                  </span>
                  <span style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.8rem" }}>Status:</strong>
                    {STATUSES.map((s) => (
                      <form key={s} action={setMembershipStatusAction.bind(null, m.id, s)}>
                        <button type="submit"
                          className={m.membershipStatus === s ? "btn btn--primary" : "btn btn--ghost"}
                          style={{ padding: "0.3rem 0.7rem", minHeight: "auto", fontSize: "0.78rem" }}>
                          {s}
                        </button>
                      </form>
                    ))}
                  </span>
                </div>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
