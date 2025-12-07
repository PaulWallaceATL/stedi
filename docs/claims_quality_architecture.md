# Clinix AI — Claims Quality Architecture (Stedi-backed)

## Goals
- Achieve and maintain >90% clean-claim / first-pass acceptance.
- Keep payer rules, validation, enrichment, and telemetry proprietary.
- Use Stedi for transport/validation; own schema, rules, AI assist, and feedback loops.

## High-Level Architecture
1) **Canonical claim model & ingestion**
   - Strict schema: patient/subscriber, provider (NPI/tax ID), payer ID, DX↔CPT pointers, POS, modifiers, charges, service dates, attachments/notes, idempotency key, usageIndicator.
   - Normalize: NPI check-digit, tax ID format, member ID, DOB, names/addresses (ZIP+4).
   - Code validity: CPT/HCPCS, ICD-10, modifiers current; required diagnosis pointers; POS validity.
   - Payer routing: map payer names → tradingPartnerId (no free-text payer IDs).

2) **Payer/specialty rules (deterministic)**
   - Required fields per payer/specialty; POS/modifier combos; DX/CPT compatibility; frequency limits; prior-auth/referral flags; NCCI edits; bilateral/global/MPPR nuances.
   - Pre-submit hard checks: block or auto-fix missing/invalid required fields; enforce idempotency keys to prevent duplicates.
   - Testing safety: set `usageIndicator: "T"` for validation in prod rails.

3) **Generative AI as a guarded copilot**
   - Retrieval + grounding: pull payer/specialty rules and historical rejection/denial patterns; show to the model.
   - Suggestions: POS/modifiers, DX↔CPT alignment, missing fields, prior-auth/referral need; concise supporting notes.
   - Constrained output: JSON that matches the canonical schema; reject invalid JSON.
   - Confidence gating: auto-apply high-confidence; route low-confidence to human review.

### Generative AI: Implementation Details
- **Inputs to the model**
  - Canonical claim JSON (or diff vs last accepted version).
  - Retrieved artifacts: payer/specialty rules, top recent AAA/ACK/277/835 codes for this payer/specialty, code validity hints (CPT/ICD/POS/modifiers), network/coverage signals from eligibility.
  - Task instruction: suggest minimal changes to maximize first-pass acceptance; never invent member IDs or NPIs; respect schema.
- **Retrieval**
  - Vector index over rules, denial exemplars, and successful patterns; filter by payer + specialty + POS + modifiers when available.
  - Always include top-N recent rejections/denials for this payer/specialty.
- **Prompting**
  - System message: guardrails (no PHI fabrication, no free text, output must conform to schema).
  - Few-shot examples: “bad → fixed” pairs showing how to adjust modifiers, POS, diagnosis pointers, add missing required fields, or set prior-auth flags.
- **Constrained output**
  - Use a JSON schema (or function-calling) that matches the canonical claim; reject and re-ask on invalid JSON.
  - Require a field for “changes” with rationale and confidence score.
- **Confidence and application**
  - If confidence ≥ threshold and changes are small/safe, auto-apply; otherwise send to human review.
  - Always run deterministic validators after AI suggestions; if validators fail, drop AI changes.
- **Safety/PII**
  - Never generate member IDs, NPIs, tax IDs, or payer IDs—only reuse provided values; only suggest structural/code fixes.
  - Strip or block any hallucinated sensitive data; enforce allowlists for code systems and ID formats.
- **Learning loop**
  - Label outcomes (pass/reject/deny) and store the AI-suggested changes plus rationale.
  - Periodically mine the most effective suggestions and promote them to deterministic rules.
  - Refresh retrieval corpus with the latest denials/resolutions; A/B test prompt tweaks and thresholds.
- **Monitoring**
  - Track: acceptance delta for AI-touched claims, rollback rate (validator or human veto), latency added, and top suggestions by payer/specialty.
  - Alert if acceptance drops or invalid JSON rate spikes.

4) **Eligibility & prechecks**
   - Mandatory eligibility before submit; stop on AAA 71/72 (DOB/member ID mismatch).
   - Use plan/network/cost-share signals to catch obvious non-coverage cases.
   - Fail fast with clear remediation.

5) **Test-mode in production rails**
   - Submit claims with `usageIndicator: "T"` to exercise clearinghouse edits without payer impact.
   - Inspect 277CA edits; feed back into rules and prompts.

