import Link from "next/link";
import { adminListIssues, countActiveSubscribers } from "@/lib/queries";
import { deleteIssueAction, sendIssueAction } from "@/lib/actions";
import { isEmailConfigured } from "@/lib/email";
import { AdminHeader, Flash, Table, Pill, EmptyState, Toolbar, Panel } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";
import SendIssueButton from "@/components/admin/SendIssueButton";

export const metadata = { title: "Newsletter" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function AdminNewsletter({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const [issues, subscribers] = await Promise.all([
    adminListIssues(),
    countActiveSubscribers(),
  ]);
  const configured = isEmailConfigured();

  return (
    <div className="shell">
      <AdminHeader
        title="Newsletter"
        lede="Issues are assembled from published articles. Publishing puts an issue in the public archive; sending it to the list is a separate step."
        action={
          <>
            <Link href="/admin/newsletter/new" className="btn btn--primary">Start an issue</Link>
            <Link href="/admin/newsletter/subscribers" className="btn btn--ghost">
              {subscribers} on the list
            </Link>
          </>
        }
      />

      {saved && <Flash message="Issue saved." />}

      {!configured && (
        <Flash
          tone="warn"
          message="No mail provider is connected, so nothing can be sent yet. Set RESEND_API_KEY and NEWSLETTER_FROM. Everything else works: issues publish to the archive and the list keeps growing."
        />
      )}

      <Panel>
        {issues.length === 0 ? (
          <EmptyState
            action={<Link href="/admin/newsletter/new" className="btn btn--primary">Start the first one</Link>}
          >
            No issues yet.
          </EmptyState>
        ) : (
          <Table head={["Issue", "Status", "Published", "Sent", ""]}>
            {issues.map((i) => (
              <tr key={i.id}>
                <td>
                  <Link href={`/admin/newsletter/${i.id}`} style={{ fontWeight: 600 }}>
                    {i.title}
                  </Link>
                </td>
                <td>
                  {i.status === "sent" ? (
                    <Pill tone="live">Sent</Pill>
                  ) : i.status === "published" ? (
                    <Pill tone="live">In the archive</Pill>
                  ) : (
                    <Pill tone="draft">Draft</Pill>
                  )}
                </td>
                <td>{i.publishedAt ? fmt.format(i.publishedAt) : "—"}</td>
                <td>
                  {i.sentAt
                    ? `${fmt.format(i.sentAt)} · ${i.recipientCount ?? 0}`
                    : "—"}
                </td>
                <td>
                  <Toolbar>
                    {i.status !== "draft" && (
                      <Link href={`/newsletter/${i.slug}`} className="btn btn--ghost"
                        style={{ padding: "0.35rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>
                        View
                      </Link>
                    )}
                    {!i.sentAt && i.status !== "draft" && configured && subscribers > 0 && (
                      <SendIssueButton
                        action={sendIssueAction.bind(null, i.id)}
                        count={subscribers}
                      />
                    )}
                    <DeleteButton action={deleteIssueAction.bind(null, i.id)} />
                  </Toolbar>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
