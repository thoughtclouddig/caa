"use client";

import { useActionState } from "react";
import { sendContactMessageAction, type FormState } from "@/lib/actions";
import { CONTACT_TOPICS } from "@/content/contact-topics";
import { MEMBER_LOCATIONS } from "@/content/member-locations";
import { Field, TextArea, Select, Notice } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import styles from "./ContactForm.module.css";

export default function ContactForm() {
  const [state, action] = useActionState<FormState, FormData>(sendContactMessageAction, {});
  const v = state.values;

  if (state.ok) {
    return <Notice tone="ok">{state.ok}</Notice>;
  }

  return (
    <form action={action} className={styles.form}>
      {state.error && <Notice tone="warn">{state.error}</Notice>}

      {/*
        Honeypot. Positioned off-screen rather than display:none, because
        some bots skip anything that is not rendered. Hidden from assistive
        technology and taken out of the tab order, so no person meets it.
      */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.pair}>
        <Field label="Your name" name="name" required autoComplete="name" defaultValue={v?.name} />
        <Field label="Email" name="email" type="email" required autoComplete="email" defaultValue={v?.email} />
      </div>

      <Select
        label="What is this about?"
        name="topic"
        defaultValue={v?.topic ?? ""}
        options={[
          { value: "", label: "Choose one" },
          ...CONTACT_TOPICS.map((t) => ({ value: t, label: t })),
        ]}
      />

      <Select
        label="Nearest city"
        name="locationSlug"
        defaultValue={v?.locationSlug ?? ""}
        options={[
          { value: "", label: "Rather not say" },
          ...MEMBER_LOCATIONS.map((l) => ({ value: l.slug, label: l.label })),
        ]}
        help="Optional, and only so we can point you to the nearest chapter. CAA never asks for your address."
      />

      <TextArea
        label="Your message"
        name="message"
        rows={6}
        required
        defaultValue={v?.message}
      />

      <SubmitButton>Send message</SubmitButton>
    </form>
  );
}
