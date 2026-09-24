"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveEventAction, type FormState } from "@/lib/actions";
import SubmitButton from "@/components/SubmitButton";
import styles from "./Form.module.css";

type EventRecord = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: Date;
  chapterId: number | null;
  isPublic: boolean;
  status: "draft" | "published" | "archived";
};

/** datetime-local wants the local wall clock with no zone suffix. */
function forInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function EventForm({
  event,
  chapters,
}: {
  event?: EventRecord;
  chapters: { id: number; name: string }[];
}) {
  const [state, action] = useActionState<FormState, FormData>(saveEventAction, {});
  const v = state.values;

  return (
    <form action={action} className={styles.form} key={state.error ?? "clean"}>
      {event && <input type="hidden" name="id" value={event.id} />}
      {state.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.grid}>
        <div className={styles.main}>
          <label className={styles.label} htmlFor="title">Event title</label>
          <input id="title" name="title" className={styles.titleInput}
            defaultValue={v?.title ?? event?.title} placeholder="Annual Aviation Mass" required />

          <label className={styles.label} htmlFor="slug">Web address</label>
          <div className={styles.slugRow}>
            <span className={styles.slugPrefix}>/events/</span>
            <input id="slug" name="slug" className={styles.input}
              defaultValue={v?.slug ?? event?.slug} placeholder="annual-aviation-mass" />
          </div>
          <p className={styles.help}>
            {event ? "Changing this breaks any link already shared." : "Leave blank and it is made from the title."}
          </p>

          <label className={styles.label} htmlFor="description">Description</label>
          <textarea id="description" name="description" className={styles.textarea} rows={4}
            defaultValue={v?.description ?? event?.description ?? ""}
            placeholder="What it is, who it is for, and anything someone needs to bring or know." />

          <div className={styles.pair}>
            <div>
              <label className={styles.label} htmlFor="startsAt">Date and time</label>
              <input id="startsAt" name="startsAt" type="datetime-local" className={styles.input}
                defaultValue={v?.startsAt ?? (event ? forInput(event.startsAt) : "")} required />
            </div>
            <div>
              <label className={styles.label} htmlFor="location">Location</label>
              <input id="location" name="location" className={styles.input}
                defaultValue={v?.location ?? event?.location ?? ""} placeholder="Indianapolis, Indiana" />
            </div>
          </div>
        </div>

        <aside className={styles.side}>
          <div className={styles.sideBlock}>
            <h2 className={styles.sideTitle}>Publishing</h2>
            <label className={styles.label} htmlFor="status">Status</label>
            <select id="status" name="status" className={styles.input}
              defaultValue={v?.status ?? event?.status ?? "draft"}>
              <option value="draft">Draft, nobody else can see it</option>
              <option value="published">Published, live on the site</option>
              <option value="archived">Archived, taken off the site</option>
            </select>

            <label className={styles.label} htmlFor="chapterId">Chapter</label>
            <select id="chapterId" name="chapterId" className={styles.input}
              defaultValue={v?.chapterId ?? (event?.chapterId ? String(event.chapterId) : "")}>
              <option value="">Association-wide</option>
              {chapters.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>

            <label className={styles.checkRow}>
              <input type="checkbox" name="isPublic" defaultChecked={v ? v.isPublic === "on" : event?.isPublic ?? true} />
              <span>Anyone may attend</span>
            </label>
            <p className={styles.help}>
              Unchecked, the event shows only to signed-in members.
            </p>
          </div>

          <div className={styles.actions}>
            <SubmitButton>{event ? "Save changes" : "Add event"}</SubmitButton>
            <Link href="/admin/events" className={styles.cancel}>Cancel</Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
