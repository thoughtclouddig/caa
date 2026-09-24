import { notFound } from "next/navigation";
import { adminGetArticle } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/AdminUI";
import ArticleForm from "@/components/admin/ArticleForm";

export const metadata = { title: "Edit article" };
export const dynamic = "force-dynamic";

export default async function EditArticle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await adminGetArticle(Number(id));
  if (!article) notFound();

  return (
    <div className="shell">
      <AdminHeader
        title="Edit Article"
        back={{ href: "/admin/articles", label: "All articles" }}
      />
      <ArticleForm article={article} />
    </div>
  );
}
