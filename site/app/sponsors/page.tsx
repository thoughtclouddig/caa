import { getSponsors } from "@/lib/queries";
import { PageHero, Empty } from "@/components/ui";
import styles from "./sponsors.module.css";

export const metadata = {
  title: "Corporate Partners",
  description:
    "Organisations that demonstrate fidelity to Catholic teaching, and what CAA members get from them.",
};
export const dynamic = "force-dynamic";

export default async function SponsorsPage() {
  const rows = await getSponsors();

  return (
    <>
      <PageHero
        eyebrow="Corporate Partners"
        title="Partners Who Share the Mission"
        lede="Partner affiliation is about organisations which demonstrate fidelity to Catholic teaching, and which offer you alternatives to sources that support abortion and other morally unacceptable practices."
      />

      <section className="section shell">
        {rows.length === 0 ? (
          <Empty>No partners are listed yet.</Empty>
        ) : (
          <div className={styles.grid}>
            {rows.map((s) => (
              <article key={s.id} className={styles.card}>
                <h2 className={styles.name}>
                  {s.url ? (
                    <a href={s.url} className={styles.link} rel="noopener noreferrer">
                      {s.name}
                    </a>
                  ) : (
                    s.name
                  )}
                </h2>
                {s.blurb && <p className={styles.blurb}>{s.blurb}</p>}
                {/* The offer is the practical part, so it gets the gold
                    rule rather than being buried in the paragraph. */}
                {s.memberOffer && (
                  <p className={styles.offer}>{s.memberOffer}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
