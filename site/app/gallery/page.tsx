import Image from "next/image";
import { GALLERY } from "@/content/gallery";
import { PageHero } from "@/components/ui";
import styles from "./gallery.module.css";

export const metadata = {
  title: "Photo Gallery",
  description: "Photographs of the Catholic Aviation Association at work.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Photo Gallery"
        title="The Association at Work"
        lede="Chapters, aircraft, gatherings and the Sacraments. All of it CAA's own, taken by members."
      />

      <section className="section shell">
        <ul className={styles.grid}>
          {GALLERY.map((photo, i) => (
            <li
              key={photo.src}
              className={`${styles.item} ${photo.tall ? styles.tall : ""}`}
            >
              <figure className={styles.figure}>
                <div className={styles.frame}>
                  <Image
                    src={photo.src}
                    alt={photo.caption}
                    fill
                    sizes="(min-width: 62rem) 32vw, (min-width: 42rem) 48vw, 100vw"
                    className={styles.image}
                    priority={i < 3}
                  />
                </div>
                <figcaption className={styles.caption}>
                  {photo.caption}
                  {photo.credit && (
                    <span className={styles.credit}>Photo: {photo.credit}</span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
