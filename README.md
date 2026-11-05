# Meta Anatomy Research Lab — TakeApart

An educational, interactive atlas that pairs particle-built anatomy and engineering models with a new Meta AI Engineering Lab. The viewer, camera/gesture controls, and three procedural models are the existing TakeApart foundation. The Hackathon contribution is the model-aware Explain / Engineer / Code assistant and its server-side Meta Model API adapter.

## Current status

The integration targets Muse Spark 1.3 Standard at Meta's Chat Completions endpoint. One concise live response was verified through the project's server proxy using the protected Development secret. The key is server-only and is never part of the browser bundle or repository. The automated tests use mocked upstream responses. No Render API service was created or deployed, and the existing Render static site was not updated; the live verification was local only.

## Run locally

Use Node.js 20.19+ and the pinned pnpm version in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

The Vite development server serves `/health` and `/api/meta/ask` through the same handler used by `server/index.js`. Without `MODEL_API_KEY`, health reports `configured: false` and no upstream request is made. To test further, configure a fresh Meta key only in a private Development environment as `MODEL_API_KEY`; do not paste it into chat, commit it, or include it in any `VITE_` variable. A real request can incur pay-as-you-go API charges.

`server/index.js` is the Node API listener for a future separately authorized host. It reads `PORT` and `MODEL_API_KEY` at runtime. `VITE_META_API_ORIGIN` is a public endpoint URL, not a secret; keep it blank until a backend service is deliberately created and deployed.

## What the assistant can and cannot do

The server supplies a small written description of the selected Turtle Tower, Human Atlas, or V8 Engine illustration. The model sees only that description, the selected mode, and the user's typed question. The app does not send camera video, hand landmarks, images, or medical scans to Meta; it does not store chat on the server. Generated code is displayed as inert text.

These are conceptual illustrations, not validated biological models, engineering drawings, or medical images. **The project does not accept or evaluate medical scans, diagnose conditions, recommend treatment, or provide clinical decision support. Do not upload patient data.**

The supplied [hackathon submission notes](HACKATHON_SUBMISSION.md) separate the new contribution from the pre-existing viewer. The [three-minute demo outline](DEMO_SCRIPT.md) is a recording guide; the actual screen-recorded video is still pending.

## API behavior and safeguards

The server uses `POST https://api.meta.ai/v1/chat/completions`, `muse-spark-1.3`, Muse Spark's documented `reasoning_effort: "minimal"`, `max_completion_tokens: 2048`, and `store: false`. It validates model/mode/question, limits request size, applies in-memory per-IP throttling and concurrency limits, checks allowed origins, times out upstream requests, returns generic errors, and avoids logging prompts or credentials. These best-effort demo limits are not a hard billing cap or a substitute for authentication on a public API.

Official references: [Meta Model API overview](https://dev.meta.ai/products/meta-model-api), [authentication](https://dev.meta.ai/docs/authentication), [Chat Completions](https://dev.meta.ai/docs/api-reference/chat-completions/create-chat-completion), and [pricing and rate limits](https://dev.meta.ai/docs/pricing-rate-limits).
