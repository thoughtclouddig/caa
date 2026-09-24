import Link from "next/link";
import { getPublishedIssues } from "@/lib/queries";
import { PageHero, Rows, Row, Empty } from "@/components/ui";
import SubscribeForm from "@/components/SubscribeForm";

export const metadata = {
  title: "Newsletter",
  description:
    "Every issue of the Catholic Aviation Association newsletter, and how to have the next one sent to you.",
};
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export default async function NewsletterPage() {
  const issues = await getPublishedIssues();

  return (
    <>
      <PageHero
        eyebrow="Newsletter"
        title="Sign Up for Updates"
        lede="Chapter news, member stories and what the association is asking of us, a few times a year. Every issue is kept here whether or not you subscribe."
      />

      <section className="section shell shell--narrow">
        <SubscribeForm source="newsletter page" />
      </section>

      <section className="section--warm">
        <div className="section shell">
          <h2>Past Issues</h2>
          {issues.length === 0 ? (
            <Empty>No issues have been published yet.</Empty>
          ) : (
            <Rows>
              {issues.map((i) => (
                <Row
                  key={i.id}
                  title={i.title}
                  href={`/newsletter/${i.slug}`}
                  meta={i.publishedAt ? fmt.format(i.publishedAt) : undefined}
                />
              ))}
            </Rows>
          )}
          <p className="prose" style={{ marginTop: "2rem" }}>
            Looking for something older? <Link href="/contact">Write to us</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
