import { getPage } from "@/lib/queries";
import { org } from "@/content/site";
import { PageHero } from "@/components/ui";

export const metadata = { title: "About" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const page = await getPage("about");

  return (
    <>
      <PageHero eyebrow="About" title={page?.title ?? "About CAA"} lede={org.mission} />
      <section className="section shell shell--narrow">
        <p className="prose" style={{ maxWidth: "none" }}>{page?.body}</p>
      </section>
    </>
  );
}
