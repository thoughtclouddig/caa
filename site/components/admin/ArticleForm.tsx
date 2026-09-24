"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveArticleAction, type FormState } from "@/lib/actions";
import ImagePicker from "./ImagePicker";
import RichTextEditor from "./RichTextEditor";
import SubmitButton from "@/components/SubmitButton";
import styles from "./Form.module.css";

type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  authorName: string | null;
  imagePath: string | null;
  imageAlt: string | null;
  imageCredit: string | null;
  photoBrief: string | null;
  status: "draft" | "published" | "archived";
};

/**
 * Write or edit an article.
 *
 * The web address is derived from the title and only revealed when the
 * author asks for it, because for a new article it is noise and for a
 * published one it is something to change carefully.
 */
export default function ArticleForm({
  article,
  bodyHtml = "",
}: {
  article?: Article;
  /** The stored body as HTML, converted server-side if it predates the editor. */
  bodyHtml?: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(saveArticleAction, {});
  const [showSlug, setShowSlug] = useState(Boolean(article));

  /**
   * Prefer what was just typed over what is stored. React empties an
   * uncontrolled form after its action returns, so on a rejected save the
   * echoed values are what put the work back in front of the author.
   */
  const v = state.values;

  return (
    <form action={action} className={styles.form} key={state.error ?? "clean"}>
      {article && <input type="hidden" name="id" value={article.id} />}
      {state.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.grid}>
        <div className={styles.main}>
          <label className={styles.label} htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            className={styles.titleInput}
            defaultValue={v?.title ?? article?.title}
            placeholder="A Glider Fuselage Becomes a Flight Simulator"
            required
          />

          {showSlug ? (
            <>
              <label className={styles.label} htmlFor="slug">Web address</label>
              <div className={styles.slugRow}>
                <span className={styles.slugPrefix}>/articles/</span>
                <input
                  id="slug"
                  name="slug"
                  className={styles.input}
                  defaultValue={v?.slug ?? article?.slug}
                  placeholder="left-blank-it-comes-from-the-title"
                />
              </div>
              <p className={styles.help}>
                {article
                  ? "Changing this breaks any link already shared to this article."
                  : "Leave blank and it is made from the title."}
              </p>
            </>
          ) : (
            <button type="button" className={styles.linkish} onClick={() => setShowSlug(true)}>
              Set the web address by hand
            </button>
          )}

          <label className={styles.label} htmlFor="excerpt">Standfirst</label>
          <textarea
            id="excerpt"
            name="excerpt"
            className={styles.textarea}
            rows={2}
            defaultValue={v?.excerpt ?? article?.excerpt ?? ""}
            placeholder="One or two sentences. Shown under the headline and on the articles index."
          />

          <p className={styles.label}>Article</p>
          <RichTextEditor
            name="body"
            initialHtml={v?.body ?? bodyHtml}
            ariaLabel="Article body"
          />
        </div>

        <aside className={styles.side}>
          <div className={styles.sideBlock}>
            <h2 className={styles.sideTitle}>Publishing</h2>
            <label className={styles.label} htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className={styles.input}
              defaultValue={v?.status ?? article?.status ?? "draft"}
            >
              <option value="draft">Draft, nobody else can see it</option>
              <option value="published">Published, live on the site</option>
              <option value="archived">Archived, taken off the site</option>
            </select>

            <label className={styles.label} htmlFor="authorName">Byline</label>
            <input
              id="authorName"
              name="authorName"
              className={styles.input}
              defaultValue={v?.authorName ?? article?.authorName ?? "CAA"}
              placeholder="CAA"
            />
            <p className={styles.help}>A person, or a chapter, or just CAA.</p>
          </div>

          <div className={styles.actions}>
            <SubmitButton>{article ? "Save changes" : "Create article"}</SubmitButton>
            <Link href="/admin/articles" className={styles.cancel}>Cancel</Link>
          </div>
        </aside>
      </div>

      <div className={styles.imageBlock}>
        <h2 className={styles.sideTitle}>Lead image</h2>
        <ImagePicker
          initialPath={v?.imagePath ?? article?.imagePath}
          initialAlt={v?.imageAlt ?? article?.imageAlt}
          initialCredit={v?.imageCredit ?? article?.imageCredit}
          initialBrief={v?.photoBrief ?? article?.photoBrief}
        />
      </div>
    </form>
  );
}
