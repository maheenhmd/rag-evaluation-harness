# Ragify frontend — Phase A

React, Vite, TypeScript, Tailwind, Clerk React and TanStack Query. The approved public site and workspace layout are retained.

## Local setup

```powershell
cd frontend
npm install
# Copy .env.example to .env, then supply your Clerk application's public key.
npm run dev -- --host 127.0.0.1 --port 5173
```

The frontend environment contains only:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8001
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_public_key
```

The Clerk publishable key must belong to the same application as the backend Clerk secret. Secrets, Groq keys and database credentials stay in the backend environment. Real `.env` files are ignored and must never be staged.

The backend needs PostgreSQL, Qdrant and its existing model configuration. After confirming real Clerk authentication, run with `USE_TEST_AUTH=false`. Test auth returns a shared `user_test_001` identity and is not a real authenticated product session. Records belonging to that test identity will not automatically move to a Clerk account.

## Routes and architecture

- Public: `/`, `/features`, `/how-it-works`, `/sign-in`, `/sign-up`.
- Protected: `/dashboard`, `/projects`, `/projects/:projectId`, `/evaluations`, `/results`, `/settings`.
- `App.tsx` composes theme, router, Clerk and Query providers.
- `components/auth/AppProviders.tsx` creates one query cache per Clerk identity/session. Signing out or changing account discards the previous cache.
- `components/auth/RequireAuth.tsx` waits for Clerk and redirects signed-out visitors to sign-in.
- Existing authentication pages embed Clerk's complete sign-in/sign-up flows, including verification and recovery supported by the configured instance.
- `lib/api-client.ts` is the only FastAPI request boundary. `getHealth()` remains public and unchanged.
- `lib/api-types.ts` and `api-validation.ts` describe and validate public response contracts.
- `lib/queries.ts` contains the project/document queries and mutations. Tokens come from Clerk's `getToken()` and use `Authorization: Bearer <session token>`.
- Pages supply real state and data to existing presentation components.

## Connected flow

Sign in → list/create project → open project → list/upload `.txt` documents → run a synthetic evaluation → display the returned summary and expandable analysis.

Connected endpoints:

| Method | Path |
| --- | --- |
| GET | `/health` |
| GET, POST | `/projects` |
| GET | `/projects/{id}` |
| GET | `/projects/{id}/documents` |
| POST | `/projects/{id}/documents/upload` |
| POST | `/projects/{id}/evaluations/run` |

Uploads use `FormData` with the `file` field. The browser sets the multipart boundary. Use a non-empty UTF-8 file with a lowercase `.txt` extension. Duplicate filenames produce a readable conflict message; failed processing may leave a real document marked `failed`.

Evaluation defaults compare semantic, BM25 and hybrid using the backend's default configuration values. Advanced controls allow a single strategy, 1–12 cases, chunk size 40–1000, overlap 0–300 (smaller than chunk size), and top-k 1–20. No backend evaluation logic is duplicated. Writes and paid evaluations never retry automatically.

The Results page uses backend percentage strings, recommendation explanations and guardrail decisions directly. Technical analysis is collapsed by default. Hidden ground truth, retrieved text and judge internals are not rendered.

## Current limitations

- Results are held in memory for the signed-in session. Reloading or signing out clears them. The backend saves runs but has no endpoint for reopening them.
- Evaluation history, dashboard aggregates, a recent-project feed, project editing/deletion, document deletion and server settings remain unavailable.
- Theme preference is local to the browser; first visit defaults to light. The supplied logo is unchanged.
- If a long evaluation loses its connection, the server may still be processing it. Do not immediately resubmit; automatic retry is disabled.

## Verification

```powershell
npm run build
npm run lint
npm run test
```

Frontend tests cover request/auth contracts, error handling, multipart uploads, response validation, protected-route rendering, redirect safety and result rendering. Fixtures live only in `tests/` and never enter the product bundle.

Run backend tests from the repository root with `.venv/Scripts/python.exe -m pytest -q`; the existing tests mock LLM calls.

Live verification requires the user to finish Clerk's GitHub/Google login. Then create a clearly named verification project, upload a small factual `.txt` document, run **one case with one experiment**, inspect the real recommendation, and verify sign-out prevents access to protected routes. No automatic paid live evaluation is performed by the test suite.

### Local verification completed — 2026-10-13

- The user's GitHub/Clerk session successfully called the real-auth backend. Root `USE_TEST_AUTH=false` is now configured; frontend API base is `http://127.0.0.1:8001`.
- Created project **4**, `Phase A verification — 2026-10-13`, through the UI; verified it in the API-backed list and detail page.
- Uploaded `phase-a-verification.txt` (967 bytes); document processing completed with status `ready`.
- Ran exactly one live evaluation: one synthetic case, BM25, chunk size 120, overlap 20, top-k 1. Run **6**, dataset **2**, completed successfully and rendered real summary and technical analysis.
- The backend reported a 100.0% recommendation score, 100.0% faithfulness/correctness/relevance/MRR/recall, and 0.0% hallucination. These are a **single-case smoke test**, not evidence of representative production quality.
- Read-only PostgreSQL checks confirmed real account ownership and persisted analysis. Anonymous `GET /projects` returned 401; a legacy test-owned project was denied with 404 for the signed-in user.
- Sign-out and protected-route behavior were checked. Sign-out clears the session result cache; the saved run cannot be reopened through the current API.
- Frontend build/lint passed; 25 frontend tests and 45 backend tests passed. Backend tests use mocked LLMs. One existing Starlette/httpx deprecation warning remains.
- No backend source/evaluation logic was changed for this integration. No commits, pushes, migrations or secret staging were performed. The temporary port-8002 verification server was stopped.
- Separate Google sign-in, new-account sign-up, representative multi-configuration evaluations and production deployment were not live-tested. Clerk is configured with development keys for this local phase.

