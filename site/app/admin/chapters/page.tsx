import Link from "next/link";
import { getActiveChapters } from "@/lib/queries";
import { deleteChapterAction } from "@/lib/actions";
import { AdminHeader, Flash, Table, Pill, EmptyState, Toolbar } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata = { title: "Chapters" };
export const dynamic = "force-dynamic";

export default async function AdminChapters({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const chapters = await getActiveChapters();

  return (
    <div className="shell">
      <AdminHeader
        title="Chapters"
        lede="Every chapter listed on the site. A chapter with coordinates appears as a pin on the map; one without is still listed."
        action={
          <Link href="/admin/chapters/new" className="btn btn--primary">
            Add a chapter
          </Link>
        }
      />

      {saved && <Flash message="Chapter saved." />}

      {chapters.length === 0 ? (
        <EmptyState
          action={<Link href="/admin/chapters/new" className="btn btn--primary">Add the first one</Link>}
        >
          No chapters yet.
        </EmptyState>
      ) : (
        <Table head={["Chapter", "Where", "Status", "On the map", ""]}>
          {chapters.map((c) => (
            <tr key={c.id}>
              <td>
                <Link href={`/admin/chapters/${c.id}`} style={{ fontWeight: 600 }}>
                  {c.name}
                </Link>
              </td>
              <td>{[c.city, c.region].filter(Boolean).join(", ") || "—"}</td>
              <td>
                {c.status === "active" ? (
                  <Pill tone="live">Active</Pill>
                ) : c.status === "forming" ? (
                  <Pill tone="draft">Forming</Pill>
                ) : (
                  <Pill tone="muted">Dormant</Pill>
                )}
              </td>
              <td>
                {c.latitude !== null && c.longitude !== null ? "Pinned" : "Not pinned"}
              </td>
              <td>
                <Toolbar>
                  <Link href={`/chapters/${c.slug}`} className="btn btn--ghost"
                    style={{ padding: "0.35rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>
                    View
                  </Link>
                  <DeleteButton action={deleteChapterAction.bind(null, c.id)} />
                </Toolbar>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
