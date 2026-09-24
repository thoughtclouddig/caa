import Link from "next/link";
import { EDITABLE_PAGES } from "@/content/editable-pages";
import { getPage } from "@/lib/queries";
import { toPlainText } from "@/lib/richtext";
import { AdminHeader, Flash, Table } from "@/components/admin/AdminUI";

export const metadata = { title: "Page copy" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function AdminPages({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const rows = await Promise.all(
    EDITABLE_PAGES.map(async (p) => ({ ...p, stored: await getPage(p.slug) })),
  );

  return (
    <div className="shell">
      <AdminHeader
        title="Page Copy"
        lede="Blocks of text on pages that are otherwise fixed. Everything else on the public site is either an article, a chapter, an event, or part of the design."
      />

      {saved && <Flash message="Page saved." />}

      <Table head={["Block", "Where it appears", "Last changed", ""]}>
        {rows.map((p) => (
          <tr key={p.slug}>
            <td>
              <Link href={`/admin/pages/${p.slug}`} style={{ fontWeight: 600 }}>
                {p.title}
              </Link>
              <div style={{ fontSize: "0.82rem", color: "var(--slate)", marginTop: "0.2rem", maxWidth: "40ch" }}>
                {p.stored?.body ? toPlainText(p.stored.body, 90) : "Nothing written yet."}
              </div>
            </td>
            <td style={{ maxWidth: "24rem" }}>{p.where}</td>
            <td>{p.stored ? fmt.format(p.stored.updatedAt) : "—"}</td>
            <td>
              <Link href={`/admin/pages/${p.slug}`} className="btn btn--ghost"
                style={{ padding: "0.35rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
