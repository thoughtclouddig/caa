import { getPage } from "@/lib/queries";
import { PageHero } from "@/components/ui";
import { bodyToHtml } from "@/lib/richtext";
import { org } from "@/content/site";

export const metadata = { title: "Contact" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const page = await getPage("contact");
  return (
    <>
      <PageHero eyebrow="Contact" title={page?.title ?? "Contact"} />
      <section className="section shell shell--narrow">
        {page?.body && (
          /* Sanitised on save; see lib/richtext.ts. */
          <div
            className="prose rich"
            style={{ maxWidth: "none" }}
            dangerouslySetInnerHTML={{ __html: bodyToHtml(page.body) }}
          />
        )}
        <p className="prose" style={{ maxWidth: "none", marginTop: "1.5rem" }}>
          Write to us at <a href={`mailto:${org.email}`}>{org.email}</a>.
        </p>
      </section>
    </>
  );
}
