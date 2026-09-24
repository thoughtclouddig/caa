import Link from "next/link";
import { getPage } from "@/lib/queries";
import { bodyToHtml } from "@/lib/richtext";
import { PageHero } from "@/components/ui";

export const metadata = {
  title: "Come Follow Me",
  description: "What it is to respond to grace, and what CAA gathers into one place.",
};
export const dynamic = "force-dynamic";

export default async function ComeFollowMe() {
  const page = await getPage("come-follow-me");

  return (
    <>
      <PageHero
        eyebrow="Participate"
        title="Come Follow Me"
        lede="The possibilities are literally limitless."
      >
        <Link className="btn btn--primary" href="/register">Join CAA</Link>
      </PageHero>

      <section className="section shell shell--narrow">
        {page?.body && (
          <div
            className="rich"
            style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", lineHeight: 1.75 }}
            dangerouslySetInnerHTML={{ __html: bodyToHtml(page.body) }}
          />
        )}
      </section>
    </>
  );
}
