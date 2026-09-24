"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveIssueAction, type FormState } from "@/lib/actions";
import RichTextEditor from "./RichTextEditor";
import SubmitButton from "@/components/SubmitButton";
import styles from "./Form.module.css";
import pick from "./IssueForm.module.css";

type Issue = {
  id: number;
  slug: string;
  title: string;
  intro: string | null;
  status: "draft" | "published" | "sent";
};

type ArticleChoice = {
  id: number;
  title: string;
  publishedAt: Date | null;
  chosen: boolean;
  sortOrder: number;
};

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

/**
 * Assembling an issue.
 *
 * Articles are ticked and numbered rather than dragged: drag ordering is
 * pleasant with a mouse and miserable with anything else, and a newsletter
 * carries a handful of items, not fifty.
 */
export default function IssueForm({
  issue,
  introHtml = "",
  articles,
}: {
  issue?: Issue;
  introHtml?: string;
  articles: ArticleChoice[];
}) {
  const [state, action] = useActionState<FormState, FormData>(saveIssueAction, {});
  const v = state.values;
  const [chosen, setChosen] = useState<Record<number, boolean>>(
    Object.fromEntries(articles.map((a) => [a.id, a.chosen])),
  );

  const chosenCount = Object.values(chosen).filter(Boolean).length;

  return (
    <form action={action} className={styles.form} key={state.error ?? "clean"}>
      {issue && <input type="hidden" name="id" value={issue.id} />}
      {state.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.grid}>
        <div className={styles.main}>
          <label className={styles.label} htmlFor="title">Issue title</label>
          <input id="title" name="title" className={styles.titleInput}
            defaultValue={v?.title ?? issue?.title}
            placeholder="CAA Update — Autumn" required />
          <p className={styles.help}>This becomes the email subject line.</p>

          <label className={styles.label} htmlFor="slug">Web address</label>
          <div className={styles.slugRow}>
            <span className={styles.slugPrefix}>/newsletter/</span>
            <input id="slug" name="slug" className={styles.input}
              defaultValue={v?.slug ?? issue?.slug} placeholder="caa-update-autumn" />
          </div>

          <p className={styles.label}>A note to open with</p>
          <RichTextEditor name="intro" initialHtml={v?.intro ?? introHtml}
            ariaLabel="Introduction to the issue" />
          <p className={styles.help}>Optional. A few lines in your own voice before the articles.</p>

          <p className={styles.label}>
            Articles in this issue{chosenCount > 0 && <span className={pick.count}>{chosenCount} chosen</span>}
          </p>
          {articles.length === 0 ? (
            <p className={styles.help}>
              No published articles yet. <Link href="/admin/articles/new">Write one first.</Link>
            </p>
          ) : (
            <ul className={pick.list}>
              {articles.map((a) => (
                <li key={a.id} className={chosen[a.id] ? pick.on : undefined}>
                  <label className={pick.row}>
                    <input
                      type="checkbox"
                      name={`article-${a.id}`}
                      defaultChecked={a.chosen}
                      onChange={(e) =>
                        setChosen((c) => ({ ...c, [a.id]: e.target.checked }))
                      }
                    />
                    <span className={pick.name}>{a.title}</span>
                    <span className={pick.date}>
                      {a.publishedAt ? fmt.format(a.publishedAt) : "Not published"}
                    </span>
                  </label>
                  <input
                    type="number"
                    name={`order-${a.id}`}
                    defaultValue={a.sortOrder}
                    min={0}
                    aria-label={`Position of ${a.title} in the issue`}
                    className={pick.order}
                    disabled={!chosen[a.id]}
                  />
                </li>
              ))}
            </ul>
          )}
          <p className={styles.help}>
            The number sets the order. Lowest first; ties keep the order shown here.
          </p>
        </div>

        <aside className={styles.side}>
          <div className={styles.sideBlock}>
            <h2 className={styles.sideTitle}>Publishing</h2>
            <select id="status" name="status" className={styles.input}
              defaultValue={v?.status ?? issue?.status ?? "draft"}>
              <option value="draft">Draft, nobody else can see it</option>
              <option value="published">Published to the archive</option>
            </select>
            <p className={styles.help}>
              Publishing puts the issue in the public archive. Sending it to
              the list is a separate, deliberate step afterwards.
            </p>
          </div>

          <div className={styles.actions}>
            <SubmitButton>{issue ? "Save changes" : "Create issue"}</SubmitButton>
            <Link href="/admin/newsletter" className={styles.cancel}>Cancel</Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
