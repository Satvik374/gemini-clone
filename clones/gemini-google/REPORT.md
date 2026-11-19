# Report — gemini.google.com UI clone (signed-out + signed-in)

Built with the `frontend-cloner` skill: every screen was rendered in a real
browser, measured from what it paints, then rebuilt. Nothing of the original's
markup, CSS, JS, fonts, images or data is in the deliverable — the account name,
chats, notebooks and files in the build are placeholders I wrote.

## What is in the build

| page | file | what it is |
|---|---|---|
| Home (signed in) | `index.html` | greeting, composer, Chat/Task segmented, suggestion chips |
| Conversation | `chat.html` | user turn + model turn, per-message actions, working send |
| Images | `images.html` | "Create images" hero, 6 templates, aspect-ratio chips |
| Library | `library.html` | Documents cards + empty Media section |
| Scheduled | `scheduled.html` | BETA badge, intro, suggested task cards |
| Customize | `customize.html` | Discover/Connectors/Skills tabs, connector cards with add toggles |
| Search chats | `search.html` | Recents list |
| Overlays (all pages) | `app.js` | sidebar + collapse rail, mobile drawer, model menu, upload & tools menu, chat-row menu, response menu, settings sheet, search panel |

`STATES.md` maps every control to what it shows and to both capture sets.

## Scores

| comparison | score | verdict |
|---|---|---|
| signed-out home vs `reference/desktop-fold.png` (1440×900) | **98.2** | near-identical, no flagged region |
| signed-out home vs tablet (768×1024) | **96.4** | near-identical |
| signed-out home vs phone (390×844) | **95.3** | matches |
| signed-in home vs `reference/states/01-sidebar-expanded.png` | **90.0** | matches |
| Images vs `08-images-1440.png` | 78.1 | close |
| Library vs `08-library-1440.png` | 74.9 | partly |
| Scheduled vs `08-scheduled-1440.png` | 75.2 | close |

The three sub-80 scores are structural, not colour or type errors: the reference
captures for those screens were taken while the original's sidebar was collapsed
to a 52px rail (content starts at x=366), whereas the clone shows the expanded
288px sidebar, and the clone renders fewer cards per section. Type sizes,
radii, chips and card colours are the measured values.

## Controls exercised (details in `STATES.md`)

Sidebar open/close + rail reopen, mobile drawer with scrim, model picker
(217×171 card, Auto / Code & analysis / Thinking level), upload & tools
(240×321 card, 8 rows + locked badge), settings sheet (17 rows + location),
account row, chat-row menu, composer send (user turn → model turn), response
actions (copy / thumbs / share / more), Chat–Task toggle, suggestion chips,
Image templates, aspect chips, Customize tabs and add buttons, search panel.

Nothing that would change the account was committed: upgrade, sign-out, delete
and purchase actions were opened only far enough to see their destination, then
dismissed with Escape. One throwaway prompt (`hello`) was sent in the reference
to observe the conversation view.

## What is approximate

1. **Typeface** — Google Sans / Google Sans Flex are licensed; substituted
   Figtree (variable 300–900), self-hosted. Sizes, line-heights and variable
   weights are exact.
2. **The glow** — the original paints it from blurred organic colour blobs; the
   output was sampled and re-expressed as radial-gradient ladders per breakpoint
   (within Δ≤8 per channel).
3. **Hover tints** — inferred; automating a hover on the original changed no
   computed property.
4. **Deeper pages** — their desktop reference captures had the sidebar collapsed,
   so their exact column widths are approximated; type, radii and component sizes
   are measured.
5. **Canned chat** — sending a prompt appends the user turn and a fixed reply
   after 700ms. There is no model behind it.
6. **Placeholder identity** — "Alex Morgan / AM" and all chat, notebook and file
   titles are invented. The reference account's name, email, avatar and history
   were never copied into the build.

## Checks run

- all 7 pages return 200, zero console errors and zero page errors on each
- every interaction above exercised by Playwright; screenshots in `shots/states/`
- sidebar collapse → `margin-left: 0` + rail button; rail reopen → `288px`
- chat send → 2 turns rendered, URL `/chat.html?q=hello`
- diffs listed above (diff PNGs in `diffs/`)
- no horizontal scroll at 1440, 768, 390
- no target host in build output (`gemini.google`, `gstatic`, `googleapis`,
  `googleusercontent` all absent)

Not verified: the real model responses, anything behind Google auth beyond what
was observable in the signed-in UI (settings rows, account menu), and the
original's behaviour at widths between the three measured breakpoints.

## Before this goes public

A pixel-identical copy reproduces someone else's trade dress, which is usually not
lawful to publish. Replace the wordmark, the sparkle mark, the greetings, the
model names ("Flash-Lite", "3.5 Flash", "Nano Banana") and the legal strings —
all of them live in `src/content.js` and the page bodies, so it is a single-file
edit for the copy and one SVG for the mark.

---

# From replica to working app

The seven pages now run against `backend/` instead of placeholder data. Nothing
about the layout changed for its own sake: the same shell, composer and type scale
are driven by the API.

## What is real

| Surface | Backed by |
|---|---|
| Sign in / create account | `POST /v1/auth/token`, `POST /v1/auth/register`, bearer token in `localStorage` |
| Sidebar history | `GET /v1/conversations` (pinned first, then most recently updated) |
| Open a chat | `GET /v1/conversations/{id}` |
| Send a message | `POST /v1/conversations/{id}/messages` with `stream: true`; SSE `delta` frames are appended to the model turn, `done` ends it |
| New chat | `POST /v1/conversations`, then the URL becomes `chat.html?c=…` |
| Rename / pin / delete | `PATCH` and `DELETE` on the conversation |
| Search panel | `GET /v1/search?q=` (titles and message bodies) |
| Model picker + settings sheet | `GET /v1/models`, `GET/PATCH /v1/settings` (model, theme, memory persist per user) |
| Sign out | token discarded, the sign-in screen returns |

Still presentational on purpose: Images, Library, Scheduled and Customize are the
clone's chrome — the backend has no endpoints for uploads, scheduled tasks or
connectors, so those controls are inert rather than pretending to work.

## Serving

The backend mounts the front end at `/app`, so the app and its API share an origin
and there is no CORS dance:

```
cd backend
python -m scripts.migrate          # creates the schema and the demo account
uvicorn app.main:app --port 8000   # http://127.0.0.1:8000/app/
```

Demo account: `demo@example.com` / `demo-password-1`. `docker compose up` runs the
same service against PostgreSQL 16.

## Responsive checks

| width | result |
|---|---|
| 1440×900 | expanded 288px sidebar, centred composer 660px, history and settings sheet as measured |
| 1024×768 | no horizontal overflow |
| 768×1024 | rail hidden, hamburger + drawer with scrim, no horizontal overflow |
| 390×844 | drawer, phone top bar (conversation title instead of the wordmark), composer 358px, no horizontal overflow |

Fixed along the way, all found by driving the app rather than reading it: the
settings sheet and search panel were covering the page because class rules beat
the `hidden` attribute; the model label reverted after a settings write; the row
menu closed on the click that opened it; the mobile drawer and search lost their
listeners whenever the shell re-rendered (now only the sheet re-renders); and the
chat page shipped canned demo turns that flashed before the API answered.

## Verified

Sign in → history loads → open a chat → send a prompt → 337-character streamed
reply rendered → reload keeps both turns → rename, pin/unpin, search, model switch,
theme switch (dark `#131314`), memory toggle, sign out → sign-in screen. Zero
console errors on every page at 1440, 1024, 768 and 390. Backend suite: 16/16.
