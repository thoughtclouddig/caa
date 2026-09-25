import { adminListMessages } from "@/lib/queries";
import { setMessageStatusAction, deleteMessageAction } from "@/lib/actions";
import { findMemberLocation } from "@/content/member-locations";
import { AdminHeader, Flash, Table, Pill, EmptyState, Toolbar } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminMessages() {
  const rows = await adminListMessages();
  const unread = rows.filter((r) => r.status === "new").length;

  return (
    <div className="shell">
      <AdminHeader
        title="Messages"
        lede={
          unread > 0
            ? `${unread} ${unread === 1 ? "message has" : "messages have"} not been read yet.`
            : "Everything here has been read."
        }
      />

      <Flash
        tone="warn"
        message="Messages are not forwarded by email yet, because no mail provider is connected. They wait here instead, which is why somebody needs to look."
      />

      {rows.length === 0 ? (
        <EmptyState>Nobody has written yet.</EmptyState>
      ) : (
        <Table head={["From", "About", "Message", "Received", "Status", ""]}>
          {rows.map((m) => {
            const place = findMemberLocation(m.locationSlug);
            return (
              <tr key={m.id}>
                <td>
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>
                    <a href={`mailto:${m.email}`}>{m.email}</a>
                  </div>
                  {place && (
                    <div style={{ fontSize: "0.8rem", color: "var(--slate)" }}>{place.label}</div>
                  )}
                </td>
                <td>{m.topic ?? "—"}</td>
                <td style={{ maxWidth: "26rem", whiteSpace: "pre-wrap" }}>{m.message}</td>
                <td>{fmt.format(m.createdAt)}</td>
                <td>
                  {m.status === "new" ? (
                    <Pill tone="alert">New</Pill>
                  ) : m.status === "replied" ? (
                    <Pill tone="live">Replied</Pill>
                  ) : m.status === "spam" ? (
                    <Pill tone="muted">Spam</Pill>
                  ) : (
                    <Pill tone="muted">Read</Pill>
                  )}
                </td>
                <td>
                  <Toolbar>
                    {m.status === "new" && (
                      <form action={setMessageStatusAction.bind(null, m.id, "read")}>
                        <button type="submit" className="btn btn--ghost"
                          style={{ padding: "0.35rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>
                          Mark read
                        </button>
                      </form>
                    )}
                    {m.status !== "replied" && (
                      <form action={setMessageStatusAction.bind(null, m.id, "replied")}>
                        <button type="submit" className="btn btn--ghost"
                          style={{ padding: "0.35rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>
                          Replied
                        </button>
                      </form>
                    )}
                    <DeleteButton action={deleteMessageAction.bind(null, m.id)} />
                  </Toolbar>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}
