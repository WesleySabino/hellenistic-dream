# Phase 5 — Prioritized Recommendations

## Inputs used from earlier phases
- `docs/architecture-review/01-repository-inventory.md`
- `docs/architecture-review/02-current-architecture-map.md`
- `docs/architecture-review/03-critical-diagnosis.md`
- `docs/architecture-review/04-scalability-assessment.md`

This phase converts prior findings into a practical, sequenced recommendation plan for a **local-first, no-server** product.

---

## Executive summary
The codebase is in a viable state for current scope, and the right strategy is **targeted structural hardening**, not stack churn. The strongest immediate returns come from: (1) reducing logic concentration in `App.tsx`/`HistoryScreen.tsx`, (2) making data contracts explicit in persistence (schema validation + versioned migrations), and (3) expanding tests around repository and critical UI workflows. A full architectural rewrite is not justified now. A partial TypeScript migration is also not needed because the codebase is already TypeScript-first.

---

## Prioritized recommendations

## 1) Quick wins (do now)

### QW-1 — Add persistence contract tests around import/export/normalization
- **Problem it solves:** High-regression area (`storage.ts`) has complex behavior with limited safety net.
- **Concrete evidence in repository:**
  - Persistence logic + normalization + compatibility alias + export are concentrated in `src/state/storage.ts`.
  - Existing automated coverage is primarily in `src/domain/decision.test.ts`; no equivalent repository contract suite is present.
- **Expected impact:** Faster, safer changes in persistence and import flows; lower risk of silent data corruption or compatibility regressions.
- **Implementation effort:** Low to medium.
- **Implementation risk:** Low.
- **Urgency:** High.
- **Dependencies:** None.
- **Recommended timing:** **Now**.

### QW-2 — Remove duplicate sorting ownership and codify invariant ownership
- **Problem it solves:** Date ordering invariants are enforced in multiple places, inviting drift and subtle bugs.
- **Concrete evidence in repository:**
  - Sorting/ordering behavior appears in both `src/state/storage.ts` and `src/App.tsx` (`sortedState` derivation).
- **Expected impact:** Clearer contracts, fewer data-shape surprises, simpler debugging.
- **Implementation effort:** Low.
- **Implementation risk:** Low.
- **Urgency:** High.
- **Dependencies:** QW-1 recommended first (to protect refactor with tests).
- **Recommended timing:** **Now**.

### QW-3 — Extract non-UI derivations from `HistoryScreen.tsx` into reusable pure modules
- **Problem it solves:** Current feature density in one screen increases fragility and slows feature changes.
- **Concrete evidence in repository:**
  - `src/components/HistoryScreen.tsx` contains chart transformations, recommendation timeline derivation, and editing workflows in one module.
- **Expected impact:** Smaller UI surface area, better testability of timeline/chart logic, easier future enhancements.
- **Implementation effort:** Medium.
- **Implementation risk:** Medium (UI behavior parity must be preserved).
- **Urgency:** High.
- **Dependencies:** QW-1 useful for protecting behavior if derived data depends on normalized state invariants.
- **Recommended timing:** **Now**.

### QW-4 — Standardize error semantics for storage hydration/import failures
- **Problem it solves:** Inconsistent error handling and silent fallback can hide data-loss scenarios.
- **Concrete evidence in repository:**
  - `src/state/storage.ts` falls back to empty state on parse/read failures.
  - Import error handling is user-facing in `src/components/ProfileScreen.tsx`, but error semantics are not uniform across all persistence paths.
- **Expected impact:** Better user trust and diagnosability; reduced “mysterious reset” risk.
- **Implementation effort:** Low to medium.
- **Implementation risk:** Low.
- **Urgency:** Medium-high.
- **Dependencies:** None.
- **Recommended timing:** **Now**.

### QW-5 — Add minimal architecture guardrails in docs
- **Problem it solves:** Architectural intent currently lives mostly as implicit convention.
- **Concrete evidence in repository:**
  - Business logic appears in both `src/domain/decision.ts` and screen components.
  - Hotspots (`App.tsx`, `HistoryScreen.tsx`, `storage.ts`) attract cross-cutting changes.
- **Expected impact:** Better contributor consistency and lower pattern drift.
- **Implementation effort:** Low.
- **Implementation risk:** Low.
- **Urgency:** Medium.
- **Dependencies:** None.
- **Recommended timing:** **Now**.

