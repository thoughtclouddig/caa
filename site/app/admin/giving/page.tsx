import { adminListDonations } from "@/lib/queries";
import { AdminHeader, Flash, Table, Pill, EmptyState } from "@/components/admin/AdminUI";
import { PAYMENT_STATUS, DONATION_KIND, label } from "@/lib/labels";

export const metadata = { title: "Giving" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

/**
 * Recorded giving.
 *
 * Every row here is an intention, not a payment. No processor is
 * connected, so nothing has been charged and processorRef is empty on all
 * of them. When a processor is wired up these are the rows to reconcile
 * against, which is why they are kept rather than discarded.
 */
export default async function AdminGiving() {
  const rows = await adminListDonations();
  const total = rows.reduce((sum, r) => sum + r.amountCents, 0);

  return (
    <div className="shell">
      <AdminHeader
        title="Giving"
        lede={`${rows.length} ${rows.length === 1 ? "intention" : "intentions"} recorded, totalling $${(total / 100).toFixed(2)}.`}
      />

      <Flash
        tone="warn"
        message="None of this money has been received. The giving form records an intention; no payment processor is connected, so nothing has been charged. When one is wired up, reconcile against these rows."
      />

      {rows.length === 0 ? (
        <EmptyState>Nobody has used the giving form yet.</EmptyState>
      ) : (
        <Table head={["Date", "Who", "Amount", "For", "Status", "Note"]}>
          {rows.map((d) => (
            <tr key={d.id}>
              <td>{fmt.format(d.createdAt)}</td>
              <td>
                {d.userName ?? d.donorName ?? "Not given"}
                {d.donorEmail && (
                  <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>{d.donorEmail}</div>
                )}
              </td>
              <td>${(d.amountCents / 100).toFixed(2)}</td>
              <td>{label(DONATION_KIND, d.kind)}</td>
              <td>
                {d.status === "pending"
                  ? <Pill tone="draft">Not charged</Pill>
                  : <Pill tone="live">{label(PAYMENT_STATUS, d.status)}</Pill>}
              </td>
              <td style={{ maxWidth: "20rem" }}>{d.note ?? "—"}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
