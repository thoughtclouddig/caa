"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useState } from "react";
import styles from "./RichTextEditor.module.css";

/**
 * The editor staff write in.
 *
 * The toolbar is fixed and short on purpose. There is no font menu, no
 * colour picker and no size control, because the approved plan says staff
 * change content and not layout, and because a site where six people can
 * each pick a font stops looking like one site within a year.
 *
 * What is typed here is HTML, but it is not trusted: the server strips
 * everything outside the allowlist on save. See lib/richtext.ts.
 */
export default function RichTextEditor({
  name,
  initialHtml,
  ariaLabel,
}: {
  name: string;
  initialHtml: string;
  ariaLabel: string;
}) {
  const [html, setHtml] = useState(initialHtml);

  const editor = useEditor({
    // Next renders this on the server first; letting Tiptap paint
    // immediately causes a hydration mismatch.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Offered by neither the toolbar nor the sanitiser.
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto", "tel"],
      }),
    ],
    content: initialHtml || "<p></p>",
    editorProps: {
      attributes: {
        class: styles.surface,
        "aria-label": ariaLabel,
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  return (
    <div className={styles.wrap}>
      {/* What the surrounding form actually submits. */}
      <input type="hidden" name={name} value={html} />
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [linking, setLinking] = useState(false);
  const [href, setHref] = useState("");

  function applyLink() {
    const value = href.trim();
    if (!value) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
    }
    setLinking(false);
    setHref("");
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.group} role="group" aria-label="Text style">
        <Button
          on={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Bold"
        >
          <strong>B</strong>
        </Button>
        <Button
          on={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italic"
        >
          <em>I</em>
        </Button>
      </div>

      <div className={styles.group} role="group" aria-label="Headings">
        <Button
          on={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Subheading"
        >
          Subheading
        </Button>
        <Button
          on={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="Smaller subheading"
        >
          Smaller
        </Button>
      </div>

      <div className={styles.group} role="group" aria-label="Lists and quotes">
        <Button
          on={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Bulleted list"
        >
          List
        </Button>
        <Button
          on={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Numbered list"
        >
          Numbered
        </Button>
        <Button
          on={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="Quote"
        >
          Quote
        </Button>
      </div>

      <div className={styles.group} role="group" aria-label="Link">
        <Button
          on={editor.isActive("link")}
          onClick={() => {
            setHref(editor.getAttributes("link").href ?? "");
            setLinking((open) => !open);
          }}
          label="Add or edit a link"
        >
          Link
        </Button>
      </div>

      {linking && (
        <div className={styles.linkRow}>
          <input
            className={styles.linkInput}
            value={href}
            autoFocus
            placeholder="https://example.org or /chapters"
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinking(false);
            }}
          />
          <button type="button" className={styles.linkApply} onClick={applyLink}>
            {href.trim() ? "Apply" : "Remove link"}
          </button>
        </div>
      )}
    </div>
  );
}

function Button({
  on,
  onClick,
  label,
  children,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      title={label}
      className={`${styles.btn} ${on ? styles.btnOn : ""}`}
    >
      {children}
    </button>
  );
}
