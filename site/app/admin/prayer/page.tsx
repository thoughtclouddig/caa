import { adminPendingPrayers } from "@/lib/queries";
import { moderatePrayerAction } from "@/lib/actions";
import { AdminHeader, Table, EmptyState, Toolbar, Pill } from "@/components/admin/AdminUI";

export const metadata = { title: "Prayer queue" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function AdminPrayer() {
  const pending = await adminPendingPrayers();

  return (
    <div className="shell">
      <AdminHeader
        title="Prayer Queue"
        lede="Nothing appears publicly until it is approved here. Approved public intentions run across the band under the homepage hero, with a first name only."
      />

      {pending.length === 0 ? (
        <EmptyState>The queue is clear.</EmptyState>
      ) : (
        <Table head={["Intention", "Name shown", "Asked", "Requested", ""]}>
          {pending.map((p) => (
            <tr key={p.id}>
              <td style={{ maxWidth: "34rem" }}>{p.intention}</td>
              <td>{p.displayName}</td>
              <td>{fmt.format(p.createdAt)}</td>
              <td>
                {p.isPublic ? <Pill tone="live">Public</Pill> : <Pill tone="muted">CAA only</Pill>}
              </td>
              <td>
                <Toolbar>
                  <form action={moderatePrayerAction.bind(null, p.id, "approved")}>
                    <button className="btn btn--primary" type="submit"
                      style={{ padding: "0.35rem 0.9rem", minHeight: "auto", fontSize: "0.82rem" }}>
                      Approve
                    </button>
                  </form>
                  <form action={moderatePrayerAction.bind(null, p.id, "rejected")}>
                    <button className="btn btn--ghost" type="submit"
                      style={{ padding: "0.35rem 0.9rem", minHeight: "auto", fontSize: "0.82rem" }}>
                      Reject
                    </button>
                  </form>
                </Toolbar>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