## Phase A changed-file inventory

Paths below are relative to `frontend/`, except the explicitly marked root environment file. Pre-existing backend/CORS, health indicator and unrelated marketing changes are not part of this integration's edits.

| File | Purpose |
| --- | --- |
| `README.md` | Setup, architecture, limitations, verification and this inventory. |
| `package.json` | Clerk dependency, Vitest and test command. |
| `package-lock.json` | Locked dependency changes. |
| `.env.example` | Public-only configuration template. |
| `.env` (ignored) | Matching public Clerk key and final port-8001 API URL. |
| `../.env` (ignored, repository root) | Disabled test auth after real Clerk verification. |
| `src/App.tsx` | Composed router, theme and application providers. |
| `src/router/router.tsx` | Protected workspace routes. |
| `src/components/auth/AppProviders.tsx` | Clerk and identity/session-isolated TanStack Query provider. |
| `src/components/auth/RequireAuth.tsx` | Session loading and signed-out route protection. |
| `src/components/auth/AuthFormLayout.tsx` | Kept existing layout, removed preview-only messaging. |
| `src/pages/auth/SignInPage.tsx` | Real Clerk sign-in and safe return destination. |
| `src/pages/auth/SignUpPage.tsx` | Real Clerk sign-up. |
| `src/layouts/AppLayout.tsx` | Real sign-out and query-cache clearing. |
| `src/lib/api-client.ts` | Typed authenticated endpoint calls, readable errors and response validation; preserved `getHealth()`. |
| `src/lib/api-types.ts` | Backend-aligned public TypeScript contracts. |
| `src/lib/api-validation.ts` | Runtime validation of important response fields. |
| `src/lib/auth-redirect.ts` | Restricts sign-in return paths to internal workspace routes. |
| `src/lib/queries.ts` | Project/document reads and create/upload/evaluate mutations; session result cache. |
| `src/lib/view-models.ts` | Reuses the real project contract with UI state types. |
| `src/pages/app/ProjectsPage.tsx` | Real project listing, creation, retry and empty/loading/error states. |
| `src/pages/app/ProjectDetailPage.tsx` | Real project/documents, ownership-aware errors, upload/evaluate flow. |
| `src/components/projects/ProjectList.tsx` | Displays only real project fields. |
| `src/components/projects/ProjectForm.tsx` | Name-only creation with validation and pending/error states. |
| `src/components/projects/DocumentUpload.tsx` | Real `.txt` file selection/upload and state feedback. |
| `src/components/ui/Dialog.tsx` | Prevents dismissing project creation while it is pending. |
| `src/components/evaluation/EvaluationControls.tsx` | Synthetic evaluation request using supported backend fields and bounds. |
| `src/components/evaluation/EvaluationSummary.tsx` | Displays backend summary/percentage strings directly. |
| `src/components/evaluation/AdvancedDetails.tsx` | Readable public technical analysis, without hidden evidence or judge internals. |
| `src/components/evaluation/types.ts` (deleted) | Removed obsolete display contracts in favor of real API types. |
| `src/pages/app/ResultsPage.tsx` | Actual session result and honest unavailable/empty states. |
| `src/pages/app/DashboardPage.tsx` | Connected project navigation; honest unavailable aggregates. |
| `src/components/dashboard/DashboardEmptyState.tsx` | Replaced misleading preview copy. |
| `src/pages/app/EvaluationsPage.tsx` | Clearly states history API is unavailable. |
| `src/pages/app/SettingsPage.tsx` | Distinguishes local theme from unavailable server settings. |
| `src/styles/application.css` | Minimal document, pending-control, sign-out and results styling. |
| `tests/api-client.test.ts` | Auth/header, endpoint, error, multipart and validation coverage. |
| `tests/auth.test.tsx` | Protected-route rendering and safe redirect coverage. |
| `tests/evaluation-result.test.tsx` | Backend summary rendering and hidden-information exclusion. |
