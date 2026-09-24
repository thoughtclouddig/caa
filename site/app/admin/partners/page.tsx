import Link from "next/link";
import { adminListPartners } from "@/lib/queries";
import { deletePartnerAction } from "@/lib/actions";
import { AdminHeader, Flash, Table, Pill, EmptyState, Toolbar } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata = { title: "Partners" };
export const dynamic = "force-dynamic";

export default async function AdminPartners({
  searchParams,
}: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const rows = await adminListPartners();

  return (
    <div className="shell">
      <AdminHeader
        title="Corporate Partners"
        lede="Organisations which demonstrate fidelity to Catholic teaching and offer members an alternative to companies funding abortion."
        action={<Link href="/admin/partners/new" className="btn btn--primary">Add a partner</Link>}
      />

      {saved && <Flash message="Partner saved." />}

      {rows.length === 0 ? (
        <EmptyState action={<Link href="/admin/partners/new" className="btn btn--primary">Add the first one</Link>}>
          No partners listed yet.
        </EmptyState>
      ) : (
        <Table head={["Partner", "What members get", "Kind", "Listed", ""]}>
          {rows.map((s) => (
            <tr key={s.id}>
              <td>
                <Link href={`/admin/partners/${s.id}`} style={{ fontWeight: 600 }}>{s.name}</Link>
              </td>
              <td style={{ maxWidth: "22rem" }}>{s.memberOffer ?? "—"}</td>
              <td style={{ textTransform: "capitalize" }}>{s.tier}</td>
              <td>{s.active ? <Pill tone="live">Listed</Pill> : <Pill tone="muted">Hidden</Pill>}</td>
              <td>
                <Toolbar>
                  <DeleteButton action={deletePartnerAction.bind(null, s.id)} />
                </Toolbar>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
