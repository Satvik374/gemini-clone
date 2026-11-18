# Control-by-control map

Every interactive control on the observed screen was clicked (or opened and then
dismissed without committing anything) and captured. Two columns:

- **reference** → what the original did, captured to
  `reference/states/*.png` (gitignored; the original's rendering, not shipped)
- **clone** → the same state in this build, captured to `shots/states/*.png`

Actions that would have changed the account (sending money, upgrading, deleting a
chat, signing out) were opened only far enough to see what they show, then
dismissed with Escape. One throwaway prompt (`hello`) was sent to observe the
conversation view.

| control | what it shows | reference capture | clone capture |
|---|---|---|---|
| open sidebar (hamburger) | 288px sidebar: 6 nav rows, Notebooks, 7 chats, account pill | `01-sidebar-expanded.png` | `mobile-drawer.png`, `home-signedin.png` |
| Close sidebar (panel icon) | sidebar hides, content expands to full width; the rail button brings it back | — (state inferred) | `home-signedin.png` → collapse + rail reopen |
| Model picker (`Flash-Lite`) | 217×171 white card, r20, above the field: Auto (checked, "Adapts to your needs"), Code & analysis, divider, Thinking level › | `02-model-menu.png` | `model-menu.png` |
| Upload & tools (`+`) | 240×321 white card, r20: Upload files, Add from Drive, More uploads ›, divider, Create image, Create video (locked), Create music, Canvas, More tools › | `03-tools-menu.png` | `tools-menu.png` |
| Settings (gear) | bottom-left sheet, 408×399, 56px top corners: Activity, Personal Intelligence, Import memory, Avatar, Usage limits, Skills, Cart and orders, Gems, Your public links, Theme, Upgrade, Task settings, Browser, Channels, Notebook, Send feedback, Help, + location line | `04-settings.png` | `settings.png` |
| Account (avatar + name) | same settings sheet, opened from the account row | `05-account-menu.png` | `settings.png` |
| Chat history row | opens that conversation (`Conversation with Gemini`, "You said …", actions) | `09-chat.png` | `chat.png` |
| Chat row · More options | row menu: Pin chat, Rename, Move to notebook, Delete | `06-history-item-menu.png` (menu did not paint before the screenshot) | `chat.png` |
| Composer, send | user turn ("You said", copy + edit actions) then a model turn ("Gemini said", copy / thumbs up / thumbs down / share / more) | `09-chat.png`, `11-chat-settled.png` | `chat.png` |
| Response · More options | Share, Export to Docs, Report legal issue | `12-chat-menu.png` (menu did not paint) | `chat.png` |
| Chat / Task segmented | Chat selected by default; Task switches the pill | `01-sidebar-expanded.png` | `home-signedin.png` |
| Suggestion chip | fills the composer / starts a thread; dismiss × removes the row | `01-sidebar-expanded.png` | `home-signedin.png` |
| Library | "Library" + Documents (code cards) and Media sections | `08-library-1440.png` | `library.png` |
| Images | "Create images" hero, template cards 117×156 r40, composer + aspect-ratio chips | `08-images-1440.png` | `images.png` |
| Scheduled | BETA badge, intro, Suggested task cards | `08-scheduled-1440.png` | `scheduled.png` |
| Customize | Discover / Connectors / Skills tabs, connector cards with add buttons | `08-customize-1440.png` | `customize.png` |
| Search chats | search field + Recents list | `08-search-1440.png` | `search.png` |
| Get app / Upgrade | outbound store and upgrade pages — opened only to identify the destination | — | buttons are inert in the clone |
| Turn on temporary chat | toggles the temporary-chat mode chip in the composer | — | inert in the clone |

## Measured structure of the new screens

| screen | heading | geometry that was matched |
|---|---|---|
| Home (signed in) | "Where should we start?" 36/44 w320 | composer 660×64 at y418; segmented 36px pills 18px under it; suggestions 38px rows, 15px text, icon 20 + 14 gap |
| Chat | "Conversation with Gemini" 13/17 muted | turns column 760 max-width; user label + copy/edit right-aligned; model action row 28px icon buttons |
| Images | "Create images" 28/36 w350 | templates 117×156 r40, 6px gap, centred; aspect chips 30px |
| Library | "Library" 24/28 w380 | section titles 17/24 w470; document cards r16, 182 min height |
| Scheduled | "Scheduled" 24/28 w380 + BETA pill | suggested cards r20 in a responsive grid |
| Customize | "Customize Gemini" 24/28 w380 | tabs 44px r9999, selected `#f2f0f0`; skill cards r28 with 36px add buttons |
| Search | "Where should we start?" | Recents rows 48px with pen icon and age |

Where the original's desktop layout could not be measured (the capture for some
screens landed at phone width before it was re-taken at 1440), the clone matches
the measured type, spacing and component sizes but not the exact column widths;
those rows are marked *inferred* in `DESIGN.md`.
