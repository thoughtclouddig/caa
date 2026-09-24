import { notFound } from "next/navigation";
import { adminGetIssue, getIssueArticles, getPublishedArticles } from "@/lib/queries";
import { bodyToHtml } from "@/lib/richtext";
import { AdminHeader, Flash } from "@/components/admin/AdminUI";
import IssueForm from "@/components/admin/IssueForm";

export const metadata = { title: "Edit issue" };
export const dynamic = "force-dynamic";

export default async function EditIssue({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = await adminGetIssue(Number(id));
  if (!issue) notFound();

  const [inIssue, published] = await Promise.all([
    getIssueArticles(issue.id),
    getPublishedArticles(40),
  ]);

  const order = new Map(inIssue.map((a) => [a.id, a.sortOrder]));

  return (
    <div className="shell">
      <AdminHeader title="Edit Issue" back={{ href: "/admin/newsletter", label: "All issues" }} />

      {issue.sentAt && (
        <Flash
          tone="warn"
          message={`This issue was sent to ${issue.recipientCount ?? 0} people. Editing changes the archive copy; it cannot change an email already delivered, and it will not be sent again.`}
        />
      )}

      <IssueForm
        issue={issue}
        introHtml={issue.intro ? bodyToHtml(issue.intro) : ""}
        articles={published.map((a, i) => ({
          id: a.id,
          title: a.title,
          publishedAt: a.publishedAt,
          chosen: order.has(a.id),
          sortOrder: order.get(a.id) ?? i + 100,
        }))}
      />
    </div>
  );
}
