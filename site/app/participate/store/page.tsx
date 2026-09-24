import Image from "next/image";
import { getProducts } from "@/lib/queries";
import { PageHero, Empty, Notice } from "@/components/ui";
import PhotoSlot from "@/components/PhotoSlot";
import styles from "./store.module.css";

export const metadata = {
  title: "CAA Product Catalog",
  description: "Association merchandise, printed and shipped to order.",
};
export const dynamic = "force-dynamic";

export default async function StorePage() {
  const products = await getProducts();

  return (
    <>
      <PageHero
        eyebrow="CAA Store"
        title="CAA Product Catalog"
        lede="Wear it, carry it, or give it away. Everything is printed and shipped to order, so CAA holds no stock and nothing is wasted."
      />

      <section className="section shell">
        <Notice>
          This is the catalogue, not a shop yet. Checkout needs a payment
          processor, which CAA is still setting up, so nothing can be bought
          here today and the prices shown are provisional.
        </Notice>

        {products.length === 0 ? (
          <Empty>Nothing listed yet.</Empty>
        ) : (
          <div className={styles.grid}>
            {products.map((p) => (
              <article key={p.id} className={styles.card}>
                {p.imagePath ? (
                  <div className={styles.frame}>
                    <Image
                      src={p.imagePath}
                      alt={p.imageAlt ?? p.name}
                      fill
                      sizes="(min-width: 62rem) 30vw, (min-width: 42rem) 46vw, 100vw"
                      className={styles.image}
                    />
                  </div>
                ) : (
                  <PhotoSlot brief={p.photoBrief ?? ""} ratio="1 / 1" />
                )}
                <h2 className={styles.name}>{p.name}</h2>
                {p.description && <p className={styles.blurb}>{p.description}</p>}
                <p className={styles.price}>${(p.priceCents / 100).toFixed(2)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
