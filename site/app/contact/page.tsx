import { getPage } from "@/lib/queries";
import { org } from "@/content/site";
import { bodyToHtml } from "@/lib/richtext";
import { PageHero } from "@/components/ui";
import ContactForm from "@/components/ContactForm";
import styles from "./contact.module.css";

export const metadata = {
  title: "Contact",
  description: "Write to the Catholic Aviation Association.",
};
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const page = await getPage("contact");

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in Touch"
        lede="Tell us where you are and what part of aviation you work in, and we will point you to the nearest chapter."
      />

      <section className="section shell">
        <div className={styles.layout}>
          <div className={styles.formCol}>
            <ContactForm />
          </div>

          <aside className={styles.aside}>
            {page?.body && (
              <div
                className="prose rich"
                dangerouslySetInnerHTML={{ __html: bodyToHtml(page.body) }}
              />
            )}

            <h2 className={styles.asideHeading}>By email</h2>
            <p className="prose">
              <a href={`mailto:${org.email}`}>{org.email}</a>
            </p>

            <h2 className={styles.asideHeading}>Starting a chapter?</h2>
            <p className="prose">
              There are four steps and we send you the materials.{" "}
              <a href="/participate/start-a-chapter">Read how it works</a>.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
