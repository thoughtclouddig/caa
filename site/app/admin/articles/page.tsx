import { adminListArticles } from "@/lib/queries";
import { setArticleStatusAction, setFeaturedArticleAction } from "@/lib/actions";
import { PageHero, Rows, Row, Empty } from "@/components/ui";

export const metadata = { title: "Articles" };
export const dynamic = "force-dynamic";

const STATES = ["draft", "published", "archived"] as const;

export default async function AdminStories() {
  const rows = await adminListArticles();
  return (
    <>
      <PageHero eyebrow="Articles" title="Publishing" />
      <section className="section shell">
        {rows.length === 0 ? <Empty>No articles yet.</Empty> : (
          <Rows>
            {rows.map((s) => (
              <Row key={s.id} title={s.title} meta={s.isFeatured ? "Homepage lead" : s.authorName ?? undefined}>
                <p>{s.excerpt}</p>
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem" }}>
                  {STATES.map((st) => (
                    <form key={st} action={setArticleStatusAction.bind(null, s.id, st)}>
                      <button type="submit"
                        className={s.status === st ? "btn btn--primary" : "btn btn--ghost"}
                        style={{ padding: "0.3rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>{st}</button>
                    </form>
                  ))}
                  <form action={setFeaturedArticleAction.bind(null, s.id)}>
                    <button type="submit"
                      className={s.isFeatured ? "btn btn--primary" : "btn btn--ghost"}
                      style={{ padding: "0.3rem 0.8rem", minHeight: "auto", fontSize: "0.8rem" }}>
                      {s.isFeatured ? "leading the homepage" : "make homepage lead"}
                    </button>
                  </form>
                </div>
              </Row>
            ))}
          </Rows>
        )}
      </section>
    </>
  );
}
