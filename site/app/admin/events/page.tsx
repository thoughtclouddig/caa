import Link from "next/link";
import { adminListEvents } from "@/lib/queries";
import { setEventStatusAction, deleteEventAction } from "@/lib/actions";
import { AdminHeader, Flash, Table, Pill, EmptyState, Toolbar } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata = { title: "Events" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminEvents({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const rows = await adminListEvents();
  const now = Date.now();

  return (
    <div className="shell">
      <AdminHeader
        title="Events"
        lede="The Aviation Mass, chapter meetings and anything else with a date on it."
        action={<Link href="/admin/events/new" className="btn btn--primary">Add an event</Link>}
      />

      {saved && <Flash message="Event saved." />}

      {rows.length === 0 ? (
        <EmptyState
          action={<Link href="/admin/events/new" className="btn btn--primary">Add the first one</Link>}
        >
          No events yet.
        </EmptyState>
      ) : (
        <Table head={["Event", "When", "Where", "Status", "Open to", ""]}>
          {rows.map((e) => (
            <tr key={e.id}>
              <td>
                <Link href={`/admin/events/${e.id}`} style={{ fontWeight: 600 }}>{e.title}</Link>
              </td>
              <td>
                {fmt.format(e.startsAt)}
                {e.startsAt.getTime() < now && (
                  <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>Past</div>
                )}
              </td>
              <td>{e.location ?? "—"}</td>
              <td>
                {e.status === "published" ? (
                  <Pill tone="live">Live</Pill>
                ) : e.status === "draft" ? (
                  <Pill tone="draft">Draft</Pill>
                ) : (
                  <Pill tone="muted">Archived</Pill>
                )}
              </td>
              <td>{e.isPublic ? "Anyone" : "Members"}</td>
              <td>
                <Toolbar>
                  {e.status === "published" ? (
                    <form action={setEventStatusAction.bind(null, e.id, "draft")}>
                      <button type="submit" className="btn btn--ghost"
                        style={{ padding: "0.35rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>
                        Unpublish
                      </button>
                    </form>
                  ) : (
                    <form action={setEventStatusAction.bind(null, e.id, "published")}>
                      <button type="submit" className="btn btn--ghost"
                        style={{ padding: "0.35rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>
                        Publish
                      </button>
                    </form>
                  )}
                  <DeleteButton action={deleteEventAction.bind(null, e.id)} />
                </Toolbar>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
