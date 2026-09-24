import { AdminHeader } from "@/components/admin/AdminUI";
import ArticleForm from "@/components/admin/ArticleForm";

export const metadata = { title: "Write an article" };

export default function NewArticle() {
  return (
    <div className="shell">
      <AdminHeader
        title="Write an Article"
        back={{ href: "/admin/articles", label: "All articles" }}
      />
      <ArticleForm />
    </div>
  );
}
