## Goal

1. Send the form to a real endpoint when someone submits it, and clearly show when it's sending, when it worked, and when it failed.
2. When someone drops a creative brief into the brief upload box, read the file and fill in the matching form fields for them.

## Part 1: Submission with loading and error states

- Each submission is saved to the database (Lovable Cloud), along with any attachment files. This works now and doesn't need Workfront.
- While it's sending: the Submit buttons (in the bottom bar, next to the brief, and in the pop-up) show a spinner and "Submitting…", are disabled, and can't be clicked twice.
- On success: the existing success screen appears, with a reference number.
- On failure: a red message explains what went wrong, everything the user typed stays put, and a "Try again" button sends it again. Network errors, rejected input, and server errors each get their own plain-language message.
- Workfront: once the Workfront token and address are added, the same submission is also sent to Workfront and the success screen shows a link to the request. Until then, saving to the database still works on its own.

## Part 2: Auto-fill from the brief upload

- Dropping a PDF, Word document, or text file into "Upload your creative brief here" starts reading it. The box shows "Reading your brief…" while it works.
- AI pulls out the details and fills in the empty matching fields: project summary, background and purpose, audience, deliverables, goals, how success is measured, completion date, timing notes, and communication type.
- Anything the user has already typed is never overwritten.
- When it finishes, a message says how many fields were filled in, and those fields are briefly highlighted so the user can check them.
- If the file can't be read (for example a scanned image or an unsupported format), a friendly message appears and the form keeps working normally.
- Fields filled this way count toward unlocking the next sections, the same as typing them.

## Technical details

- Database: a new `intake_submissions` table with the form data stored as JSON, plus `status`, `workfront_id`, and `created_at` columns, and a private `intake-attachments` storage bucket. Visitors are anonymous, so access is insert-only and goes through the server function; there are no public read policies.
- `src/lib/intake.functions.ts`: `submitIntake` validates the input with the same zod schema, writes the row, uploads the files (sent as base64), and calls Workfront only if the `WORKFRONT_*` secrets exist. It returns `{ id, workfrontUrl? }` or a typed error.
- `src/lib/brief.functions.ts`: `extractBrief` gets the text out of the file in the browser (`pdfjs-dist` for PDF, `mammoth` for DOCX, plain read for text), sends it to the server, and the server calls the Lovable AI Gateway (`google/gemini-3-flash-preview`) with a tool schema that matches the fields in `IntakeData`. The input size is capped.
- `IntakeForm.tsx`: adds a submit state (idle, submitting, error), shared spinner buttons, an error banner with retry, and a merge-into-empty-fields step after extraction. `SubmissionSummary.tsx` shows the reference number and the Workfront link.
- Track both tasks in `roadmap.md`.
