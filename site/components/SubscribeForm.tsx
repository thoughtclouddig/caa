"use client";

import { useActionState } from "react";
import { subscribeAction, type FormState } from "@/lib/actions";
import { Field, Checkbox, Notice } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import styles from "./SubscribeForm.module.css";

/**
 * Signing up for the newsletter.
 *
 * The consent box is unticked and the form will not proceed without it.
 * A pre-ticked box is not consent, and for a list CAA intends to keep for
 * years it is worth being able to say exactly when each person agreed.
 */
export default function SubscribeForm({ source = "website" }: { source?: string }) {
  const [state, action] = useActionState<FormState, FormData>(subscribeAction, {});

  if (state.ok) {
    return <Notice tone="ok">{state.ok}</Notice>;
  }

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="source" value={source} />
      {state.error && <Notice tone="warn">{state.error}</Notice>}

      <Field label="Name" name="name" defaultValue={state.values?.name} autoComplete="name" />
      <Field label="Email" name="email" type="email" required
        defaultValue={state.values?.email} autoComplete="email" />

      <Checkbox
        label="Yes, send me CAA updates"
        name="consent"
        help="A few times a year. You can leave at any time from a link in every issue, and CAA does not pass your address to anyone."
      />

      <SubmitButton>Sign Up for Updates</SubmitButton>
    </form>
  );
}
