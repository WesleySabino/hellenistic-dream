# Phase 3 — Critical Diagnosis

## Inputs used from earlier phases
- `docs/architecture-review/01-repository-inventory.md`
- `docs/architecture-review/02-current-architecture-map.md`

This phase uses the architecture reconstruction from phases 1 and 2 and deepens it with a critical diagnosis grounded in current code.

---

## Diagnostic framing
To keep findings explicit and non-generic, each area is structured as:
1. **Observed today (fact)**
2. **What is working well (fact + positive impact)**
3. **Real problems already visible (fact-based issues already in code)**
4. **Medium-term risks (likely consequence if unchanged)**
5. **Concrete evidence anchors**

---

## 1) UI / component architecture

### Observed today
- Screen-level components are organized by feature (`OnboardingScreen`, `Dashboard`, `DecisionScreen`, `CheckInScreen`, `HistoryScreen`, `ProfileScreen`).
- Top-level rendering and navigation switch are centralized in `App.tsx` using tab state and conditional rendering.
- Heavier screens (especially `HistoryScreen`) include both presentation and non-trivial data transformation logic.

### What is working well
- Feature boundaries are easy to identify by filename and component name.
- The UI stays dependency-light (React only), with straightforward prop contracts.
- The application is understandable as a single in-browser app with no route orchestration complexity.

### Real problems already visible
- `App.tsx` is a control hub for navigation, orchestration, persistence callbacks, onboarding gate, and import/export side effects (high concentration).
- `HistoryScreen.tsx` mixes chart geometry, timeline derivation, editing state machines, and CRUD interactions in one component.
- UI logic duplication risk is visible (similar form/validation patterns in onboarding, check-in, profile).

### Medium-term risks
- Adding new screens or modes will increase cognitive load and merge conflicts in `App.tsx`.
- Feature evolution in `HistoryScreen` is likely to become brittle because visual and domain-adjacent concerns are co-located.
- Harder extraction of reusable UI primitives later because current design is mostly screen-monolith components.

### Evidence anchors
- `src/App.tsx`
- `src/components/HistoryScreen.tsx`
- `src/components/OnboardingScreen.tsx`
- `src/components/CheckInScreen.tsx`
- `src/components/ProfileScreen.tsx`

---

## 2) State management

### Observed today
- Global application state is held in a single `useState` in `App.tsx`.
- Mutations occur via repository commands that read/write localStorage and return the next full snapshot.
- Derived sorted state is recomputed in `App.tsx` even though repository upserts already sort arrays.

### What is working well
- Single authoritative state object keeps data model simple.
- Mutation entry points are explicit callback functions, which makes event flow traceable.
- No hidden global state frameworks; behavior is mostly predictable.

### Real problems already visible
- Persistence-first mutation pattern couples UI updates to storage round-trips for every write.
- Sorting invariant is duplicated (`storage.ts` and `App.tsx`), signaling unclear ownership of state normalization.
- No reducer/use-case layer to centralize state transitions and guard invariants.

### Medium-term risks
- State transition logic will spread as features grow (more callbacks and cross-cutting conditions).
- Invariant drift risk: future contributors may assume sorting/normalization in one place and break behavior in another.
- Harder time-travel/debug tooling adoption because transitions are not structured as typed events/actions.

### Evidence anchors
- `src/App.tsx`
- `src/state/storage.ts`

---

## 3) Business/domain logic distribution

### Observed today
- Core recommendation logic is centralized in `src/domain/decision.ts` as pure functions.
- Domain types are shared in `src/domain/types.ts`.
- Additional feature logic (recommendation timeline, rolling windows, chart points) exists inside UI components.

### What is working well
- The core recommendation engine is testable and currently covered by unit tests.
- Rule precedence and explanation generation are explicit and readable.
- Domain module remains independent from React and storage APIs.

### Real problems already visible
- Business-adjacent logic is split between domain module and components (`HistoryScreen`, `CheckInScreen`), reducing cohesion.
- Some domain output includes presentation text; changes to copy and rule semantics are coupled in one function.
- Transitional aliases in `types.ts` (`AppState`, `WeeklyCheckIn`, etc.) indicate model naming debt still present.

