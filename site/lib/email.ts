import "server-only";

/**
 * Sending email.
 *
 * Resend is the provider, reached over its REST API rather than through an
 * SDK: one fetch call, no dependency to keep current, and swapping provider
 * means rewriting this file and nothing else. Everywhere in the app calls
 * `sendBroadcast` and knows nothing about who delivers it.
 *
 * The whole module degrades to a no-op when RESEND_API_KEY is absent, so
 * the site runs, subscriptions record and issues publish to the archive
 * with no mail account configured at all. Sending is the only thing that
 * waits.
 */

import { unsubscribeUrl } from "./urls";

const API = "https://api.resend.com/emails/batch";

/** Resend accepts at most 100 messages per batch call. */
const BATCH_SIZE = 100;

export type Recipient = {
  email: string;
  /** Used to build this person's own unsubscribe link. */
  token: string;
};

export type BroadcastResult = {
  sent: number;
  failed: { email: string; reason: string }[];
  /** True when nothing was attempted because no provider is configured. */
  skipped: boolean;
};

export { siteUrl, unsubscribeUrl } from "./urls";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM);
}

/**
 * Sends one message to many people, each addressed individually.
 *
 * Every recipient gets their own message rather than appearing in a shared
 * To or Bcc field, because a newsletter that exposes the list is a breach,
 * and because the unsubscribe link has to be theirs alone.
 */
export async function sendBroadcast({
  subject,
  html,
  recipients,
}: {
  subject: string;
  html: (unsubscribe: string) => string;
  recipients: Recipient[];
}): Promise<BroadcastResult> {
  if (!isEmailConfigured()) {
    return { sent: 0, failed: [], skipped: true };
  }

  const from = process.env.NEWSLETTER_FROM!;
  const key = process.env.RESEND_API_KEY!;
  const failed: BroadcastResult["failed"] = [];
  let sent = 0;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const payload = batch.map((r) => {
      const unsubscribe = unsubscribeUrl(r.token);
      return {
        from,
        to: [r.email],
        subject,
        html: html(unsubscribe),
        headers: {
          /*
           * Lets a mail client offer its own unsubscribe button. Mailbox
           * providers weigh this heavily: a list that is easy to leave is
           * treated as a list people stay on by choice.
           */
          "List-Unsubscribe": `<${unsubscribe}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      };
    });

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const detail = await response.text();
        for (const r of batch) {
          failed.push({ email: r.email, reason: `${response.status}: ${detail.slice(0, 200)}` });
        }
        continue;
      }

      sent += batch.length;
    } catch (error) {
      // A network failure mid-send must not lose the rest of the list.
      const reason = error instanceof Error ? error.message : "Network error";
      for (const r of batch) failed.push({ email: r.email, reason });
    }
  }

  return { sent, failed, skipped: false };
}
