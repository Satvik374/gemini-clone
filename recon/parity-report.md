# Parity report

Date: 2026-11-18. Target: the reconstructed backend in `backend/`.

Parity here means **observable equivalence with the contract in `recon/openapi.yaml`**
— not with Google's service, which was never observed and is out of scope
(`recon/00-scope.md`).

## Automated contract tests

`cd backend && python -m pytest -q` → **16 passed**, 1 warning (a Starlette
TestClient deprecation, unrelated to the service).

| # | Test | Contract point |
|---|---|---|
| 1 | `test_health` | `GET /v1/health` → 200 `{status}` |
| 2 | `test_models_and_suggestions` | model fields complete; suggestions are strings |
| 3 | `test_missing_token_is_401_envelope` | error envelope shape on 401 |
| 4 | `test_forged_token_is_401` | signature verification rejects garbage |
| 5 | `test_register_and_duplicate` | 201 + token; second attempt 409 `email_taken` |
| 6 | `test_register_validation_envelope` | 422 `invalid_request` envelope |
| 7 | `test_bad_password_is_401` | wrong credentials → 401 |
| 8 | `test_me` | bearer resolves to the right user |
| 9 | `test_conversation_crud_and_detail` | 201 create, list, PATCH rename/pin, 204 delete, 404 after |
| 10 | `test_pagination_cursor` | `next_cursor` pages without overlap |
| 11 | `test_message_pair_and_title_from_prompt` | ordinals 0/1, roles, title from prompt |
| 12 | `test_message_stream_frames` | SSE content-type, `delta` frames, final `done` |
| 13 | `test_empty_message_rejected` | 422 on empty text |
| 14 | `test_other_users_conversation_is_hidden` | cross-account read/delete → 404 |
| 15 | `test_search_by_title_and_body` | title hit and body hit with snippet |
| 16 | `test_settings_read_and_patch` | defaults, PATCH merge, invalid enum → 422 |

## Live server checks (Uvicorn on 127.0.0.1, curl)

| Check | Result |
|---|---|
| `GET /v1/health` | `{"status":"ok","service":"gemini-clone-api"}` |
| `POST /v1/auth/token` (seeded demo account) | 200, 123-character bearer token |
| `GET /v1/conversations?limit=2` | pinned chat first, then by `updated_at` |
| `POST /v1/conversations/{id}/messages` (`stream:true`) | `event: delta` frames, then `event: done` |
| same, `stream:false` | message pair with ordinals 2 and 3 after seed turns |
| `GET /v1/search?q=lentil` | body match with a 120-character snippet |
| `PATCH /v1/settings` | persistence of `theme` across requests |
| CORS preflight from `http://127.0.0.1:3000` | `access-control-allow-origin` echoed, methods `GET, POST, PATCH, DELETE, OPTIONS` |
| no token on `GET /v1/me` | 401 envelope, no stack trace |

OpenAPI export is byte-reproducible: two consecutive runs produce the same
SHA-256 (`84b40b08…83a983b`), 11 paths, 16 `x-provenance` tags.

## Covered vs. not covered

**Covered:** register, sign-in, bearer resolution, own-profile read, conversation
CRUD, cursor pagination, message send (both modes), SSE streaming, search, model
catalogue, suggestions, settings, cross-account isolation, error envelopes,
validation failures, CORS.

**Inferred only (no observed counterpart exists):** every status code, every
field name, the error envelope, cursor semantics, title derivation, mock reply
content. These are design decisions recorded in `architecture.md` §2 and §6.

**Never observed / still UNKNOWN:** the original's real endpoints, its auth
scheme, its storage, its rate limits, attachment handling, scheduled tasks,
billing, and any admin surface. See `architecture.md` §7.

**Deliberately absent from the implementation:** file upload, task scheduling
endpoints, account deletion, token revocation. The UI offers these affordances;
this service does not pretend to serve them, so a client calling them gets 404
rather than a fabricated success.

## Known gaps in this rebuild

- Sign-out has no server call, so a stolen token stays valid until TTL. Documented as A4; a revocation list is the obvious next step.
- Concurrent writes to the same conversation are last-write-wins; SQLite serializes them, Postgres would need row-level care.
- No rate limiting or abuse controls.
- Reply text is deterministic mock content, not model output.
