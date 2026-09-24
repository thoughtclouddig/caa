/**
 * Absolute URLs.
 *
 * Deliberately not server-only. Building a URL involves no secret, and
 * keeping it separate means the email templates can be rendered and
 * checked outside the Next runtime, which is how they get tested at all.
 */

/** Base for links in an email, which cannot be relative. */
export function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function unsubscribeUrl(token: string): string {
  return `${siteUrl()}/newsletter/unsubscribe/${token}`;
}
