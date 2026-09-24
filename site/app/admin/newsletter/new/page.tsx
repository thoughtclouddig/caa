import { getPublishedArticles } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/AdminUI";
import IssueForm from "@/components/admin/IssueForm";

export const metadata = { title: "Start an issue" };
export const dynamic = "force-dynamic";

export default async function NewIssue() {
  const articles = await getPublishedArticles(40);

  return (
    <div className="shell">
      <AdminHeader title="Start an Issue" back={{ href: "/admin/newsletter", label: "All issues" }} />
      <IssueForm
        articles={articles.map((a, i) => ({
          id: a.id,
          title: a.title,
          publishedAt: a.publishedAt,
          chosen: false,
          sortOrder: i,
        }))}
      />
    </div>
  );
}
