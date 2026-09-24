"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveProductAction, type FormState } from "@/lib/actions";
import ImagePicker from "./ImagePicker";
import SubmitButton from "@/components/SubmitButton";
import styles from "./Form.module.css";

type Product = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  imagePath: string | null;
  imageAlt: string | null;
  photoBrief: string | null;
  printfulProductId: string | null;
  sortOrder: number;
  active: boolean;
};

export default function ProductForm({ product }: { product?: Product }) {
  const [state, action] = useActionState<FormState, FormData>(saveProductAction, {});
  const v = state.values;

  return (
    <form action={action} className={styles.form} key={state.error ?? "clean"}>
      {product && <input type="hidden" name="id" value={product.id} />}
      {state.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.grid}>
        <div className={styles.main}>
          <label className={styles.label} htmlFor="name">Item name</label>
          <input id="name" name="name" className={styles.titleInput}
            defaultValue={v?.name ?? product?.name} placeholder="CAA polo shirt" required />

          <label className={styles.label} htmlFor="slug">Web address</label>
          <div className={styles.slugRow}>
            <span className={styles.slugPrefix}>/store/</span>
            <input id="slug" name="slug" className={styles.input}
              defaultValue={v?.slug ?? product?.slug} placeholder="caa-polo-shirt" />
          </div>

          <label className={styles.label} htmlFor="description">Description</label>
          <textarea id="description" name="description" className={styles.textarea} rows={3}
            defaultValue={v?.description ?? product?.description ?? ""}
            placeholder="What it is, and anything a buyer needs to know about sizing or material." />

          <div className={styles.pair}>
            <div>
              <label className={styles.label} htmlFor="price">Price (USD)</label>
              <input id="price" name="price" className={styles.input} inputMode="decimal"
                defaultValue={v?.price ?? (product ? (product.priceCents / 100).toFixed(2) : "")}
                placeholder="28.00" required />
            </div>
            <div>
              <label className={styles.label} htmlFor="sortOrder">Position</label>
              <input id="sortOrder" name="sortOrder" type="number" className={styles.input}
                defaultValue={v?.sortOrder ?? product?.sortOrder ?? 0} />
            </div>
          </div>
        </div>

        <aside className={styles.side}>
          <div className={styles.sideBlock}>
            <h2 className={styles.sideTitle}>Printful</h2>
            <label className={styles.label} htmlFor="printfulProductId">Printful product id</label>
            <input id="printfulProductId" name="printfulProductId" className={styles.input}
              defaultValue={v?.printfulProductId ?? product?.printfulProductId ?? ""}
              placeholder="e.g. 3901234" />
            <p className={styles.help}>
              From the synced product in Printful. CAA prints and ships
              through Printful rather than holding stock. The price above is
              what CAA charges; what printing costs is separate, and the
              difference is CAA&rsquo;s.
            </p>
          </div>

          <div className={styles.sideBlock} style={{ marginTop: "1.25rem" }}>
            <h2 className={styles.sideTitle}>Listing</h2>
            <label className={styles.checkRow}>
              <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
              <span>Show in the catalogue</span>
            </label>
          </div>

          <div className={styles.actions}>
            <SubmitButton>{product ? "Save changes" : "Add item"}</SubmitButton>
            <Link href="/admin/store" className={styles.cancel}>Cancel</Link>
          </div>
        </aside>
      </div>

      <div className={styles.imageBlock}>
        <h2 className={styles.sideTitle}>Product photograph</h2>
        <ImagePicker
          initialPath={v?.imagePath ?? product?.imagePath}
          initialAlt={v?.imageAlt ?? product?.imageAlt}
          initialBrief={v?.photoBrief ?? product?.photoBrief}
        />
      </div>
    </form>
  );
}
