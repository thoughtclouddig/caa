import Link from "next/link";
import { adminListResources } from "@/lib/queries";
import { deleteResourceAction } from "@/lib/actions";
import { AdminHeader, Flash, Table, Pill, EmptyState, Toolbar } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata = { title: "Resources" };
export const dynamic = "force-dynamic";

export default async function AdminResources({
  searchParams,
}: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const rows = await adminListResources();

  return (
    <div className="shell">
      <AdminHeader
        title="Resources"
        lede="Formation, prayer and practical help. Each one is a real page on the site; an empty one says so rather than pretending."
        action={<Link href="/admin/resources/new" className="btn btn--primary">Add a resource</Link>}
      />

      {saved && <Flash message="Resource saved." />}

      {rows.length === 0 ? (
        <EmptyState action={<Link href="/admin/resources/new" className="btn btn--primary">Add the first one</Link>}>
          Nothing listed yet.
        </EmptyState>
      ) : (
        <Table head={["Resource", "Category", "Written", "Status", ""]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <Link href={`/admin/resources/${r.id}`} style={{ fontWeight: 600 }}>{r.title}</Link>
              </td>
              <td>{r.category}</td>
              <td>{r.body ? "Yes" : <span style={{ color: "var(--slate)" }}>Empty</span>}</td>
              <td>
                {r.status === "published"
                  ? <Pill tone="live">Live</Pill>
                  : r.status === "draft"
                    ? <Pill tone="draft">Draft</Pill>
                    : <Pill tone="muted">Archived</Pill>}
              </td>
              <td>
                <Toolbar>
                  <Link href={`/resources/${r.slug}`} className="btn btn--ghost"
                    style={{ padding: "0.35rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>View</Link>
                  <DeleteButton action={deleteResourceAction.bind(null, r.id)} />
                </Toolbar>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
