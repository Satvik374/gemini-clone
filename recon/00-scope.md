# Phase 0 — Scope and authorization

Skill: `backend-cloner` 1.0.0. Date: 2026-11-18.

## Target

| | |
|---|---|
| App cloned in this repo | the Gemini app UI at `gemini.google.com` (see `clones/gemini-google/`) |
| Requested backend to clone | the server behind that app |
| Origin proposed | `https://gemini.google.com` |

## Authorization gate — **failed for the original backend**

Rule 1 requires an authorization basis, and the gate explicitly includes "the
target's terms do not prohibit it". That condition cannot be met for Google's
Gemini backend:

1. **No authorized capture is possible here.** Every conversation endpoint sits
   behind a Google account session. Capturing it would mean using the account
   owner's live cookies and `at`/`bl` tokens from `storage_state.json`. The skill
   forbids committing or sharing those, and reusing them against a third party is
   exactly the kind of inspection Rule 1 is there to prevent. There is no
   signed-in session in this workspace, so no capture was attempted.
2. **The surface is undocumented and contractually restricted.** Google's terms
   prohibit automated access and reverse engineering of the consumer app, and the
   private `batchexecute` / `StreamGenerate` RPCs are internal — not a public API.
   A spec built from them would be a reconstruction of a proprietary interface
   the user has no licence to reimplement, and it could not be published.
3. **Stop condition.** "Authorization is unclear or the target's terms forbid
   inspection" → halt instead of proceeding. That is what this document records.

Nothing was captured, and no token, cookie or body was read.

## What is in scope instead

The honest, buildable version of the request: **a real backend for the app in this
repo**, with the contract the clone's front end needs, authored and documented by
me rather than lifted from Google.

| | |
|---|---|
| Authorization basis | own project: the front end here was authored in this repo |
| Target origin | `http://127.0.0.1:8000` (our service) |
| Client | `clones/gemini-google/` |
| Accounts | synthetic only (`demo@example.com`), created by the seed script |
| Journeys in scope | sign-up/sign-in, list/create/rename/pin/delete a conversation, send a message (plain and SSE), search, models, settings, sign-out |
| Out of scope | Google's private RPCs, Google account auth, model inference, file upload storage, billing, any request to a Google origin |

Consequence for provenance: because every payload here is designed rather than
observed, there are **no `OBSERVED` server responses**. Endpoints, field names and
error codes are `INFERRED` from what the cloned client needs and from behaviour
visible in the UI; anything the client never reveals (server-side jobs, admin
surfaces, storage layout) stays `UNKNOWN`. `recon/openapi.yaml` and
`recon/architecture.md` carry these labels per operation.

## Data handling

`recon/capture/` is unused for this target; if it is ever populated it stays
gitignored along with `*.har` and `storage_state.json`. The seed data is
fabricated — names, titles and message text written for this repo, no real
account content, none of the user's observed chat titles.
