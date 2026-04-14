# Phase 6 — Architecture Roadmap

## Inputs used from earlier phases
- `docs/architecture-review/01-repository-inventory.md`
- `docs/architecture-review/02-current-architecture-map.md`
- `docs/architecture-review/03-critical-diagnosis.md`
- `docs/architecture-review/04-scalability-assessment.md`
- `docs/architecture-review/05-prioritized-recommendations.md`

This phase converts prioritized recommendations into a phased execution roadmap for a **local-first, no-server** architecture.

---

## Executive summary
The roadmap should favor **stability-first sequencing**: start with low-risk hardening and contract clarity, then introduce boundary extraction and structural improvements, and only later consider optional deeper shifts if growth signals justify them. The current architecture does not need a rewrite; it needs progressive reduction of ambiguity in ownership, persistence contracts, and module responsibilities.

---

## Phase A — Low-risk, high-return improvements (no major structural refactor)

### Goal
Increase reliability and developer confidence around current hotspots without changing the core architecture shape.

### Included changes
- Add persistence contract tests for hydration/import/export/normalization paths (`QW-1`).
- Remove duplicate sorting ownership and define one invariant owner for ordering semantics (`QW-2`).
- Standardize storage/import error semantics so failure behavior is explicit and consistent (`QW-4`).
- Add architecture guardrails doc for layering and ownership expectations (`QW-5`).

### Recommended order
1. Persistence contract tests (establish safety net).
2. Sorting ownership cleanup (reduce drift while tests protect behavior).
3. Error semantic standardization (align failure handling across flows).
4. Architecture guardrails documentation (lock in patterns for contributors).

### Prerequisites
- None beyond current build/test setup.
- Team agreement on canonical owner of ordering invariants and error policy language.

### Risks
- Minor churn in tests while contracts are clarified.
- Potential mismatch between documented and currently implicit behavior during first pass.

### Expected outcome
- Lower regression risk in persistence and import/export paths.
- Faster refactors due to explicit invariants.
- Fewer “silent reset” or ambiguous failure experiences.

### Signals that this phase is worth starting
- Frequent changes touching `storage.ts` and state ordering logic.
- Repeated bug-fix cycles in import/hydration behavior.
- Contributors unsure where invariants should live.

### Signals that it is still too early
- Product is in a temporary prototype-only mode with no expectation of data compatibility.
- Team is about to make near-term product pivots that invalidate current persistence model.

---

## Phase B — Extract boundaries and internal contracts

### Goal
Reduce architectural ambiguity by separating orchestration, domain derivations, and UI concerns through explicit internal contracts.

### Included changes
- Extract non-UI derivations from `HistoryScreen.tsx` into pure reusable modules (`QW-3`).
- Introduce an application/use-case layer between UI and repository interactions (`MT-1`).
- Expand tests to include critical integration paths spanning UI orchestration + repository contracts (`MT-4`, first tranche).

### Recommended order
1. Extract pure derivation modules from `HistoryScreen.tsx`.
2. Define use-case interfaces for key flows (check-in mutation, import/export/reset, onboarding transitions).
3. Refactor `App.tsx` to call use-cases instead of direct orchestration logic.
4. Add integration tests around critical end-to-end local flows.

### Prerequisites
- Phase A test and invariant baseline in place.
- Lightweight architectural conventions documented (layer intent, ownership boundaries).

### Risks
- Behavioral regressions if extraction changes derivation semantics.
- Temporary increase in perceived complexity while boundaries are introduced.

### Expected outcome
- Smaller, more maintainable UI modules.
- Clearer ownership of orchestration logic and side effects.
- Improved ability to change features without central `App.tsx` coupling spikes.

### Signals that this phase is worth starting
- `App.tsx` continues accumulating mutation orchestration and callback wiring.
- `HistoryScreen.tsx` changes are high-risk due to mixed UI/data responsibilities.
- Reviews frequently debate “where this logic belongs.”

### Signals that it is still too early
- Feature scope is frozen and only minor bugfixes are expected.
- Team capacity cannot support parallel extraction + test stabilization.

---

## Phase C — Structural improvements for growth

### Goal
Harden persistence evolution and module relationships to support broader feature growth without architectural drift.

### Included changes
- Introduce explicit schema validation and versioned migrations for persisted data (`MT-3`).
- Progressively reorganize toward domain-oriented module boundaries (`MT-2`).
- Expand testing pyramid depth for repository contracts and critical UI integration scenarios (`MT-4`, broader coverage).

### Recommended order
1. Persistence schema contract definition (current version + migration policy).
2. Implement migration pipeline and validation checks.
3. Incremental module regrouping by domain/use-case boundaries (avoid big-bang move).
4. Backfill tests against migration and boundary contracts.

### Prerequisites
- Phase B boundaries established so module moves preserve contract semantics.
- Clear versioning policy for local data evolution.

### Risks
- Migration bugs can impact user data continuity if not carefully tested.
- Directory reorganization can introduce temporary import churn.
- Over-scoping if attempted as a single large refactor.

### Expected outcome
- Safer long-term data model evolution.
- Better cohesion and lower cross-module coupling.
- Reduced fragility as feature count and data volume increase.

