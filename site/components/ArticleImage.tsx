import Image from "next/image";
import PhotoSlot from "@/components/PhotoSlot";
import styles from "./ArticleImage.module.css";

type Article = {
  imagePath: string | null;
  imageAlt: string | null;
  imageCredit: string | null;
  photoBrief: string | null;
};

/**
 * An article's lead image.
 *
 * CAA's photographs come from members and are credited by name, so the
 * credit rides with the image rather than being dropped at the bottom of
 * the page. Where a photograph has not been supplied yet, the brief stands
 * in, which keeps the layout honest instead of cropping something unrelated
 * into the slot.
 */
export default function ArticleImage({
  article,
  ratio,
  sizes,
  priority = false,
  className = "",
}: {
  article: Article;
  ratio: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!article.imagePath) {
    return (
      <PhotoSlot
        brief={article.photoBrief ?? ""}
        ratio={ratio}
        className={className}
      />
    );
  }

  return (
    <figure className={`${styles.figure} ${className}`}>
      <div className={styles.frame} style={{ aspectRatio: ratio }}>
        <Image
          src={article.imagePath}
          alt={article.imageAlt ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
        />
      </div>
      {article.imageCredit && (
        <figcaption className={styles.credit}>{article.imageCredit}</figcaption>
      )}
    </figure>
  );
}
