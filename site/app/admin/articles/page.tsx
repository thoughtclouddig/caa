import Link from "next/link";
import { adminListArticles } from "@/lib/queries";
import { setArticleStatusAction, setFeaturedArticleAction, deleteArticleAction } from "@/lib/actions";
import { AdminHeader, Flash, Table, Pill, EmptyState, Toolbar } from "@/components/admin/AdminUI";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata = { title: "Articles" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function AdminArticles({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const rows = await adminListArticles();

  return (
    <div className="shell">
      <AdminHeader
        title="Articles"
        lede="Chapter news, member stories and announcements. The one marked as the homepage lead runs large on the front page and at the top of the articles index."
        action={
          <Link href="/admin/articles/new" className="btn btn--primary">
            Write an article
          </Link>
        }
      />

      {saved && <Flash message="Article saved." />}

      {rows.length === 0 ? (
        <EmptyState
          action={
            <Link href="/admin/articles/new" className="btn btn--primary">
              Write the first one
            </Link>
          }
        >
          No articles yet.
        </EmptyState>
      ) : (
        <Table head={["Article", "Status", "Published", "Homepage", ""]}>
          {rows.map((a) => (
            <tr key={a.id}>
              <td>
                <Link href={`/admin/articles/${a.id}`} style={{ fontWeight: 600 }}>
                  {a.title}
                </Link>
                {!a.imagePath && (
                  <div style={{ fontSize: "0.8rem", color: "var(--slate)", marginTop: "0.2rem" }}>
                    No image yet
                  </div>
                )}
              </td>
              <td>
                {a.status === "published" ? (
                  <Pill tone="live">Live</Pill>
                ) : a.status === "draft" ? (
                  <Pill tone="draft">Draft</Pill>
                ) : (
                  <Pill tone="muted">Archived</Pill>
                )}
              </td>
              <td>{a.publishedAt ? fmt.format(a.publishedAt) : "—"}</td>
              <td>
                <form action={setFeaturedArticleAction.bind(null, a.id)}>
                  <button
                    type="submit"
                    className={a.isFeatured ? "btn btn--primary" : "btn btn--ghost"}
                    style={{ padding: "0.3rem 0.7rem", minHeight: "auto", fontSize: "0.78rem" }}
                  >
                    {a.isFeatured ? "Leading" : "Make lead"}
                  </button>
                </form>
              </td>
              <td>
                <Toolbar>
                  {a.status === "published" ? (
                    <form action={setArticleStatusAction.bind(null, a.id, "draft")}>
                      <button type="submit" className="btn btn--ghost"
                        style={{ padding: "0.35rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>
                        Unpublish
                      </button>
                    </form>
                  ) : (
                    <form action={setArticleStatusAction.bind(null, a.id, "published")}>
                      <button type="submit" className="btn btn--ghost"
                        style={{ padding: "0.35rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>
                        Publish
                      </button>
                    </form>
                  )}
                  <Link href={`/articles/${a.slug}`} className="btn btn--ghost"
                    style={{ padding: "0.35rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>
                    View
                  </Link>
                  <DeleteButton action={deleteArticleAction.bind(null, a.id)} />
                </Toolbar>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
