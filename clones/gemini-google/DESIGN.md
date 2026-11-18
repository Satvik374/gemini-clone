# gemini.google.com — UI clone spec

- **Source:** https://gemini.google.com/app — captured 2026-11-18 (signed-out state)
- **Scope:** first the signed-out shell (side navigation, top bar, zero state,
  legal line), then extended to the signed-in app: `index.html` (home with
  history, notebooks, Chat/Task, suggestions), `chat.html`, `images.html`,
  `library.html`, `scheduled.html`, `customize.html`, `search.html`, plus the
  model menu, upload & tools menu, chat-row menu, response menu and the settings
  sheet. See `STATES.md` for the control-by-control map.
- **Signed-out variant:** still reproducible by emptying `CONTENT.history`,
  `CONTENT.notebooks.items` and the account row; it was the first build and was
  verified at 98.2 / 96.4 / 95.3 before the expansion.
- **Reference viewport:** 1440×900 · also captured 768×1024 and 390×844
- **Goal:** pixel-faithful replica for study (desktop), matching structure on
  tablet and phone. Not for public use as-is — see §8.
- **Stack:** static HTML + CSS + ~60 lines of vanilla JS. No framework, no
  build step, no CDN at runtime.
- **Capture:** `reference/` (never shipped). Screenshots and specs are reference
  only: `spec-1440x900.json`, `spec-768x1024.json`, `spec-390x844.json`,
  `desktop-fold.png`, `tablet-fold.png`, `mobile-fold.png`.

Variant note: the page personalises the prompt placeholder ("Ask Gemini" on
desktop, "Try @ for more" on tablet/phone) and the model label in the small-screen
header ("3.5 Flas…" truncated). The clone reproduces **this** captured variant.

## 1. Surfaces

| # | surface | value | area | where | note |
|---|---------|-------|------|-------|------|
| 1 | page background | `#faf9f9` | full | `body` | measured (pixel + computed) |
| 2 | sidebar | `#ffffff` | 288×900 | fixed left | measured |
| 3 | composer | `#ffffff` | 660×64 | hero | measured, 1px-free, shadow below |
| 4 | Sign in pill | `#9dd2ff` | 258×36 (sidebar), 69×36 (top bar) | sidebar footer, top bar | measured |
| 5 | Get App pill | `#f2f0f0` | 258×36, 105×36 | sidebar footer, top bar | measured |
| 6 | link text | `#0b57d0` | — | top bar links | measured |
| 7 | primary text | `#1f1f1f` | — | greeting, nav labels | measured |
| 8 | secondary text | `#444746` | — | legal line, model picker | measured |
| 9 | placeholder | `#5f6368` | — | composer placeholder | measured (sampled glyph) |
| 10 | dim icon | `rgba(0,0,0,.55)` | — | sidebar collapse icon | measured |

Gradients and overlays (authored, fitted to sampled pixels — the original builds
this from blurred colour blobs inside a 0.29-opacity layer, which cannot be
copied as a value, so the *result* was measured and re-expressed):

```
desktop  : radial-gradient(58% 52% at 50% 62%, #bfe0fd 0%, .55 38%, .16 66%, 0 88%) over #faf9f9
tablet   : radial-gradient(150% 80% at 50% 103%, #bfe0fd 0%, .91 10%, .68 20%, .42 30%,
                            .21 40%, .09 50%, .03 60%, 0 75%) over #faf9f9
phone    : same stops, 290% wide
composer : box-shadow 0 2px 8px -2px rgba(0,0,0,.16)
```

Sampled peak: `rgb(194,226,253)` at (864,560) on desktop; the clone renders
`rgb(191,224,253)` there (Δ ≤ 3 per channel).

## 2. Type

| role | original (confidence) | substitute | size | line | ratio | weight | tracking | case | colour |
|------|----------------------|-----------|------|------|-------|--------|----------|------|--------|
| greeting (desktop) | Google Sans Flex (high) | Figtree | 36px | 44px | 1.22 | 320 | normal | none | `#1f1f1f` |
| greeting (small screens) | Google Sans Flex (high) | Figtree | 32px | 38px | 1.19 | 360 | normal | none | `#1f1f1f` |
| wordmark | Google Sans Flex (high) | Figtree | 17px | 24px | 1.41 | 470 | normal | none | `#000` |
| nav / body-s | Google Sans (high) | Figtree | 13px | 17px | 1.31 | 400 | normal | none | `#1f1f1f` / `#000` |
| top-bar link | Google Sans (high) | Figtree | 14px | 20px | 1.43 | 500 | normal | none | `#0b57d0` |
| pill label | Google Sans (high) | Figtree | 14px | 20px | 1.43 | 500 | normal | none | `#000` |
| composer text | Google Sans Flex (high) | Figtree | 17px | 24px | 1.41 | 400 | normal | none | `#1f1f1f` / placeholder `#5f6368` |
| model picker | Google Sans (high) | Figtree | 14px | 20px | 1.43 | 500 | normal | none | `#444746` |
| legal | Google Sans (high) | Figtree | 13px | 17px | 1.31 | 400 | normal | none | `#444746` |

