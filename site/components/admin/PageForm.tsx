"use client";

import { useActionState } from "react";
import Link from "next/link";
import { savePageAction, type FormState } from "@/lib/actions";
import RichTextEditor from "./RichTextEditor";
import SubmitButton from "@/components/SubmitButton";
import styles from "./Form.module.css";

export default function PageForm({
  slug,
  where,
  guidance,
  bodyHtml,
}: {
  slug: string;
  where: string;
  guidance: string;
  bodyHtml: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(savePageAction, {});
  const v = state.values;

  return (
    <form action={action} className={styles.form} key={state.error ?? "clean"}>
      <input type="hidden" name="slug" value={slug} />
      {state.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.grid}>
        <div className={styles.main}>
          <RichTextEditor
            name="body"
            initialHtml={v?.body ?? bodyHtml}
            ariaLabel="Page copy"
          />
        </div>

        <aside className={styles.side}>
          <div className={styles.sideBlock}>
            <h2 className={styles.sideTitle}>Where this appears</h2>
            <p className={styles.help}>{where}</p>
            <p className={styles.help} style={{ marginTop: "0.8rem" }}>{guidance}</p>
          </div>

          <div className={styles.actions}>
            <SubmitButton>Save changes</SubmitButton>
            <Link href="/admin/pages" className={styles.cancel}>Cancel</Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
