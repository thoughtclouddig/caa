import { getPage } from "@/lib/queries";
import { PageHero } from "@/components/ui";

export const metadata = { title: "Contact" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const page = await getPage("contact");
  return (
    <>
      <PageHero eyebrow="Contact" title={page?.title ?? "Contact"} />
      <section className="section shell shell--narrow">
        <p className="prose" style={{ maxWidth: "none" }}>{page?.body}</p>
      </section>
    </>
  );
}