Loaded faces on the reference: Google Sans (400/500/700), Google Sans Flex
(variable 280–540), Google Sans Text, Google Sans Mono, Google Symbols,
Luminous Symbols. Substitute: **Figtree** variable 300–900, self-hosted
(`src/assets/figtree-latin.woff2`, latin-ext subset alongside). Weights 320, 360
and 470 are real variable values on both sides, so no rounding to 300/500 was
needed. Figtree runs ~1-2% narrower than Google Sans at the same size; sizes
were kept as measured and no tracking compensation was added, because the
greeting line length measured 610.8px on the reference and 617px in the clone.

## 3. Layout system

- Sidebar: fixed, `288px`, full height, no border (the seam is pure colour:
  `#fff` against `#faf9f9`).
- Composer: `660×64`, radius `32px`, centred in the content column.
- Base spacing unit: **4px**, derived from the repeated offsets (8/12/16/20/40).
  Scale used: 4, 8, 12, 16, 20, 24, 40.
- Breakpoint: **960px**. Above it the sidebar is permanent; at 959px and below it
  becomes an off-canvas drawer and the header switches to
  hamburger + wordmark + model chip + Sign in. A second step at **600px** makes
  the composer full-width-minus-32 and 80px tall.
- Grid: none — flex column shells, one centred hero block.

### Section map (1440×900, measured)

| # | section | x | y | w | h | bg | notes |
|---|---------|---|---|---|---|----|-------|
| 1 | sidebar | 0 | 0 | 288 | 900 | `#fff` | fixed |
| 2 | top bar | 884 | 8 | 544 | 48 | — | fixed, right-aligned |
| 3 | greeting | 555 | 334 | 619 | 44 | — | centred in 288..1440 |
| 4 | composer | 534 | 418 | 660 | 64 | `#fff` | 40px below greeting |
| 5 | legal | 457 | 867 | 817 | 17 | — | 16px from bottom |

Vertical centring is reproduced with the measured helper margins rather than
eyeballing: `.stage` is `flex:1` with `padding-top:33px` (the legal line is in
flow, 33px tall) and the hero carries `margin-bottom:84px`, which puts the
greeting at y=332 in the clone (334 reference).

Tablet: composer `70,915,628×72`; greeting y=474 (475). Phone: composer
`16,710,358×80`; greeting y=352 (353).

## 4. Components

```
Sidebar nav item
  box        h 32, w 272 at x 8, radius 9999, padding 0 8 0 6, gap 14
  icon       20×20 at x 14 (glyph optically at 16), label at x 48
  type       nav role, 13/17, 400
  colours    text #000; "New chat" is disabled: same colour, opacity .38
  hover      rgba(31,31,31,.08)   (inferred — the original's state layer did
                                   not change any computed property)
Sidebar footer
  Settings row h 32 at y 768; Sign in pill 16,808 258×36 #9dd2ff;
  Get App pill 16,852 258×36 #f2f0f0 with a 20px download icon (gap 8)

Top bar
  links      40px tall, padding 0 12, radius pill, 14/500 #0b57d0, 8px gaps
  Get App    105×36 #f2f0f0; Sign in 69×36 #9dd2ff; both 36 tall at y 14

Composer
  box        660×64 radius 32, padding 0 16, white, shadow 0 2px 8px -2px
  plus       32×32 at 16 from left, 24px glyph
  input      17/24, starts 56 from the left edge, placeholder #5f6368
  picker     126×40 at 60 from the right edge, 14/500 #444746 + chevron 20px
  mic        32×32, 16 from the right edge
  hover      shadow 0 2px 12px -2px rgba(0,0,0,.22) (inferred)
  focus      input outline removed, container keeps the ring on focus-within
  small      full width − 32 (≤600px) or −108 inside the padded dock, h 72/80,
             radius 40, picker hidden

Drawer (≤959px)
  panel      320px wide, slides in 250ms, scrim rgba(0,0,0,.32)
  header     logo + wordmark + close (X); adds About Gemini / Subscriptions /
             For Business rows (40px) above Settings
  states     open (Escape, scrim click and X all close), focus moves to the X
```

