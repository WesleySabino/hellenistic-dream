# Phase 4 — Scalability Assessment

## Inputs used from earlier phases
- `docs/architecture-review/01-repository-inventory.md`
- `docs/architecture-review/02-current-architecture-map.md`
- `docs/architecture-review/03-critical-diagnosis.md`

This assessment focuses on **scalability of codebase evolution** (feature growth, rule growth, maintainability, and team scaling), with runtime/data concerns treated as one dimension—not the only one.

---

## Executive summary
The current architecture can likely absorb a **limited next wave** of features, but its present coupling pattern (`App.tsx` orchestration hub, `HistoryScreen.tsx` logic concentration, `storage.ts` mixed responsibilities) will become the primary brake on delivery speed and correctness as scope expands. The strongest growth enablers already in place are: a strict TypeScript model, a pure/tested core decision engine, and a local-first repository seam. The main compounding debt is fragmented business logic and implicit invariants (ordering/date/validation ownership). Net: architecture is workable now, but without targeted structural hardening, the risk profile moves from “manageable” to “fragile” once multiple concurrent feature streams and richer policy logic are introduced.

---

## Scalability analysis by dimension

## 1) Functional scalability
(Ability to add more features, rules, user flows, and stateful behavior.)

### Observed baseline
- Feature delivery today is screen-centric and works through a single orchestration path in `App.tsx`.
- Domain rules are partly centralized (`domain/decision.ts`) and partly embedded in UI feature modules.
- Persistence and import/export concerns are centralized in `storage.ts`.

### Assessment
- **Near-term feature expansion (2x)** is feasible with moderate friction.
- **Mid-term expansion (3x+)** becomes increasingly expensive because each substantial feature likely touches multiple high-centrality files and implicit contracts.
- **Business-rule expansion** is possible, but only if rule logic remains disciplined inside domain modules; otherwise behavior drift across screens is likely.
- **Higher state complexity** is the weak point: additional entities, cross-entity invariants, and derived states will strain the current callback + prop-drilling + persistence-first mutation flow.

### Why this matters for functional scaling
The architecture has enough seams to evolve, but not enough boundary enforcement to keep complexity from diffusing into UI modules.

---

## 2) Maintainability scalability
(Ability to keep code understandable, testable, and change-safe as size grows.)

### Observed baseline
- Clear top-level folders (`components`, `domain`, `state`) and strict typing are positive.
- Test coverage is concentrated mainly in core decision logic.
- Hotspot files carry mixed concerns and increasing cognitive load.

### Assessment
- Maintainability scales **linearly at first, then nonlinearly worse** once hotspot modules accumulate more branches and one-off paths.
- The absence of stronger conventions/guardrails (layer rules, broader tests for repository + integration flows) increases regression probability under growth.
- Refactoring cost will rise because behavior-critical logic is not fully isolated behind stable interfaces.

### Why this matters for maintainability scaling
Future speed is constrained less by runtime cost and more by human comprehension and safe-change radius.

---

## 3) Technical scalability
(Ability to handle more data volume, complexity in derivations, and technical robustness.)

### Observed baseline
- localStorage full-snapshot read/modify/write per mutation.
- In-screen derivations for charts/timelines over full arrays.
- Duplicate normalization assumptions (sorting/order expectations across layers).

### Assessment
- For current likely usage, performance is acceptable.
- With larger local history, repeated serialization + sorting + render-time derivation can create perceptible UI lag.
- Import/validation robustness may degrade under schema evolution pressure unless versioning/validation concerns are modularized further.

### Why this matters for technical scaling
The technical bottleneck is not immediate throughput; it is the combination of data growth + synchronous full-state operations + duplicated invariants.

---

## 4) Organizational scalability
(Ability for multiple maintainers to work concurrently and safely.)

### Observed baseline
- Codebase is small and approachable for single-contributor iteration.
- Change coordination currently funnels through a few central files.
- Conventions exist implicitly rather than as enforced architecture contracts.

### Assessment
- Multiple maintainers can contribute now, but conflict frequency will increase in `App.tsx`, `HistoryScreen.tsx`, and `storage.ts`.
- Review burden rises because critical behaviors are spread across UI, domain, and persistence layers without a dedicated use-case layer.
- Onboarding remains “easy for simple changes, risky for deep changes.”