### Medium-term risks
- Rule evolution can create inconsistent behavior if some calculations stay in components while others move in domain.
- More recommendation dimensions (new biomarkers/rules) may force significant refactors due to mixed responsibilities.
- Copy/locale updates may inadvertently alter behavior areas if not separated from logic.

### Evidence anchors
- `src/domain/decision.ts`
- `src/domain/decision.test.ts`
- `src/domain/types.ts`
- `src/components/HistoryScreen.tsx`
- `src/components/CheckInScreen.tsx`

---

## 4) Persistence design

### Observed today
- Persistence is localStorage-only via `LocalStateStorage` and `localStateRepository`.
- Data is stored as one JSON snapshot under `hellenistic-dream/state/v3`.
- Import/export/reset and backward-compat normalization are in one module.

### What is working well
- Local-first/no-server constraint is implemented consistently.
- Repository API gives a practical abstraction versus direct localStorage use in components.
- Backup portability (JSON/CSV export) and import validation exist today.

### Real problems already visible
- Validation for import is shallow (type presence checks, but no strict schema, date format, range constraints parity with UI, or deduplication rules).
- Corrupt persisted data silently falls back to empty state, which can hide data-loss events from users.
- Read-modify-write per operation over full state snapshot may become increasingly costly as history grows.

### Medium-term risks
- Silent fallback behavior can create trust issues if users lose data without actionable error messages.
- Import compatibility complexity will rise as model versions evolve (single file currently mixes normalization, validation, and persistence).
- Full snapshot rewrite on each update may become a latency or UX concern on very large local histories.

### Evidence anchors
- `src/state/storage.ts`
- `src/App.tsx`
- `src/components/ProfileScreen.tsx`

---

## 5) Folder/module organization

### Observed today
- Clear top-level partition by purpose: `components`, `domain`, `state`.
- Component folder is flat (all screen components co-located).
- Domain and persistence each currently live in a single main file.

### What is working well
- For current size, location predictability is high.
- New contributors can find “where things are” quickly.

### Real problems already visible
- Flat component folder will not scale cleanly if each feature accumulates subcomponents/hooks/helpers.
- Large single files (`HistoryScreen.tsx`, `storage.ts`, `decision.ts`) are becoming de facto subsystems without internal modularization.
- No explicit module boundaries for shared utilities (date handling, validation helpers, selectors).

### Medium-term risks
- Increasing incidental coupling and cross-file copy/paste helpers.
- Harder ownership and review granularity as files continue growing.

### Evidence anchors
- `src/components/*`
- `src/state/storage.ts`
- `src/domain/decision.ts`

---

## 6) Internal contracts between parts of the system

### Observed today
- Contracts are TypeScript interfaces and prop signatures.
- App-to-screen contracts are callback-based.
- Domain layer contract is function-based and state-structure dependent.

### What is working well
- Types provide a baseline of compile-time safety.
- Contract surfaces are explicit at call sites.

### Real problems already visible
- Contracts rely on implicit invariants (ISO date string format, sorted arrays, expected non-null profile in certain screens).
- Compatibility aliases and naming duplication (`DailyWeight` vs `DailyWeightEntry`) increase semantic ambiguity.
- No explicit contract tests for repository behavior (idempotency, ordering, import edge cases).

### Medium-term risks
- Implicit contract breaks are likely when adding new data fields or changing date semantics.
- Multi-screen behavior drift can occur if callbacks evolve inconsistently.

### Evidence anchors
- `src/domain/types.ts`
- `src/App.tsx`
- `src/state/storage.ts`
- `src/components/CheckInScreen.tsx`

---

## 7) Error handling

### Observed today
- Import flow can throw and is handled in `ProfileScreen` with user feedback.
- Storage read parse failure falls back to empty state without user-visible signal.
- Most mutation paths are synchronous and assume success.

### What is working well
- User-facing feedback exists for import success/failure.
- Error paths are simple and localized for the current feature set.