6) **Transaction lifecycle & telemetry**
   - Persist submissions with our IDs + Stedi trace IDs; correlate 277CA/835 via claim ID/idempotency key.
   - Metrics: clean-claim rate, first-pass acceptance, top rejection/denial reasons, per-payer/specialty performance, latency/error budgets.
   - Observability: logs with payload hashes, ruleset version, AI provenance; alerts on AAA/ACK/403 spikes.

7) **Feedback loop from 277/835 (learning)**
   - Aggregate AAA/ACK rejects, 277CA edits, CARC/RARC denials by payer/specialty/provider.
   - Prioritize fixes for top-volume issues; update rules and prompt snippets.
   - Supervised signals: labeled outcomes (pass vs reject/deny) to refine prompt templates or lightweight models.

8) **Human-in-the-loop & provenance**
   - Review queue for low-confidence AI suggestions and new payer edge cases.
   - Full provenance: input, retrieved rules, AI suggestion, final payload, idempotency key, Stedi trace IDs.

9) **Security & keys**
   - Keys server-side only; separate test/prod keys (optionally per-customer).
   - Input sanitization: strip non-JSON, enforce schema before proxying.

## Components
- **Canonical schema & validators:** JSON Schema/Zod/TS interfaces; enforce required fields, code validity, pointers, POS, NPI/tax ID formats, idempotency keys.
- **Rules service:** Versioned payer/specialty rules; applied deterministically; retrieval-friendly for AI grounding.
- **AI assist layer:** Prompt templates with retrieved rules + denial exemplars; constrained JSON output; confidence gating.
- **Stedi proxy:** Env-configured keys/base; accepts `{ path, method, body, idempotencyKey }`; sets Authorization/Idempotency-Key; logs URL/trace/status.
- **Transaction store:** Submissions + 277CA/835 correlated by our IDs and Stedi trace IDs; analytics/dashboards.
- **UI/workbench:** Panels for eligibility, claims (`usageIndicator: "T"` preset for tests), status, enrollments, ERA polling; copy/paste canonical payloads; show trace IDs and confidence flags.

## Flows
- **Eligibility (270/271):** Normalize subscriber/dependent + payer; call `/2024-04-01/change/medicalnetwork/eligibility/v3`; halt on AAA 71/72 until corrected.
- **Claim submit (837):** Validate schema + rules; set `usageIndicator: "T"` for tests; apply payer edits; AI suggestions under guardrails; submit with idempotency; process 277CA and feed edits back.
- **Claim status (276/277):** Use payer claim/control numbers when available; store 277; correlate.
- **Enrollment/ERA:** Enroll to payer `STEDI` (safe test) with chosen NPI/tax ID; send test claim to payer `STEDI` (`usageIndicator: "T"`) to receive mock 835; poll/ingest and improve denial rules.

## Observability & Targets
- KPIs: clean-claim rate, first-pass acceptance, top rejection/denial reasons, per-payer/specialty performance.
- A/B changes: ship rule/prompt updates behind flags; roll back if KPIs dip.
+- Latency/error budgets: monitor proxy + Stedi; alert on AAA/ACK/403 spikes.

## Execution Steps
1) Finalize canonical claim schema and validators; enforce in proxy/UI.
2) Stand up rules service; add top payer/specialty rules; version them.
3) Add test-mode presets (`usageIndicator: "T"`) for claims; require eligibility precheck; block on AAA 71/72.
4) Implement AI assist with retrieval + constrained JSON + confidence gating.
5) Persist submissions, 277CA/835; add dashboards for clean-claim/denial metrics.
6) Iterate weekly on top rejection/denial causes; update rules/prompts; A/B test changes.
7) Keep keys server-side; maintain test vs prod keys; optionally per-customer routing.

## How Learning Works (Feedback Loop)
- Ingest 277CA and 835 responses; extract AAA/ACK/denial (CARC/RARC) codes with payer/specialty context.
- Aggregate by volume and impact; identify top rejection/denial reasons.
- Update deterministic rules (required fields, POS/modifiers, DX↔CPT, prior-auth/referral, frequency limits).
- Update AI prompts with new exemplars and retrieved rules; keep outputs schema-constrained.
- Track outcomes (pass vs reject/deny) to measure impact; roll back if KPIs worsen.
- Repeat continuously; focus first on high-volume payer/specialty pairs to maximize lift.
