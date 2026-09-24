import { getResources } from "@/lib/queries";
import { PageHero, Empty } from "@/components/ui";
import styles from "./resources.module.css";
import Link from "next/link";

export const metadata = {
  title: "Resources",
  description: "Formation, prayer and practical help, kept on CAA's own pages.",
};
export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = await getResources();

  // Grouped by category so Formation, Travel and Youth read as sections
  // rather than one undifferentiated list.
  const groups = new Map<string, typeof resources>();
  for (const r of resources) {
    const existing = groups.get(r.category) ?? [];
    existing.push(r);
    groups.set(r.category, existing);
  }

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Formation, Prayer and Practical Help"
        lede="Everything here lives on CAA's own pages, so you are not sent off somewhere else to find it."
      />

      <section className="section shell">
        {resources.length === 0 ? (
          <Empty>Nothing published yet.</Empty>
        ) : (
          [...groups.entries()].map(([category, items]) => (
            <div key={category} className={styles.group}>
              <h2 className={styles.groupHeading}>{category}</h2>
              <div className={styles.grid}>
                {items.map((r) => (
                  <Link key={r.id} href={`/resources/${r.slug}`} className={styles.card}>
                    <h3 className={styles.cardTitle}>{r.title}</h3>
                    {r.summary && <p className={styles.cardBody}>{r.summary}</p>}
                    <span className={styles.go} aria-hidden="true">&rarr;</span>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}