## 5. Assets

| file | stands in for | role | box | method | visible difference |
|------|---------------|------|-----|--------|--------------------|
| `src/assets/sparkle.svg` | four-point sparkle mark | mark | 24×24, 36×36 | hand-written path, used as a CSS mask; colour from a conic gradient sampled at the tips | tips slightly straighter than the brand mark |
| `src/assets/figtree-latin*.woff2` | the licensed Google Sans family | type | — | open-licensed Figtree, self-hosted | ~1-2% narrower; different terminals |
| inline SVG icons | nav, composer and header glyphs | icon | 20/24px, 1.6-1.7px stroke | drawn on a 24-unit grid by hand | optical differences at 1px level |

No photography, video, canvas, texture or third-party logo appears on this
screen. Full notes in `assets/NOTES.md`.

## 6. Motion

| element | trigger | property | from → to | duration | easing |
|---------|---------|----------|-----------|----------|--------|
| drawer | open/close | transform | translateX(-100%) → 0 | 250ms | cubic-bezier(.2,0,0,1) |
| nav item, pills, icon buttons, links | hover | background | transparent → tint | 150ms | cubic-bezier(.2,0,0,1) |
| composer | hover / focus-within | box-shadow | 8px → 12px blur | 150ms | cubic-bezier(.2,0,0,1) |

Reduced motion: all transitions and animations are cut to 0.01ms under
`prefers-reduced-motion: reduce` (deviation — the original does not declare it).

## 7. Anti-patterns

- If a card or panel has a drop shadow, it is wrong: the only shadow is on the
  composer.
- If the sidebar has a border or a divider line, it is wrong: the seam is pure
  colour.
- If any radius other than 9999px (pills), 32px (desktop composer) or 40px
  (small composer) appears, it is wrong.
- If the greeting is more than 2 lines at 1440, or wider than 620px, it is wrong.
- If body copy is left-aligned in the hero or the legal line, it is wrong —
  everything in the content column is centred.
- If an icon is filled (other than the sparkle) or thicker than 1.7px, it is
  wrong.
- If a second font family appears, it is wrong — one family, several weights.
- If the composer is pinned to the very bottom on desktop, it is wrong; it sits
  40px under the greeting, and only the legal line hugs the bottom.

## 8. Deviations

| # | what | why | impact |
|---|------|-----|--------|
| 1 | Google Sans → Figtree | original is licensed and must not be borrowed | sizes/weights/line-heights exact; line widths within ~1-2% |
| 2 | glow rebuilt as radial gradients | original is blurred colour blobs inside a filtered layer, not a copyable value | sampled pixels within Δ≤8 per channel |
| 3 | hover tints inferred | the reference's state layer changed no computed property under automation | hover is slightly more visible than the original's |
| 4 | focus rings added | a11y | visible only for keyboard users |
| 5 | `prefers-reduced-motion` honoured | a11y | no motion for those users |
| 6 | brand copy kept in the markup, not a `content.js` module | this page has ~20 strings in one static file; a JS indirection would make the page JS-dependent | copy is still a single-file edit |
| 7 | page `<title>` is neutral ("AI assistant interface — UI study") | brand must not be lifted into metadata | not visible in the UI |
| 8 | model chip truncation fixed at 58px | reference truncates the label ("3.5 Flas…") at all small widths | matches at 390 and 768 |

**Must change before public use:** the wordmark "Gemini", the sparkle mark, the
greeting, the legal string and the model name are Google's trade dress. Replace
all five, and host it under your own name, before publishing.

## 9. Acceptance checklist

- [x] page background `#faf9f9` exactly (pixel-sampled both sides)
- [x] every surface in §1 present with its exact hex
- [x] section order and offsets match §3 within 4px at 1440×900 (greeting
      y=332 vs 334, composer y=416 vs 418)
- [x] container widths and column counts match at 1440, 768, 390 (composer
      660/628/358, all exact)
- [x] every type role matches §2 in size, weight, tracking and case
- [x] greeting line width within 2% (617 vs 610.8)
- [x] radii, borders and shadows match per component
- [x] hover, focus and drawer states exist and behave as described
- [x] no horizontal scroll at any of the three viewports
- [x] all assets authored, `assets/NOTES.md` complete, zero target URLs in the build
- [x] diff 98.2 / 96.4 / 95.3 (desktop / tablet / phone), all ≥ 90
- [x] keyboard pass works; no console errors