### Real problems already visible
- No global error boundary strategy for unexpected render/runtime errors.
- Inconsistent error handling style (some flows catch and message, others silently recover).
- `JSON.parse` in `App.importBackup` can throw before repository validation, with only component-level catch in caller chain.

### Medium-term risks
- Harder debugging and support for real user issues due to silent recoveries and non-uniform messages.
- New async features will likely introduce unhandled promise errors unless conventions are established.

### Evidence anchors
- `src/state/storage.ts`
- `src/App.tsx`
- `src/components/ProfileScreen.tsx`

---

## 8) Testability

### Observed today
- Test coverage exists for domain decision logic only (`decision.test.ts`).
- No repository tests, no component tests, no integration tests for critical flows.

### What is working well
- Pure domain functions are test-friendly and already validated.
- Vitest is configured and active, giving a base to expand coverage.

### Real problems already visible
- High-risk flows (import/normalize/validation, history edits, onboarding completion wiring) are untested.
- Architectural hotspots with highest complexity (`HistoryScreen`, `storage.ts`, `App.tsx`) have limited automated regression protection.

### Medium-term risks
- Feature additions will increase manual QA burden and regression probability.
- Refactoring toward better architecture will be riskier without broader test safety nets.

### Evidence anchors
- `src/domain/decision.test.ts`
- `src/state/storage.ts`
- `src/components/HistoryScreen.tsx`
- `src/App.tsx`
- `package.json`

---

## 9) Performance risks

### Observed today
- Operations are synchronous and local.
- Charts and timeline are recomputed from arrays in render paths.
- Every mutation performs storage read/write and full object serialization.

### What is working well
- Current dataset size is likely small enough for acceptable performance.
- No heavyweight runtime dependencies.

### Real problems already visible
- Repeated sorting/copying and full snapshot writes are O(n log n)/O(n) operations on each update.
- Chart and timeline derivations in `HistoryScreen` can become expensive as history length grows.
- No virtualization/pagination for long record lists.

### Medium-term risks
- Perceived UI sluggishness on older devices or long-term users with large data histories.
- Rendering cost spikes when multiple derived collections are recalculated in one screen.

### Evidence anchors
- `src/state/storage.ts`
- `src/App.tsx`
- `src/components/HistoryScreen.tsx`

---

## 10) Build / tooling maturity

### Observed today
- Tooling stack is minimal and modern: Vite + TypeScript + Vitest.
- Scripts include dev/build/preview/test only.
- No lint/format/typecheck-only script or CI configuration visible in repo root.

### What is working well
- Fast local dev workflow and low setup friction.
- Strict TypeScript mode helps prevent many classes of defects.

### Real problems already visible
- Lack of lint/format automation increases style drift and low-level defect leakage.
- Testing command exists but scope is narrow; no explicit quality gates are encoded in scripts.
- No static architecture guardrails (import rules, layering checks).

### Medium-term risks
- Quality variability increases with contributor count.
- Architectural erosion accelerates without automated feedback loops beyond compilation.

### Evidence anchors
- `package.json`
- `tsconfig.json`
- `vite.config.ts`

---

## 11) Onboarding difficulty for a new developer

### Observed today
- Repository is small and easy to run.
- Architecture docs exist (including this phased review).
- Runtime behavior depends on implicit conventions (date strings, sorting, where validation happens).

### What is working well
- New developer can become productive quickly for small UI changes.
- Clear naming of feature screens reduces initial discovery time.

### Real problems already visible
- Key architectural decisions are implicit in code, not encoded as enforced boundaries.
- “Where should logic live?” is not systematically answered by project structure.
- High-centrality files require substantial context before safe edits.

### Medium-term risks
- Onboarding may appear easy initially but become error-prone for non-trivial tasks.
- Contributors can unintentionally reinforce existing coupling patterns.

### Evidence anchors
- `docs/architecture-review/01-repository-inventory.md`
- `docs/architecture-review/02-current-architecture-map.md`
- `src/App.tsx`
- `src/components/HistoryScreen.tsx`

---

## 12) Ease of evolving the system with more features

