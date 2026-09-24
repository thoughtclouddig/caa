import { adminListSubscribers } from "@/lib/queries";
import { AdminHeader, Table, Pill, EmptyState } from "@/components/admin/AdminUI";

export const metadata = { title: "Subscribers" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function Subscribers() {
  const rows = await adminListSubscribers();
  const active = rows.filter((r) => r.status === "subscribed").length;

  return (
    <div className="shell">
      <AdminHeader
        title="Subscribers"
        back={{ href: "/admin/newsletter", label: "Newsletter" }}
        lede={`${active} ${active === 1 ? "person" : "people"} will receive the next issue. Everyone here asked to be written to; nobody was added by joining CAA.`}
      />

      {rows.length === 0 ? (
        <EmptyState>Nobody has signed up yet.</EmptyState>
      ) : (
        <Table head={["Email", "Name", "Status", "Signed up", "Where from"]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.email}</td>
              <td>{r.name ?? "—"}</td>
              <td>
                {r.status === "subscribed" ? (
                  <Pill tone="live">Subscribed</Pill>
                ) : r.status === "unsubscribed" ? (
                  <Pill tone="muted">Left</Pill>
                ) : (
                  <Pill tone="draft">Bounced</Pill>
                )}
              </td>
              <td>{fmt.format(r.createdAt)}</td>
              <td>{r.source ?? "—"}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
