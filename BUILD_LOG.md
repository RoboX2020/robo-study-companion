# Build log

2026-10-12: Retrieved official Track D statement and submission guidelines. Verified Wednesday Oct 14 11:45am Arizona deadline. Located two owner-created Isaac Sim guides in Drive. Retrieved public Playbook chapter 1. Found a misleading Drive filename RAS545_Lab3: it is an unrelated Dobot lab by other authors, excluded.

Architecture: mobile-first static frontend + Python serverless API. Source extraction in-browser for PDFs and slide decks; optional Gemini multimodal extraction for video and diagram descriptions. Lexical retrieval and extractive tutor remain usable without credentials. Mastery is device-local, never a claim of measured student learning. Evaluation must separate deterministic metrics from model-evaluated metrics.

Draft only. Private repository, no submission, no billing, no publication of private Drive originals.

2026-10-12 17:09 AZ: Frontend build and 12 question tests passed. Phone widths 320/390 and desktop 1280 checked. PDF exact-page citation visually checked. Dedicated Gemini free project/key created and vaulted; no billing enabled. Tiny provider test passed; realistic calls timeout or 503. Private GitHub source saved by browser editor; redundant nested directories removed. Vercel private repo import cannot access RoboX2020 with the existing TAPRI-AI-only scope. Static drop prepared but not deployed because audience approval is unresolved. Demo v2 is 3:49 with English subtitles and explicit prototype caveats, private Drive review draft only.

2026-10-12 17:27 AZ: Implemented balanced five-question mock exams and keyword upload topic tagging. Browser exam and PPTX local/image viewer tests passed. AI tutor, PDF diagram, PPTX image and small video fixture tests succeeded via dedicated free key, then provider 503s returned on subsequent generation test. AI failure now falls back to source excerpts. Large lecture video/audio handling and semantic evaluation remain incomplete. No public deployment authority received.

2026-10-12 17:32 AZ: Built-in DeepEval semantic harness added. One actual /clock tutor response scored FaithfulnessMetric=1.0; AnswerRelevancyMetric timed out and run recorded incomplete. No broad semantic score claim. Exact private repository readback uses textarea value, not virtualized editor DOM.

2026-10-12 17:51 AZ: Fixed fallback excerpt grouping across Markdown code fences; /clock and formula tests pass. Reject empty/invalid quote evidence. Real two-slide PPTX local+AI fixture passed. Spoken-video test returned503; test now requires upload success before inspecting citations. PDF/PPTX keep local text when optional AI fails. No public hosting decision received.

2026-10-12 18:17 AZ: Spoken149KB video ingestion passed live free-tier model, with correct150-ohm calculation and0s citation. Added evidence-backed concept map extraction, unique-ID/edge/cycle checks and phone UI; mocked browser contract passed, live inference not tested this wake. No public hosting authority.

2026-10-12 18:48 AZ: Representative topic-balanced context sampling added and tested. AI question proposal succeeded but verifier503 prevented acceptance. Recorded fresh private demo showing current offline search, mock exam/report, BKT, PDF original-page viewer and real PPTX images. No fake model answers in recording.

2026-10-12 19:16 AZ: Resumable built-in DeepEval harness preserves completed scores. Single observed /clock answer: prior faithfulness1.0 (3.8Flash), relevance1.0 and context precision0.639 (3.6Flash). Context recall HTTP error; stopped, no retry. Per-metric judge provenance retained. No multi-case accuracy or learning-gain claim.

2026-10-12 19:47 AZ: Completed single observed /clock DeepEval smoke test: faithfulness1.0, relevance1.0, contextual precision0.639, recall1.0. Per-metric judge provenance retained. Added malformed generated-question checks (prompt, explanation, difficulty, quote and keyword shape). Still not a multi-case accuracy evaluation.