---

## 2) Medium-term structural improvements (plan next)

### MT-1 — Introduce an application/use-case layer between UI and repository
- **Problem it solves:** `App.tsx` currently combines orchestration, mutation dispatch, and side-effect wiring.
- **Concrete evidence in repository:**
  - `src/App.tsx` manages tabs, onboarding gate, mutation callbacks, import/export/reset orchestration.
- **Expected impact:** Reduced central coupling; improved change isolation; easier integration testing.
- **Implementation effort:** Medium.
- **Implementation risk:** Medium.
- **Urgency:** Medium-high.
- **Dependencies:** QW-1 and QW-2 (to stabilize contracts first).
- **Recommended timing:** **Later** (after quick-win hardening).

### MT-2 — Move toward domain-oriented module boundaries (incremental, not big-bang)
- **Problem it solves:** Flat components + mixed concerns will scale poorly as features grow.
- **Concrete evidence in repository:**
  - Screen logic is mostly under `src/components/*` with limited internal module decomposition.
  - Domain/persistence are each concentrated in single files.
- **Expected impact:** Better cohesion by feature/domain, reduced cross-feature coupling, clearer ownership.
- **Implementation effort:** Medium.
- **Implementation risk:** Medium.
- **Urgency:** Medium.
- **Dependencies:** MT-1 recommended to avoid moving files without boundary semantics.
- **Recommended timing:** **Later**.

### MT-3 — Strengthen persistence model with explicit schema validation + versioned migrations
- **Problem it solves:** Import and hydration robustness may degrade as model evolves.
- **Concrete evidence in repository:**
  - Existing versioned key (`hellenistic-dream/state/v3`) and compatibility normalization (`weeklyCheckIns` alias) show real migration pressure already exists.
  - Validation in persistence is structural but not fully schema-rigorous.
- **Expected impact:** Safer evolution, clearer backward compatibility, lower data-loss risk.
- **Implementation effort:** Medium.
- **Implementation risk:** Medium.
- **Urgency:** Medium-high.
- **Dependencies:** QW-1 strongly recommended first.
- **Recommended timing:** **Later** (soon after quick wins).

### MT-4 — Expand testing pyramid: repository contracts + critical UI integration tests
- **Problem it solves:** Current tests are narrow relative to architecture hotspots.
- **Concrete evidence in repository:**
  - `src/domain/decision.test.ts` exists; comparable automated safety nets for `App` orchestration and `HistoryScreen` workflows are not evident.
- **Expected impact:** Safer refactors, lower regression rate, faster review confidence.
- **Implementation effort:** Medium.
- **Implementation risk:** Low to medium.
- **Urgency:** Medium-high.
- **Dependencies:** None (can start immediately), but value increases after QW-3/MT-1.
- **Recommended timing:** **Later** (start in parallel where practical).

---

## 3) Deeper changes (only if product grows substantially)

### DC-1 — Introduce a dedicated client-side state engine (reducer/store) only when transition complexity materially increases
- **Problem it solves:** Callback orchestration through `App.tsx` can become unmanageable with richer multi-entity workflows.
- **Concrete evidence in repository:**
  - Current global state flow is root `useState` + callback props; no reducer/store abstraction.
- **Expected impact:** Clear transition semantics, better traceability, less callback sprawl.
- **Implementation effort:** Medium to high.
- **Implementation risk:** Medium to high.
- **Urgency:** Low at current scale.
- **Dependencies:** MT-1 strongly recommended first.
- **Recommended timing:** **Conditional**.

### DC-2 — Evaluate IndexedDB (or chunked persistence) only when localStorage snapshot approach shows measurable UX/perf strain
- **Problem it solves:** Full snapshot read/modify/write can degrade with large histories.
- **Concrete evidence in repository:**
  - Persistence currently serializes/deserializes entire state per mutation in `src/state/storage.ts`.
- **Expected impact:** Better scalability for larger local datasets and richer history analytics.
- **Implementation effort:** High.
- **Implementation risk:** Medium-high (migration complexity, browser behavior nuances).
- **Urgency:** Low unless metrics indicate issues.
- **Dependencies:** MT-3 (schema/version discipline) should precede.
- **Recommended timing:** **Conditional**.

