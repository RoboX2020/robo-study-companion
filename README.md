# RoboStudy

Draft Track D prototype for Multimodal AI Hackathon 2026. Learn robotics from cited source material and practice weak topics.

## Run

Node 18+ required. `npm ci && npx vite` starts the frontend. `npm test` validates authored questions, retrieval/refusal, citation checks and learner updates. `npm run evaluate` produces the deterministic baseline report. `npx vite build` creates `dist/`.

Optional AI gateway: deploy the Python `api/index.py` endpoint on Vercel's free tier, setting `GEMINI_API_KEY` privately and `GEMINI_MODEL` to a supported free-tier model. Keep billing disabled. Never put a key in frontend code. Without a configured backend, disable AI to use source search and authored practice.

## Architecture

Vite + vanilla JavaScript frontend. PDF.js extracts PDF text and renders exact pages. JSZip extracts PPTX slide text. VTT/SRT imports preserve timestamps. Optional multimodal inference describes PDF diagrams or sampled video frames. BM25-style lexical retrieval selects source units. Extractive search copies actual course excerpts. Generated answers require exact excerpt quotes and IDs before citations are accepted.

Adaptive practice uses a Bayesian knowledge-tracing estimate (guess 0.25, slip 0.10, learning transition 0.12). Questions favor weaker topics and unseen IDs. Short answers use visible keyword rules with lower update weight. Conversations are tracked as engagement, not falsely treated as evidence of learning. LocalStorage holds learner state; files stay in memory and vanish on reload.

## Course sources and credit

Public Robotics Playbook: https://www.prajvalarora.com/playbook . Public Isaac Sim / ROS 2 Lab 3: https://tatwik19.github.io/labs/lab-03-isaac-sim/ . Lab authors: Prajval Arora and Sai Srinivas Tatwik Meesala. Instructor: Prof. Sangram Redkar. No private Drive originals are included. Source units preserve section titles; public web pages lack reliable exact-section deep links, so citations open an in-app excerpt with an original-page link.

Known source disagreement: Chapter 2 uses servo pin 3 in the code and pin 9 in prose. No pin-number quiz is generated from that mismatch.

## What works and what is incomplete

Working offline: public source retrieval, excerpt citations, unsupported-query refusal, 12 source-validated authored MCQ/short/numerical questions, local PDF/PPTX/text/caption import, local mastery dashboard, course map.

A tiny Gemini 3.8 Flash provider test passed, but realistic tutor calls returned timeout/503 high-demand errors on October 12. End-to-end AI tutor and PDF/PPTX/video fixture ingestion passed locally at 17:27, but subsequent requests still returned 503. AI question-generation/verification remains unverified. Implemented paths: source-grounded generated answers, two-pass question generation/verification, PDF diagram descriptions, sampled video-frame extraction. Small videos up to 2 MB use full media understanding including audio; larger files currently use visual sampling only. A real two-slide PPTX fixture passed local parsing and live image-understanding tests. A149KB spoken-video fixture passed at18:15, with correct spoken numbers and timestamped content. This does not verify long lecture handling. PPTX embedded images are extracted and sent for image understanding with slide citations; original slide layout is not rendered. Uploaded topics use deterministic keyword rules, not model-inferred prerequisite graphs. Five-question mock exams and transparent keyword-based upload topic tagging are implemented. Semantic short-answer grading and live-model prerequisite inference remains unverified.

Evaluation in `evaluation/baseline.json` is a seven-case deterministic baseline. `evaluation/deepeval_run.py` runs custom precision/recall metrics using DeepEval BaseMetric and LLMTestCase, with telemetry disabled. Install DeepEval in a Python virtual environment and run `python evaluation/deepeval_run.py` from the project root. These are transparent custom source-ID metrics, not built-in LLM-judged metrics. Built-in semantic evaluation is implemented in `evaluation/deepeval_semantic.py` using a schema-aware free Gemini judge. One observed /clock AI answer scored 1.0 on FaithfulnessMetric, AnswerRelevancyMetric later scored1.0 and ContextualPrecisionMetric0.639 on the same case. ContextualRecallMetric failed with a provider HTTP error. `evaluation/deepeval-semantic.json` records this incomplete run. This single easy case does not prove general faithfulness; multi-case semantic evaluation and contextual recall remain incomplete. Simulated profiles show learner-model estimates across scripted sessions, not real human learning gains. Do not present this as full Track D compliance until those gaps are addressed.

## Privacy and API limits

AI is opt-in per request. Gemini unpaid content may be used to improve Google models and reviewed by humans. Do not send sensitive, confidential or personal material. Adult demo use only, outside EEA/UK/Switzerland. No paid fallback. API quotas may interrupt inference. Prototype is not production-secure and should not expose an unrestricted model endpoint.

## AI-assisted development disclosure

Code, UI, authored tests and documentation were AI-assisted. Course material is credited to its actual authors. The owner must review and understand the implementation before submission. No model fine-tuning was performed.

Local text now survives PDF/PPTX AI extraction failures. Offline excerpts preserve short code/formula lines and reject empty or invalid citation quotes. The /clock fallback and formula regression tests pass.

Evidence-backed AI concept/prerequisite extraction is implemented. Exact concept quotes, unique IDs, valid edges and acyclic graphs are required. A mocked browser contract test passed; real model output still needs a live test. Edge reasoning remains a model suggestion, not a proven dependency.

2026-10-12 18:46 test: AI question proposal returned successfully; separate verifier returned503. No generated questions were accepted. Context sampling now balances course topics.
