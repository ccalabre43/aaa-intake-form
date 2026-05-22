## Goal

When the user submits the intake form, send the captured data (and any uploaded attachments) to Adobe Workfront as a new request, in addition to showing the existing on-screen submission summary.

## How it will work

1. **User submits the form** (existing validation still runs).
2. **Browser calls a TanStack server function** `submitToWorkfront` with the form data + files (base64-encoded).
3. **Server function calls Adobe Workfront's REST API** using your API token, creating a new Issue (Workfront's "request" type), then uploads each attachment and links it to the issue.
4. **User sees the existing success screen**, now augmented with the Workfront request ID + a direct link to view it in Workfront, or a clear error message if the API call fails.

## Workfront API plan (standard fields + description blob)

- `POST {WORKFRONT_URL}/attask/api/v15.0/optask` with:
  - `name` ← `projectSummary` (first ~120 chars) — Workfront's issue name
  - `description` ← formatted blob of every other field (requester, email, job function, communication type, background, audience, deliverables, goals, success measurement, dates, notes)
  - `enteredByID` / `ownerID` ← optional, only if you give a Workfront user ID later
- Auth header: `apiKey: {WORKFRONT_API_TOKEN}`
- Attachments: for each file, `POST /upload` (multipart) → get handle → `POST /document` with `objCode=OPTASK` and the new issue's ID.

I won't create a Workfront project/queue mapping yet — the issue will land in your default queue. Once you have a Request Queue ID, we can add one line to route into it.

## Secrets I'll request

Via the secrets prompt (you enter values in a secure form):
- `WORKFRONT_API_TOKEN` — your X-API-Key from Workfront
- `WORKFRONT_URL` — your instance base URL, e.g. `https://yourcompany.my.workfront.com`

## Files to add / change

- **New** `src/lib/workfront.functions.ts` — `submitToWorkfront` server function (creates issue + uploads files)
- **New** `src/lib/workfront.server.ts` — fetch helpers for Workfront REST endpoints, description-blob formatter
- **Edit** `src/components/intake/IntakeForm.tsx` — on submit, call the server function, store returned `workfrontId` + `workfrontUrl` alongside the existing `submitted` state, show a toast on failure
- **Edit** `src/components/intake/SubmissionSummary.tsx` — show "Workfront request: #XXXXX — View in Workfront" link when present

## Out of scope (can add next)

- Routing into a specific Request Queue / template
- Mapping intake fields to Workfront custom-form parameters (`DE:fieldName`)
- Per-user Workfront login (this uses one shared API token for all submissions)
