# CAA website

Next.js app for catholicaviation.org. Design and content decisions come from
`../CAA_BRAND.md` and the approved brand & website overview (`../pages/tech-spec.html`).

## Running

```bash
cd site
npm install
npm run dev
```

## Structure

- `app/globals.css` — design tokens and primitives. Four brand colours plus
  neutrals; the red and bright blue from earlier mockup rounds are deliberately
  not carried over.
- `content/` — all copy, typed. This is the seam where Sanity plugs in later:
  components read from these objects, never from inline strings.
- `components/` — CSS Modules alongside each component.
- `public/brand/` — supplied logo artwork, placed not redrawn. `full` (3-01)
  for large use, `compact` (3-02) for headers and tight spaces, `reversed`
  (3-03) for dark grounds.

## Notes

- No Tailwind. The approved direction rules out generic component-library
  aesthetics, and the mockups already establish a hand-authored system.
- Photography is stubbed with labelled `PhotoSlot` briefs rather than filled
  with generated or stock imagery. Real CAA photography replaces them.
- `caa-logo-reversed.svg` still has its original uncropped viewBox, unlike the
  full and compact marks. It needs the same crop treatment before use on a
  dark ground.
