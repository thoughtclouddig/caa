import Link from "next/link";
import { getPage } from "@/lib/queries";
import { bodyToHtml } from "@/lib/richtext";
import { PageHero } from "@/components/ui";

export const metadata = {
  title: "Letter from the Chairman",
  description: "Tom Beckenbauer on why the Catholic Aviation Association exists.",
};
export const dynamic = "force-dynamic";

export default async function ChairmanLetter() {
  const page = await getPage("letter-from-the-chairman");

  return (
    <>
      <PageHero
        eyebrow="About"
        title="Letter From the Chairman"
        lede="Tom Beckenbauer, on why the association was founded."
      >
        <Link className="btn btn--ghost" href="/about">Back to About</Link>
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
