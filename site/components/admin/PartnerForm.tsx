"use client";

import { useActionState } from "react";
import Link from "next/link";
import { savePartnerAction, type FormState } from "@/lib/actions";
import SubmitButton from "@/components/SubmitButton";
import styles from "./Form.module.css";

type Partner = {
  id: number;
  name: string;
  url: string | null;
  blurb: string | null;
  memberOffer: string | null;
  tier: "friend" | "partner" | "supporter";
  sortOrder: number;
  active: boolean;
};

export default function PartnerForm({ partner }: { partner?: Partner }) {
  const [state, action] = useActionState<FormState, FormData>(savePartnerAction, {});
  const v = state.values;

  return (
    <form action={action} className={styles.form} key={state.error ?? "clean"}>
      {partner && <input type="hidden" name="id" value={partner.id} />}
      {state.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.grid}>
        <div className={styles.main}>
          <label className={styles.label} htmlFor="name">Partner name</label>
          <input id="name" name="name" className={styles.titleInput}
            defaultValue={v?.name ?? partner?.name} placeholder="Avemco Insurance Company" required />

          <label className={styles.label} htmlFor="url">Website</label>
          <input id="url" name="url" className={styles.input} type="url"
            defaultValue={v?.url ?? partner?.url ?? ""} placeholder="https://avemco.com" />

          <label className={styles.label} htmlFor="blurb">What they do</label>
          <textarea id="blurb" name="blurb" className={styles.textarea} rows={4}
            defaultValue={v?.blurb ?? partner?.blurb ?? ""}
            placeholder="In CAA's words, not theirs. Why this partnership fits the mission." />

          <label className={styles.label} htmlFor="memberOffer">What a member gets</label>
          <input id="memberOffer" name="memberOffer" className={styles.input}
            defaultValue={v?.memberOffer ?? partner?.memberOffer ?? ""}
            placeholder="5% discount for CAA members" />
          <p className={styles.help}>
            Leave blank where there is no member offer. Angel Flight NE is a
            partnership without one.
          </p>
        </div>

        <aside className={styles.side}>
          <div className={styles.sideBlock}>
            <h2 className={styles.sideTitle}>Listing</h2>
            <label className={styles.label} htmlFor="tier">Kind</label>
            <select id="tier" name="tier" className={styles.input}
              defaultValue={v?.tier ?? partner?.tier ?? "partner"}>
              <option value="partner">Corporate partner</option>
              <option value="supporter">Supporter</option>
              <option value="friend">Friend</option>
            </select>

            <label className={styles.label} htmlFor="sortOrder">Position</label>
            <input id="sortOrder" name="sortOrder" type="number" className={styles.input}
              defaultValue={v?.sortOrder ?? partner?.sortOrder ?? 0} />

            <label className={styles.checkRow}>
              <input type="checkbox" name="active" defaultChecked={partner?.active ?? true} />
              <span>Show on the site</span>
            </label>
          </div>

          <div className={styles.actions}>
            <SubmitButton>{partner ? "Save changes" : "Add partner"}</SubmitButton>
            <Link href="/admin/partners" className={styles.cancel}>Cancel</Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
