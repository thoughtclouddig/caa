"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveChapterAction, type FormState } from "@/lib/actions";
import SubmitButton from "@/components/SubmitButton";
import styles from "./Form.module.css";

type Chapter = {
  id: number;
  slug: string;
  name: string;
  city: string | null;
  region: string | null;
  description: string | null;
  meetingSchedule: string | null;
  status: "forming" | "active" | "dormant";
  latitude: number | null;
  longitude: number | null;
};

export default function ChapterForm({ chapter }: { chapter?: Chapter }) {
  const [state, action] = useActionState<FormState, FormData>(saveChapterAction, {});
  const v = state.values;

  return (
    <form action={action} className={styles.form} key={state.error ?? "clean"}>
      {chapter && <input type="hidden" name="id" value={chapter.id} />}
      {state.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.grid}>
        <div className={styles.main}>
          <label className={styles.label} htmlFor="name">Chapter name</label>
          <input id="name" name="name" className={styles.titleInput}
            defaultValue={v?.name ?? chapter?.name} placeholder="CAA Kansas City" required />

          <label className={styles.label} htmlFor="slug">Web address</label>
          <div className={styles.slugRow}>
            <span className={styles.slugPrefix}>/chapters/</span>
            <input id="slug" name="slug" className={styles.input}
              defaultValue={v?.slug ?? chapter?.slug} placeholder="caa-kansas-city" />
          </div>
          <p className={styles.help}>
            {chapter
              ? "Changing this breaks any link already shared to this chapter."
              : "Leave blank and it is made from the name."}
          </p>

          <label className={styles.label} htmlFor="description">Description</label>
          <textarea id="description" name="description" className={styles.textarea} rows={3}
            defaultValue={v?.description ?? chapter?.description ?? ""}
            placeholder="Who the chapter serves, and anything it is known for." />

          <div className={styles.pair}>
            <div>
              <label className={styles.label} htmlFor="city">City</label>
              <input id="city" name="city" className={styles.input}
                defaultValue={v?.city ?? chapter?.city ?? ""} placeholder="Kansas City" />
            </div>
            <div>
              <label className={styles.label} htmlFor="region">State or region</label>
              <input id="region" name="region" className={styles.input}
                defaultValue={v?.region ?? chapter?.region ?? ""} placeholder="Missouri" />
            </div>
          </div>

          <label className={styles.label} htmlFor="meetingSchedule">Meeting schedule</label>
          <input id="meetingSchedule" name="meetingSchedule" className={styles.input}
            defaultValue={v?.meetingSchedule ?? chapter?.meetingSchedule ?? ""} placeholder="Monthly" />
        </div>

        <aside className={styles.side}>
          <div className={styles.sideBlock}>
            <h2 className={styles.sideTitle}>Status</h2>
            <select id="status" name="status" className={styles.input}
              defaultValue={v?.status ?? chapter?.status ?? "forming"}>
              <option value="forming">Forming</option>
              <option value="active">Active</option>
              <option value="dormant">Dormant</option>
            </select>
          </div>

          <div className={styles.sideBlock} style={{ marginTop: "1.25rem" }}>
            <h2 className={styles.sideTitle}>Place on the map</h2>
            <div className={styles.pair}>
              <div>
                <label className={styles.label} htmlFor="latitude">Latitude</label>
                <input id="latitude" name="latitude" className={styles.input}
                  defaultValue={v?.latitude ?? chapter?.latitude ?? ""} placeholder="39.0997" inputMode="decimal" />
              </div>
              <div>
                <label className={styles.label} htmlFor="longitude">Longitude</label>
                <input id="longitude" name="longitude" className={styles.input}
                  defaultValue={v?.longitude ?? chapter?.longitude ?? ""} placeholder="-94.5786" inputMode="decimal" />
              </div>
            </div>
            <p className={styles.help}>
              The city centre is close enough. Leave both blank and the
              chapter is listed without a pin. Search the city name plus
              &ldquo;coordinates&rdquo; to find them.
            </p>
          </div>

          <div className={styles.actions}>
            <SubmitButton>{chapter ? "Save changes" : "Add chapter"}</SubmitButton>
            <Link href="/admin/chapters" className={styles.cancel}>Cancel</Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
