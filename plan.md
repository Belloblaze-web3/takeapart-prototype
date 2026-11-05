# Meta Anatomy Research Lab — TakeApart

## Approved scope and boundaries

The user requests a submission-ready hackathon project: a live Meta Model API integration, complete submission metadata, a professional public GitHub repository name/description/topics, all changes pushed to GitHub, and an approximately three-minute screen-recorded product walkthrough. This supersedes the earlier code-only restriction for **one local live API verification**. Use only the protected Development-scoped `MODEL_API_KEY`; do not read, copy, or reuse API values pasted in chat, and never print, commit, or expose the protected key. The user did not authorize creating or deploying a Render API service; leave Render resources, the existing static site, and its deployment untouched.

The existing particle viewer and gesture/camera exploration are the pre-existing TakeApart foundation. The hackathon contribution is the newly labeled Meta AI Engineering Lab. Do not represent existing scene, camera, hand-tracking, model-picker, or gesture code as newly built. The project uses illustrative procedural models only: do not claim medical-scan evaluation, diagnosis, or clinical decision support; do not add scan upload or transmit patient data.

## Product behavior

Add a polished **Meta AI Engineering Lab** section marked **NEW HACKATHON BUILD** and **Meta Model API · Muse Spark 1.3**. It offers Explain, Engineer, and Code modes, model-aware prompts, a typed question field, a response view, and selected-model context for Turtle Tower, Human Atlas, and V8 Engine. The code mode presents inert JavaScript text only. The UI reports connection state honestly and does not imply that the canvas, camera, hand landmarks, or scan data are available to Meta.

Only an explicit user question sends content to the API. The server assembles the selected model's curated text descriptor and sends that plus the chosen response mode and typed question. No camera video, images, scans, gesture history, or stored conversation is included. The page discloses Meta processing and pay-as-you-go charges. A medical-scope notice states that the illustrations are educational and are not valid for diagnosis or clinical decisions.

## Meta API design

Use `POST https://api.meta.ai/v1/chat/completions` with `muse-spark-1.3`, Muse Spark's documented `reasoning_effort: "minimal"`, `max_completion_tokens: 2048`, and `store: false`. Use a high-precedence `developer` message for the curated model context and safety boundaries. Read `MODEL_API_KEY` only at server runtime. Never include it in client code, Vite variables, Git, logs, or responses.

The shared Node handler exposes `GET /health` and `POST /api/meta/ask`. Validate model/mode/question; cap payload and response size; allow only the existing TakeApart Render origin plus local development; use a timeout, in-memory per-IP throttle, concurrency cap, and generic upstream errors. These best-effort demo controls are not a hard billing limit. The local live test should issue one concise educational question through this exact handler and verify a visible answer. Automated API tests use mocks and must not call Meta.

## Hackathon submission and recording

The chosen problem statement is **Build for Your World**, applying Meta's model to educational anatomy and engineering exploration. Provide a short description, Meta API/model details, clear distinction between new and existing work, public GitHub link, privacy/safety scope, a team-size note (maximum four; names must be supplied by the submitter), and an approximately three-minute screen recording. The demo must focus on the new assistant and show actions leading to visible, real results. Do not imply a real Meta response in a video unless the live request succeeds. This must be an authentic screen recording of the actual site, not AI-generated footage represented as product evidence.

## Repository and deployment

Rename the public GitHub repository to `meta-anatomy-research-lab`, update its description and relevant topics, update local remotes/references, and push all source and submission files to its `main` branch. Save the project separately to Manus `origin/main` after fetching/integrating remote changes; `publishing.auto_publish` is confirmed `false`.

Keep the existing Render Static Site and URL intact. The repository includes a Node API server and Vite development middleware but no new Render web service is created, no API service is deployed, and the static site is not redeployed. A future Render activation requires a separate user request.

## Project structure

- `index.html` — existing interactive atlas plus the Meta AI Engineering Lab and privacy/safety disclosures.
- `src/main.js` — existing particle/camera/gesture behavior and selected-model handoff to the assistant.
- `src/assistant.js` — model/mode selection, prompts, availability status, safe answer rendering, and explicit user-triggered requests.
- `src/style.css` — TakeApart visual system plus responsive engineering console.
- `server/api.js` — shared API validation, origin/rate controls, curated descriptors, and Meta proxy.
- `server/index.js` — Node HTTP listener for a future separately approved service.
- `server/api.test.js` — mock-only tests for the API contract.
- `vite.config.js` — local middleware using the shared handler.
- `README.md`, `HACKATHON_SUBMISSION.md`, `DEMO_SCRIPT.md` — setup, contribution attribution, submission metadata, and recording outline.
- `.env.example`, `.gitignore` — safe environment names and local secret exclusion.

## Design

- **Movement:** Continue the techno-editorial field guide: an observatory notebook for objects, not a generic chatbot dashboard.
- **Principles:** Keep the scene in focus; make model knowledge and limits explicit; protect camera privacy; turn explanations into an invitation to experiment.
- **Color:** Preserve the near-black forest-green stage; reserve acid-lime for active/new AI affordances; retain paper-white and sage metadata.
- **Layout:** Use an offset editorial narrative beside a compact engineering console and open response area, avoiding a centered card-grid dashboard.
- **Signature elements:** Coordinate-style labels, thin orbit/particle motif, and mono-spaced status tags.
- **Interaction:** No automatic model calls; the user chooses a mode, sees the selected specimen, and explicitly submits a question. Code remains inert text.
- **Motion:** Keep the existing particle movement slow and restrained, honor reduced-motion preferences, and avoid animating readable response text.
- **Typography:** Reuse Manrope for headings/body and DM Mono for model identifiers, status, cost, and privacy notes.
- **Brand:** Preserve the custom TakeApart mark and particle-lime `#c7f36b`; personality is curious, precise, tactile.
