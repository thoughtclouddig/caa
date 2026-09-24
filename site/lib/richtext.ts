import sanitizeHtml from "sanitize-html";

/**
 * The rich text CAA staff can write, and the only rich text the site will
 * store or render.
 *
 * The allowlist is the real enforcement of "staff can edit content, they
 * cannot change the layout", from the approved brand and website overview.
 * The editor's toolbar offers exactly these and nothing else, but a
 * toolbar is a suggestion: someone pasting from Word, from a web page, or
 * from another CMS will bring fonts, colours, sizes and tables with them.
 * Stripping that here, on the way into the database, is what keeps a page
 * looking like CAA a year from now.
 *
 * Deliberately absent: style and class attributes, font and colour tags,
 * tables, images, iframes, scripts, and headings above h2. An article's
 * h1 is its title, set elsewhere; letting the body carry one would break
 * the document outline on every article page.
 */
const ALLOWED = {
  allowedTags: ["p", "strong", "em", "a", "h2", "h3", "ul", "ol", "li", "blockquote", "br"],
  allowedAttributes: {
    a: ["href", "title", "rel"],
  },
  // Anything else is a link to somewhere a browser should not follow.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // Keeps the text of a stripped tag rather than deleting the sentence.
  nonTextTags: ["style", "script", "textarea", "option", "noscript"],
  transformTags: {
    // Editors emit these; they mean the same thing and the site styles the
    // semantic ones.
    b: "strong",
    i: "em",
    // A pasted h1 becomes the first level the body is allowed to use.
    h1: "h2",
    h4: "h3",
    h5: "h3",
    h6: "h3",
    // Links render in the same tab, so this is belt and braces: it means a
    // stored link stays safe if a target is ever added at the render side.
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
} satisfies sanitizeHtml.IOptions;

/** Cleans rich text on its way into the database. */
export function sanitizeRichText(input: string): string {
  return sanitizeHtml(input, ALLOWED).trim();
}

/** True when a body has already been written as rich text. */
export function isRichText(body: string): boolean {
  return /^\s*<(p|h2|h3|ul|ol|blockquote)\b/i.test(body);
}

/**
 * Renders a body to HTML for display.
 *
 * Bodies written before the editor existed are plain text with blank lines
 * between paragraphs, and there are real articles in that form. Rather
 * than migrate them and risk mangling copy, they are converted on the way
 * out. Both forms work, indefinitely.
 */
export function bodyToHtml(body: string): string {
  if (isRichText(body)) return sanitizeRichText(body);

  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("");

  return paragraphs;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A plain-text summary, for meta descriptions and list previews. */
export function toPlainText(body: string, limit = 200): string {
  const text = sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}