### DC-3 — Separate policy engine outputs from presentation copy/localization concerns
- **Problem it solves:** Mixed rule semantics + user-facing explanation text can entangle policy evolution with copy iteration.
- **Concrete evidence in repository:**
  - `src/domain/decision.ts` produces recommendation logic and explanatory text payloads.
- **Expected impact:** Easier policy extension, cleaner localization strategy, safer copy updates.
- **Implementation effort:** Medium.
- **Implementation risk:** Medium.
- **Urgency:** Low to medium.
- **Dependencies:** MT-2 helps clarify module boundaries first.
- **Recommended timing:** **Conditional**.

---

## Explicit answers to requested decisions

### What should be done now?
1. Add repository/persistence contract tests (QW-1).
2. Eliminate duplicate ordering ownership (QW-2).
3. Extract derivation logic from `HistoryScreen.tsx` to pure modules (QW-3).
4. Standardize storage/import error semantics (QW-4).
5. Add lightweight architecture guardrails documentation (QW-5).

### What should be delayed?
1. Introducing a full use-case layer can follow after contract hardening (MT-1).
2. Domain-oriented folder reorganization should be incremental and sequenced after boundary definition (MT-2).
3. Rigorous schema + migration framework should follow quick-win tests and invariant cleanup (MT-3).

### What would be overengineering at this stage?
1. Full state-management framework migration immediately (DC-1, now) without clear complexity trigger.
2. Immediate persistence engine rewrite away from localStorage (DC-2, now) without measured performance pain.
3. Large-scale architectural rewrite/big-bang modularization before stabilizing existing seams.

---

## Direct evaluation of requested topics

### 1) Is React + JavaScript still an acceptable foundation?
- **Answer:** React is acceptable; JavaScript-only would be a regression here because this repository is already TypeScript-based.
- **Why:** The current stack (`React` + `TypeScript` + `Vite`) is lightweight, productive, and aligned with local-first browser execution. There is no evidence that framework replacement would address the observed bottlenecks (which are mostly boundary and responsibility issues, not framework limits).

### 2) Is a partial or full TypeScript migration justified?
- **Answer:** No migration is needed; the project has effectively already completed this move.
- **Why:** Core modules and components are `.ts`/`.tsx` with strict typing in place. The practical recommendation is to **tighten type contracts and aliases**, not migrate languages.

### 3) Should business logic be extracted out of components?
- **Answer:** **Yes, selectively and now** for non-UI derivations in heavy components.
- **Why:** Logic in `HistoryScreen.tsx` and similar screens includes domain-adjacent calculations that should be pure/testable modules. Keep UI concerns in components and move policy/derivation logic out.

### 4) Should the codebase move toward domain-oriented module boundaries?
- **Answer:** **Yes, incrementally (medium-term)**.
- **Why:** Current structure is understandable, but growth will stress flat component organization and hotspot files. Move by feature/domain slices with minimal churn rather than a big-bang restructure.

### 5) Should the state strategy change?
- **Answer:** **Not immediately.** Keep current root-state approach now, but introduce a use-case boundary first; consider reducer/store only when complexity triggers appear.
- **Why:** Current complexity does not yet justify framework-level state migration. Main problem is orchestration coupling, which can be addressed without adopting a new global state library right away.

### 6) Does persistence need schemas, validation, versioning, or migrations?
- **Answer:** **Yes**—schema discipline and migration/versioning should be strengthened.
- **Why:** The repository already shows signs of schema evolution (`v3` key, alias normalization). Formalizing schema/version migration is a proportional response that improves reliability while respecting local-first constraints.

---

## Suggested rollout sequence
1. **Sprint 1:** QW-1, QW-2, QW-4.
2. **Sprint 2:** QW-3 + start MT-4.
3. **Sprint 3+:** MT-1, MT-2, MT-3 in controlled increments.
4. **Only on trigger:** DC-1/DC-2/DC-3 based on measured growth/complexity thresholds.

---

## Evidence anchors
- `docs/architecture-review/01-repository-inventory.md`
- `docs/architecture-review/02-current-architecture-map.md`
- `docs/architecture-review/03-critical-diagnosis.md`
- `docs/architecture-review/04-scalability-assessment.md`
- `src/App.tsx`
- `src/components/HistoryScreen.tsx`
- `src/components/ProfileScreen.tsx`
- `src/state/storage.ts`
- `src/domain/decision.ts`
- `src/domain/decision.test.ts`
