import Link from "next/link";
import { adminListProducts } from "@/lib/queries";
import { deleteProductAction } from "@/lib/actions";
import { AdminHeader, Flash, Table, Pill, EmptyState, Toolbar } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata = { title: "Store" };
export const dynamic = "force-dynamic";

export default async function AdminStore({
  searchParams,
}: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const rows = await adminListProducts();
  const unlinked = rows.filter((r) => !r.printfulProductId).length;

  return (
    <div className="shell">
      <AdminHeader
        title="Store"
        lede="The product catalogue. CAA prints and ships through Printful rather than holding stock, so each item here points at something Printful makes."
        action={<Link href="/admin/store/new" className="btn btn--primary">Add an item</Link>}
      />

      {saved && <Flash message="Item saved." />}
      {rows.length > 0 && unlinked > 0 && (
        <Flash
          tone="warn"
          message={`${unlinked} ${unlinked === 1 ? "item is" : "items are"} not linked to Printful yet. They are listed but nothing can be fulfilled until a Printful product id is set, and checkout is not connected either way.`}
        />
      )}

      {rows.length === 0 ? (
        <EmptyState action={<Link href="/admin/store/new" className="btn btn--primary">Add the first one</Link>}>
          Nothing in the catalogue yet.
        </EmptyState>
      ) : (
        <Table head={["Item", "Price", "Printful", "Listed", ""]}>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/admin/store/${p.id}`} style={{ fontWeight: 600 }}>{p.name}</Link>
                {!p.imagePath && (
                  <div style={{ fontSize: "0.8rem", color: "var(--slate)", marginTop: "0.2rem" }}>
                    No photograph
                  </div>
                )}
              </td>
              <td>${(p.priceCents / 100).toFixed(2)}</td>
              <td>
                {p.printfulProductId
                  ? <Pill tone="live">Linked</Pill>
                  : <Pill tone="draft">Not linked</Pill>}
              </td>
              <td>{p.active ? <Pill tone="live">Listed</Pill> : <Pill tone="muted">Hidden</Pill>}</td>
              <td>
                <Toolbar>
                  <DeleteButton action={deleteProductAction.bind(null, p.id)} />
                </Toolbar>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
