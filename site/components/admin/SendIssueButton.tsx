"use client";

import { useState, useTransition } from "react";
import styles from "./AdminUI.module.css";

/**
 * Sending asks once, and says how many people it is about to reach.
 *
 * A newsletter cannot be recalled. The count is in the confirmation
 * because "send" means nothing until you know whether it is going to four
 * people or four hundred.
 */
export default function SendIssueButton({
  action,
  count,
}: {
  action: () => Promise<void>;
  count: number;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!armed) {
    return (
      <button type="button" className={styles.send} onClick={() => setArmed(true)}>
        Send
      </button>
    );
  }

  return (
    <span className={styles.confirmRow}>
      <button
        type="button"
        className={styles.sendSolid}
        disabled={pending}
        onClick={() => startTransition(() => { void action(); })}
      >
        {pending ? "Sending…" : `Send to ${count} ${count === 1 ? "person" : "people"}`}
      </button>
      <button type="button" className={styles.quiet} onClick={() => setArmed(false)}>
        Cancel
      </button>
    </span>
  );
}
