# Authored assets

Nothing in this folder is copied, downloaded, traced or hotlinked from the
target. Each entry is built here from primitives (SVG paths, CSS gradients).

| file | stands in for | role | box | method | visible difference |
|------|---------------|------|-----|--------|--------------------|
| `src/assets/sparkle.svg` | four-point sparkle mark next to the wordmark (24px) and above the greeting on small screens (36px) | mark | 24×24, 36×36 | hand-written path on a 24-unit grid: one closed path with four tips at 12,1.2 / 23.5,12 / 12,22.8 / .5,12 joining through quadratic-style calls toward the centre. Filled black and used as a `mask-image`; the colour comes from a CSS `conic-gradient`. | The star is a generic four-point sparkle, not the brand's artwork: the tips are slightly straighter and the waist marginally wider. The conic colour order (red top, blue right, green bottom, gold left) was sampled from the rendered page. |
| `conic-gradient` in `styles.css` (`.sparkle`) | the multicolour fill of that mark | colour treatment | — | sampled tip colours: top `#f34847`, right `#4a95e3`, bottom `#24ba68`, left `#f6b817`, then interpolated by conic angle | Mid-angles blend through purple/teal rather than the brand's authored gradient stops. |

Icons (new chat, images, info, gear, plus, mic, chevron, download, close, menu)
are hand-authored 24-unit stroke paths in `src/index.html`, drawn to the
measured optical size (20px in the sidebar, 24px in the composer, 1.6-1.7px
stroke) rather than taken from an icon set or from the page's DOM.

No photography, video, canvas or texture assets exist on this screen, so none
were substituted.

## Before this ships publicly

The wordmark text, the mark and the copy belong to the brand. Replace the mark
with your own (it is already a placeholder in the sense that its geometry is
authored here), and rewrite the strings in `src/index.html` — see `DESIGN.md`
§8 and `REPORT.md`.