### Observed today
- Current architecture supports incremental feature additions in a pragmatic way.
- Cross-cutting changes typically require touching `App.tsx`, one or more screens, and potentially `storage.ts` and `decision.ts`.

### What is working well
- Minimal dependency surface keeps change mechanics straightforward.
- Core recommendation logic is already extractable and test-backed.

### Real problems already visible
- Evolution friction hotspots already exist in overloaded files/modules.
- No dedicated extension seams for use-cases, selectors, or validation policies.
- Feature additions likely require manual coordination across several layers with implicit assumptions.

### Medium-term risks
- Delivery speed may decline as each new feature has higher integration risk.
- Incremental changes may preserve functionality while degrading architecture quality (slow “architectural debt compounding”).

### Evidence anchors
- `src/App.tsx`
- `src/state/storage.ts`
- `src/domain/decision.ts`
- `src/components/HistoryScreen.tsx`

---

## Top 10 most important current problems

1. **`App.tsx` orchestration overload** (navigation + mutation routing + import/export + onboarding gate).
2. **`HistoryScreen.tsx` responsibility overload** (rendering + chart math + timeline business logic + edit/delete workflows).
3. **Split ownership of invariants** (sorting/normalization across repository and app).
4. **Business logic fragmentation** between domain module and component-level derivations.
5. **Persistence module concentration** (storage adapter + repository + import/export + compatibility + validation in one file).
6. **Shallow import validation** relative to UI rules and long-term schema robustness.
7. **Silent recovery on storage corruption** (empty-state fallback without explicit user signal).
8. **Limited automated tests beyond core domain rules**.
9. **Implicit internal contracts** (date format/order assumptions not explicitly guarded).
10. **Lack of lint/architecture guardrails** to prevent consistency and layering drift.

---

## Top 10 evolution risks

1. **Feature growth amplifies central-file coupling** (`App.tsx`, `HistoryScreen.tsx`, `storage.ts`).
2. **Regression risk increases faster than tests** as new flows are added.
3. **Domain inconsistency risk** as business rules keep spreading across UI components.
4. **Data model evolution risk** due to mixed compatibility, aliases, and weak schema enforcement.
5. **User trust risk from silent data-loss scenarios** on corrupted storage states.
6. **Performance degradation risk** from full-state read/write and repeated in-render derivations on larger histories.
7. **Onboarding drift risk** for new developers lacking explicit architecture conventions.
8. **Higher change lead time** for cross-cutting features needing updates in multiple implicit boundaries.
9. **Greater merge conflict frequency** in high-centrality files.
10. **Architecture entropy risk** without tooling-enforced boundaries and standards.

---

## Top 5 strengths worth preserving

1. **Local-first, no-server execution model is cleanly honored** and aligned with product constraints.
2. **Core recommendation logic is pure and tested**, providing a stable decision nucleus.
3. **TypeScript strict typing on domain structures** provides solid baseline safety.
4. **Dependency-light stack** keeps runtime and build complexity low.
5. **Pragmatic repository abstraction over localStorage** is a useful seam already in place.

---

## Executive summary
The codebase is functionally healthy but architecturally “good enough for now, risky for growth.” Its strongest asset is a clear local-first model with a tested pure decision core. Its main liabilities are concentration of responsibility in a few files, split ownership of invariants and business logic, and limited automated coverage around the highest-change paths. If the product remains small, the current architecture can continue to deliver. If feature scope expands, current coupling patterns will likely reduce change velocity and increase regression risk unless module responsibilities and internal contracts are made more explicit.

## Evidence anchors (code + prior artifacts)
- `docs/architecture-review/01-repository-inventory.md`
- `docs/architecture-review/02-current-architecture-map.md`
- `src/App.tsx`
- `src/state/storage.ts`
- `src/domain/types.ts`
- `src/domain/decision.ts`
- `src/domain/decision.test.ts`
- `src/components/OnboardingScreen.tsx`
- `src/components/CheckInScreen.tsx`
- `src/components/HistoryScreen.tsx`
- `src/components/ProfileScreen.tsx`
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
