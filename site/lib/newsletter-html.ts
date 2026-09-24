import { siteUrl } from "./urls";
import { toPlainText } from "./richtext";
import { org } from "../content/site";

/**
 * Renders an issue as email HTML.
 *
 * Email is not the web. Gmail and Outlook strip <style> blocks, ignore
 * flexbox and grid, and Outlook renders through Word, so this is tables
 * and inline styles throughout. That is not carelessness; it is the only
 * thing that arrives looking the way it was meant to.
 *
 * Fonts fall back to Georgia and Arial rather than loading CAA's
 * typefaces, because a webfont in email is blocked more often than it
 * works. The palette is CAA's.
 */

const NAVY = "#082d5b";
const GOLD = "#d4a23a";
const INK = "#111827";
const SLATE = "#4b5563";
const WARM = "#f8f6f3";
const LINE = "#dce3ec";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Arial, Helvetica, sans-serif";

export type IssueArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  imagePath: string | null;
  imageAlt: string | null;
};

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Images in email need an absolute URL; a site-relative path shows nothing. */
function absolute(path: string): string {
  return path.startsWith("http") ? path : `${siteUrl()}${path}`;
}

export function renderIssueHtml({
  title,
  introHtml,
  articles,
  unsubscribe,
}: {
  title: string;
  introHtml: string;
  articles: IssueArticle[];
  unsubscribe: string;
}): string {
  const base = siteUrl();

  const items = articles
    .map((a) => {
      const url = `${base}/articles/${a.slug}`;
      const summary = a.excerpt?.trim() || toPlainText(a.body, 180);

      const image = a.imagePath
        ? `<tr><td style="padding:0 0 16px;">
             <a href="${esc(url)}" style="text-decoration:none;">
               <img src="${esc(absolute(a.imagePath))}" alt="${esc(a.imageAlt ?? "")}" width="560"
                 style="display:block;width:100%;max-width:560px;height:auto;border:0;" />
             </a>
           </td></tr>`
        : "";

      return `
<tr><td style="padding:0 24px 36px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    ${image}
    <tr><td>
      <a href="${esc(url)}" style="color:${NAVY};text-decoration:none;">
        <span style="font-family:${SERIF};font-size:22px;line-height:1.25;color:${NAVY};font-weight:bold;">${esc(a.title)}</span>
      </a>
    </td></tr>
    <tr><td style="padding-top:10px;">
      <span style="font-family:${SANS};font-size:15px;line-height:1.6;color:${SLATE};">${esc(summary)}</span>
    </td></tr>
    <tr><td style="padding-top:14px;">
      <a href="${esc(url)}" style="font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;color:${NAVY};text-decoration:none;border-bottom:2px solid ${GOLD};padding-bottom:2px;">Read the article</a>
    </td></tr>
  </table>
</td></tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${WARM};">
<!-- Shown in the inbox preview line, then hidden in the message itself. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(toPlainText(introHtml, 120))}</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${WARM};">
<tr><td align="center" style="padding:24px 12px;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="608"
    style="width:100%;max-width:608px;background:#ffffff;border:1px solid ${LINE};">

    <tr><td style="background:${NAVY};padding:28px 24px;text-align:center;">
      <a href="${esc(base)}" style="text-decoration:none;">
        <span style="font-family:${SERIF};font-size:22px;color:#ffffff;letter-spacing:0.02em;">${esc(org.name)}</span>
      </a>
      <div style="height:3px;width:48px;background:${GOLD};margin:14px auto 0;"></div>
      <div style="font-family:${SANS};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${GOLD};padding-top:12px;">${esc(org.heritageLine)}</div>
    </td></tr>

    <tr><td style="padding:32px 24px 8px;">
      <h1 style="margin:0;font-family:${SERIF};font-size:27px;line-height:1.2;color:${NAVY};">${esc(title)}</h1>
    </td></tr>

    ${
      introHtml.trim()
        ? `<tr><td style="padding:12px 24px 28px;font-family:${SANS};font-size:15px;line-height:1.65;color:${INK};">${introHtml}</td></tr>`
        : `<tr><td style="padding:0 24px 20px;"></td></tr>`
    }

    <tr><td style="padding:0 24px 28px;"><div style="height:1px;background:${LINE};"></div></td></tr>

    ${items}

    <tr><td style="background:${WARM};padding:24px;text-align:center;">
      <div style="font-family:${SANS};font-size:12px;line-height:1.7;color:${SLATE};">
        ${esc(org.name)}<br />
        <a href="${esc(base)}" style="color:${NAVY};">catholicaviation.org</a>
        &nbsp;&middot;&nbsp;
        <a href="${esc(unsubscribe)}" style="color:${NAVY};">Unsubscribe</a>
        <div style="padding-top:12px;color:${SLATE};">
          You are receiving this because you asked for CAA updates.
          Unsubscribing does not affect your membership.
        </div>
      </div>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}
