# Hackathon submission notes

## Project metadata

- **Project title:** Meta Anatomy Research Lab — TakeApart
- **Problem statement:** Build for Your World
- **Short description:** An interactive atlas of illustrative anatomy and engineering models, paired with a Meta-powered field engineer that explains what a model depicts and offers a small, educational JavaScript sketch.
- **Repository:** https://github.com/Belloblaze-web3/meta-anatomy-research-lab
- **Team:** Add the submitter and any teammates before filing the form; the guide permits no more than four people.

## What is new for the Hackathon

The new contribution is the **Meta AI Engineering Lab**: Explain, Engineer, and Code modes; model-aware starter prompts; a server-curated context for each selected specimen; and a server-side Meta Model API adapter that keeps the API key out of the browser. The assistant is explicitly labeled as the Hackathon build in the interface. It makes no model request until the user submits a question.

The integration uses **Muse Spark 1.3 Standard** through the Meta Model API Chat Completions endpoint. One live answer was verified through the actual project handler in local development using the protected Development secret. The public Render site has not been updated and no Render API service has been created or deployed. Automated API tests use mocked responses. Do not describe the integration as publicly deployed.

## Existing foundation — not presented as new work

The TakeApart particle-scene renderer, Turtle Tower / Human Atlas / V8 Engine illustrations, camera and on-device hand-tracking flow, gesture controls, navigation, and original editorial visual system predate the Meta AI Engineering Lab. Show those only as context for the new assistant, not as Hackathon-built functionality.

## Privacy and scope

The assistant receives a typed question, a selected mode, and a small server-curated text description. It does not receive video, images, hand landmarks, or scan files. The server does not persist conversations. The interface discloses that prompts are sent to Meta and that model usage may incur pay-as-you-go charges.

This is educational model exploration. It is not a medical-scan evaluator, medical device, diagnostic system, or clinical decision-support tool. Do not upload patient data. The anatomy drawings are illustrative and are not anatomically validated.

## Demo requirement

The guide asks for an approximately three-minute demo video. Record an authentic screen walkthrough of the actual site that focuses on the new assistant, shows the question triggering a real response, and states its limits. **The screen-recorded video is not yet in this repository.** Do not submit the outline as if it were a recording, and do not use AI-generated footage as product evidence.

The submission rules also require a public GitHub repository and a maximum team size of four. The existing public repo has been renamed to the URL above. Complete the team field with actual participant names before submission.

## References

- [Meta Global AI Developer Hackathon participant guide](https://dev.meta.ai/)
- [Meta Model API](https://dev.meta.ai/products/meta-model-api)
- [Muse Spark models](https://dev.meta.ai/models/muse-spark)
