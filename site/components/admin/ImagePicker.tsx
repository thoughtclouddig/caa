"use client";

import { useRef, useState, useTransition } from "react";
import { uploadImageAction } from "@/lib/actions";
import styles from "./ImagePicker.module.css";

type Props = {
  /** Existing image on the record being edited, if any. */
  initialPath?: string | null;
  initialAlt?: string | null;
  initialCredit?: string | null;
  /** Shown when no image is set, so the gap is described rather than blank. */
  initialBrief?: string | null;
};

/**
 * Picks the lead image for an article.
 *
 * The upload happens on its own, before the article is saved, because a
 * form cannot be nested inside another form. Uploading writes the image to
 * the database and hands back a path; the hidden fields carry that path
 * into the article when the surrounding form is submitted.
 *
 * Alt text is part of choosing the image, not a separate chore afterwards.
 * The server rejects an upload without it.
 */
export default function ImagePicker({
  initialPath,
  initialAlt,
  initialCredit,
  initialBrief,
}: Props) {
  const [path, setPath] = useState(initialPath ?? "");
  const [alt, setAlt] = useState(initialAlt ?? "");
  const [credit, setCredit] = useState(initialCredit ?? "");
  const [brief, setBrief] = useState(initialBrief ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function upload() {
    const file = fileRef.current?.files?.[0];
    setError(null);

    if (!file) {
      setError("Choose an image first.");
      return;
    }
    if (!alt.trim()) {
      setError("Describe the photograph before uploading it.");
      return;
    }

    const data = new FormData();
    data.set("file", file);
    data.set("alt", alt);
    data.set("credit", credit);

    startTransition(async () => {
      const result = await uploadImageAction({}, data);
      if (result.error) setError(result.error);
      else if (result.imagePath) {
        setPath(result.imagePath);
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  return (
    <div className={styles.wrap}>
      {/* What actually travels with the article. */}
      <input type="hidden" name="imagePath" value={path} />
      <input type="hidden" name="imageAlt" value={alt} />
      <input type="hidden" name="imageCredit" value={credit} />
      <input type="hidden" name="photoBrief" value={path ? "" : brief} />

      <div className={styles.preview}>
        {path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={path} alt={alt} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>
            <span>No image yet</span>
            <p>The brief below shows on the page until a photograph is added.</p>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <label className={styles.label} htmlFor="image-alt">
          Describe the photograph
          <span className={styles.req}>required</span>
        </label>
        <input
          id="image-alt"
          className={styles.input}
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Three chapter members around a glider fuselage in a workshop."
        />
        <p className={styles.help}>
          Read aloud to anyone who cannot see the image. Describe what is
          happening, not that it is a photo.
        </p>

        <label className={styles.label} htmlFor="image-credit">
          Photo credit
        </label>
        <input
          id="image-credit"
          className={styles.input}
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
          placeholder="Photo: Laura Stants"
        />

        <label className={styles.label} htmlFor="image-file">
          {path ? "Replace the image" : "Upload an image"}
        </label>
        <div className={styles.uploadRow}>
          <input
            id="image-file"
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className={styles.file}
          />
          <button
            type="button"
            className="btn btn--primary"
            onClick={upload}
            disabled={pending}
          >
            {pending ? "Uploading…" : "Upload"}
          </button>
        </div>
        <p className={styles.help}>JPEG, PNG, WebP or AVIF. Up to 8MB.</p>

        {error && <p className={styles.error}>{error}</p>}

        {path && (
          <button
            type="button"
            className={styles.remove}
            onClick={() => setPath("")}
          >
            Remove this image
          </button>
        )}

        {!path && (
          <>
            <label className={styles.label} htmlFor="image-brief">
              What photograph is needed?
            </label>
            <input
              id="image-brief"
              className={styles.input}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="A chapter gathering. People, not an empty room."
            />
            <p className={styles.help}>
              Shown in place of the image until CAA supplies one.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