### Why this matters for organizational scaling
Team scaling failure usually appears as merge conflict churn, inconsistent patterns, and longer review cycles—exactly where this architecture is currently most concentrated.

---

## Explicit answers to required questions

### 1. Can this architecture support 2x–3x more features?
- **2x: Yes, with moderate friction.**
- **3x: Only partially without structural adjustments.**
Reason: hotspots and implicit contracts will turn incremental feature work into frequent cross-module edits and regression risk.

### 2. Can it support significantly more business rules?
- **Conditionally yes.**
If rule growth is centralized in domain modules and kept pure/tested, it can scale. If rule logic continues to leak into components, consistency and testability degrade quickly.

### 3. Can it support higher state complexity?
- **Limited in current form.**
Single-root state + callback orchestration works for current model, but richer entity relationships and invariants will be hard to manage without clearer transition boundaries/selectors.

### 4. Can it support larger local data volume?
- **To a point, yes; then UX/perf degradation risk increases.**
Full-state localStorage rewrites and repeated derived computations will likely become noticeable first in history-heavy usage.

### 5. Can it support multiple maintainers?
- **Yes at small team scale, with rising coordination cost.**
Current structure is understandable, but central file contention and implicit conventions will reduce parallelism.

### 6. What parts will become bottlenecks first?
1. `src/App.tsx` (orchestration convergence point)
2. `src/components/HistoryScreen.tsx` (feature + derivation density)
3. `src/state/storage.ts` (persistence + import/export + compatibility concentration)
4. Cross-layer invariants around date ordering/validation
5. Limited test coverage outside domain rules

### 7. What parts are acceptable now but likely to fail under growth?
- Prop-based mutation wiring through `App` for all features.
- Component-local business derivations mixed with rendering.
- Full-snapshot persistence on each mutation.
- Informal contract assumptions (sorted arrays, date formats, alias compatibility).
- Narrow automated regression net for high-change flows.

### 8. At what point does restructuring stop being optional?
Restructuring stops being optional when **any two** of these are simultaneously true:
- Feature work regularly requires coordinated edits across `App.tsx` + 2+ screens + `storage.ts`.
- Regression fixes consume a meaningful share of delivery cycles.
- Multiple maintainers frequently collide on hotspot files.
- Rule expansion requires duplicate implementations in UI and domain.
- Local history size makes common screens perceptibly sluggish.

### 9. Which current decisions help future growth?
- Local-first repository abstraction instead of raw localStorage calls in every component.
- Pure, tested core decision module (`domain/decision.ts` + tests).
- Strict TypeScript domain model shared across modules.
- Small dependency surface (lower framework-induced complexity).
- Existing compatibility handling awareness in persistence normalization.

### 10. Which current decisions create architectural debt that will compound?
- Over-centralized orchestration in `App.tsx`.
- Responsibility concentration in `HistoryScreen.tsx` and `storage.ts`.
- Split business logic ownership between domain and UI.
- Duplicate invariant enforcement (sorting/normalization in multiple places).
- Incomplete test coverage on high-risk integration paths.

---

## Evolution-risk verdict
**Medium-to-high evolution risk (overall: HIGH if growth is aggressive; MEDIUM if scope remains modest).**

Rationale:
- Present architecture is stable for current scale.
- But risk compounds with scope because growth pressure is concentrated in already-coupled modules and implicit contracts.

---

## 5 most likely future bottlenecks
1. **`App.tsx` as change-convergence bottleneck** (integration conflicts, branching complexity)
2. **`HistoryScreen.tsx` as feature-entropy bottleneck** (mixed UI + logic + workflow concerns)
3. **`storage.ts` as persistence-evolution bottleneck** (schema/import/export/versioning all co-located)
4. **State invariant drift** (sorting/date/validation assumptions split across layers)
5. **Testing deficit outside core decision logic** (slower refactors, higher regression rate)

---

## Evidence anchors
- `docs/architecture-review/01-repository-inventory.md`
- `docs/architecture-review/02-current-architecture-map.md`
- `docs/architecture-review/03-critical-diagnosis.md`
- `src/App.tsx`
- `src/components/HistoryScreen.tsx`
- `src/state/storage.ts`
- `src/domain/decision.ts`
- `src/domain/decision.test.ts`
