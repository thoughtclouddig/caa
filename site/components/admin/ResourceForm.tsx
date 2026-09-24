"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveResourceAction, type FormState } from "@/lib/actions";
import RichTextEditor from "./RichTextEditor";
import SubmitButton from "@/components/SubmitButton";
import styles from "./Form.module.css";

type Resource = {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  sortOrder: number;
  status: "draft" | "published" | "archived";
};

export default function ResourceForm({
  resource,
  bodyHtml = "",
  categories,
}: {
  resource?: Resource;
  bodyHtml?: string;
  categories: string[];
}) {
  const [state, action] = useActionState<FormState, FormData>(saveResourceAction, {});
  const v = state.values;

  return (
    <form action={action} className={styles.form} key={state.error ?? "clean"}>
      {resource && <input type="hidden" name="id" value={resource.id} />}
      {state.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.grid}>
        <div className={styles.main}>
          <label className={styles.label} htmlFor="title">Title</label>
          <input id="title" name="title" className={styles.titleInput}
            defaultValue={v?.title ?? resource?.title}
            placeholder="Airport Chapels Directory" required />

          <label className={styles.label} htmlFor="slug">Web address</label>
          <div className={styles.slugRow}>
            <span className={styles.slugPrefix}>/resources/</span>
            <input id="slug" name="slug" className={styles.input}
              defaultValue={v?.slug ?? resource?.slug} placeholder="airport-chapels" />
          </div>

          <label className={styles.label} htmlFor="summary">Summary</label>
          <textarea id="summary" name="summary" className={styles.textarea} rows={2}
            defaultValue={v?.summary ?? resource?.summary ?? ""}
            placeholder="One line. Shown on the Resources index." />

          <p className={styles.label}>The page itself</p>
          <RichTextEditor name="body" initialHtml={v?.body ?? bodyHtml} ariaLabel="Resource body" />
        </div>

        <aside className={styles.side}>
          <div className={styles.sideBlock}>
            <h2 className={styles.sideTitle}>Placing</h2>
            <label className={styles.label} htmlFor="category">Category</label>
            <input id="category" name="category" className={styles.input} list="resource-categories"
              defaultValue={v?.category ?? resource?.category ?? ""} placeholder="Formation" required />
            <datalist id="resource-categories">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
            <p className={styles.help}>
              Resources group by category on the index. Reuse an existing one
              unless this really is a new kind.
            </p>

            <label className={styles.label} htmlFor="sortOrder">Position</label>
            <input id="sortOrder" name="sortOrder" type="number" className={styles.input}
              defaultValue={v?.sortOrder ?? resource?.sortOrder ?? 0} />

            <label className={styles.label} htmlFor="status">Status</label>
            <select id="status" name="status" className={styles.input}
              defaultValue={v?.status ?? resource?.status ?? "draft"}>
              <option value="draft">Draft, nobody else can see it</option>
              <option value="published">Published, live on the site</option>
              <option value="archived">Archived, taken off the site</option>
            </select>
          </div>

          <div className={styles.actions}>
            <SubmitButton>{resource ? "Save changes" : "Add resource"}</SubmitButton>
            <Link href="/admin/resources" className={styles.cancel}>Cancel</Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