### Signals that this phase is worth starting
- New features require frequent persisted shape changes.
- Migration/compatibility logic is growing in ad hoc ways.
- Team velocity declines due to unclear module ownership.

### Signals that it is still too early
- Persisted model is stable and not expected to evolve for multiple release cycles.
- Module count/complexity remains small enough that regrouping adds little near-term value.

---

## Phase D — Optional advanced-stage changes

### Goal
Apply deeper architectural shifts only if measurable complexity/performance thresholds are reached.

### Included changes
- Consider dedicated client-side state engine (reducer/store) if transition complexity materially grows (`DC-1`).
- Evaluate IndexedDB or chunked persistence if localStorage snapshot approach shows real strain (`DC-2`).
- Separate policy engine outputs from presentation copy/localization concerns (`DC-3`).

### Recommended order
1. Define objective trigger metrics (state transition complexity, performance, defect rates).
2. Prototype one change at a time behind compatibility boundaries.
3. Run migration/perf validation and rollback-ready release strategy.

### Prerequisites
- Phase C persistence/versioning discipline complete.
- Instrumentation and benchmark visibility for data size and UX latency.

### Risks
- High implementation cost for limited return if adopted prematurely.
- Increased operational complexity in local-first runtime behavior.
- Migration burden if persistence substrate changes.

### Expected outcome
- Improved scalability ceiling for larger datasets/workflows.
- More explicit policy/state transition governance in advanced product stage.

### Signals that this phase is worth starting
- Measured latency or UX degradation with larger histories.
- Persistent callback/reducer complexity exceeds maintainable thresholds.
- Localization/policy iteration is blocked by coupled logic + copy outputs.

### Signals that it is still too early
- No measured performance pain in real usage.
- Team still improving fundamentals from Phases A–C.
- Product roadmap does not require advanced scale characteristics.

---

## 30-day execution plan

### Week 1
- Establish Phase A scope and owners.
- Implement persistence contract test skeletons and baseline fixtures.
- Define explicit ordering invariant owner and error semantic taxonomy.

### Week 2
- Complete Phase A implementation:
  - sorting ownership cleanup,
  - hydration/import error semantics normalization,
  - architecture guardrails documentation.
- Run targeted regression sweep for persistence and import/export workflows.

### Week 3
- Start Phase B extraction work:
  - isolate `HistoryScreen` derivation modules,
  - create initial use-case interfaces for top 2–3 high-frequency flows.
- Add tests for extracted pure derivations.

### Week 4
- Refactor selected `App.tsx` orchestration paths to use new use-case layer.
- Add first critical integration tests (UI flow to repository persistence path).
- Perform roadmap checkpoint: validate whether to continue deeper into Phase B or stabilize.

### 30-day deliverables
- Phase A complete.
- Phase B started with at least one vertical slice (derivation extraction + use-case integration + tests).
- Updated architecture docs capturing boundary contracts.

---

## 90-day execution plan

### Days 1–30 (Foundation)
- Complete Phase A and initial Phase B vertical slices.
- Track baseline metrics:
  - regression count in persistence/import paths,
  - refactor lead time for hotspot files,
  - test coverage for critical workflows.

### Days 31–60 (Boundary consolidation)
- Continue Phase B rollout across remaining high-value flows.
- Reduce `App.tsx` orchestration surface through use-case layer adoption.
- Expand integration tests for onboarding, check-in lifecycle, import/export/reset.
- Begin Phase C preparation: define persistence schema contract and migration strategy.

### Days 61–90 (Growth hardening)
- Execute Phase C initial tranche:
  - implement explicit schema validation/migration pipeline,
  - incremental domain-oriented module grouping,
  - migration and boundary contract tests.
- Decision gate for Phase D based on measured triggers (not intuition).

### 90-day deliverables
- Phases A and B substantially complete.
- Phase C materially underway with schema/versioning discipline in production path.
- Documented trigger criteria and decision log for any Phase D consideration.

---

## Architecture decisions to capture as ADRs (or equivalent)
1. **Layering contract:** UI components vs. use-case layer vs. repository responsibilities.
2. **State invariant ownership:** canonical owner for ordering/sorting and normalization rules.
3. **Persistence failure semantics:** when to fail fast, when to recover, and what user-facing messaging is required.
4. **Persistence schema/version policy:** versioning cadence, compatibility window, migration guarantees.
5. **Testing strategy boundaries:** required contract tests for persistence and required integration tests for critical workflows.
6. **Module boundary conventions:** criteria for domain-oriented grouping and allowed cross-boundary dependencies.
7. **Trigger policy for advanced shifts:** objective thresholds for introducing reducer/store or IndexedDB.
8. **Policy-output separation approach:** constraints on mixing recommendation logic with presentation/localization copy.

---

## Evidence anchors
- `docs/architecture-review/01-repository-inventory.md`
- `docs/architecture-review/02-current-architecture-map.md`
- `docs/architecture-review/03-critical-diagnosis.md`
- `docs/architecture-review/04-scalability-assessment.md`
- `docs/architecture-review/05-prioritized-recommendations.md`
- `src/App.tsx`
- `src/components/HistoryScreen.tsx`
- `src/components/ProfileScreen.tsx`
- `src/state/storage.ts`
- `src/domain/decision.ts`
- `src/domain/decision.test.ts`
