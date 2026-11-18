# Cleanroom Attestation — reconstructed backend for the cloned Gemini front end

Date: 2026-11-18            Skill: backend-cloner 1.0.0
Authorization basis: own project — front end authored in this repo; the original
Google backend was **not** inspected (gate failed, see `recon/00-scope.md`).

## Sources used to write the implementation

- [x] `recon/00-scope.md` (authorization gate result)
- [x] `recon/architecture.md` (INFERRED design)
- [x] `recon/openapi.yaml` (generated from this implementation's own routes)
- [ ] original server source — not consulted
- [ ] original client bundle / source maps — not used as implementation input
- [ ] original API traffic / HAR — none captured
- [ ] database export / production data — not used
- [ ] media, fonts, icon assets — not copied

## Statements

- No original source code, bundled JavaScript, or source-map content was copied
  into this repository.
- No database dump, production fixture, or real user record was imported. Seed
  rows are invented; none of the chat titles visible in the reference UI appear.
- No media, font, icon or illustration asset was downloaded from the target.
- Seed data is synthetic and produced by `backend/app/seed.py`.
- Auth is an independent implementation (stdlib `scrypt` + HMAC-SHA256 token);
  no bypass, no borrowed token format, no secret from any capture.
- Inferred behaviour is labelled INFERRED with assumptions recorded; unobserved
  behaviour is labelled UNKNOWN or returns 404 rather than being invented.

## Scan results

Scans run over `backend/` (the implementation root).

| Check | Result | Notes |
|---|---|---|
| Copied bundles / maps | pass | no `*.min.js`, `*.map`, `*.har` in the tree |
| base64 asset embeds | pass | none |
| copyright headers | pass | no `copyright` / `proprietary` / `confidential` strings in code |
| long string literals | pass | no literal over 300 characters |
| secrets | pass | no JWT-shaped, AWS or `sk_live_` strings; `TOKEN_SECRET` read from env with a dev fallback |
| real user data | pass | no `@gmail`/`@yahoo`/`@hotmail`/`@outlook` addresses, no phone/SSN-shaped values; demo account is `demo@example.com` |
| bundle fingerprint match | n/a | no captured bundle exists to fingerprint against |
| outbound network calls | pass | only the CORS allow-list default mentions a localhost origin; no code path contacts any external host |

## Deviations

| Area | Observed | Rebuild | Reason |
|---|---|---|---|
| Whole contract | nothing (no capture possible) | designed from client needs, all INFERRED | terms prohibit inspecting the original; see `00-scope.md` |
| Migrations | — | `create_all` + `scripts/migrate.py` instead of Alembic | small single-revision schema (D1) |
| Database | — | SQLite locally, PostgreSQL 16 in Compose | zero-setup local runs (D2) |
| Model replies | — | deterministic mock text, labelled as such | no model in this project; faking one would misrepresent it |

No check is omitted. Every deviation above is a consequence of the authorization
gate, not a workaround for it.

Signed: Buffy (agent), for the repository owner
