# Phase 6 — Refactor Sequence

## Inputs used
- `docs/architecture-review/05-prioritized-recommendations.md`
- `docs/architecture-review/04-scalability-assessment.md`
- `docs/architecture-review/03-critical-diagnosis.md`

## 1) Refactor goal
Refactor the current architecture to reduce change risk in the most fragile areas (`storage.ts`, `App.tsx`, `HistoryScreen.tsx`) while keeping the implementation proportional to a **small, local-first app**. The objective is not a platform redesign; it is to make day-to-day feature and bugfix work safer, faster, and easier to reason about.

---

## 2) Recommended execution order

### Step 1 — Add persistence contract tests (high-leverage, low-risk)
- **Why it comes now:** This creates a safety net before touching persistence logic and invariants.
- **What it changes:** Adds tests around hydration, import/export, normalization, compatibility aliases, and failure cases.
- **Expected benefit:** Prevents silent regressions in the highest-risk data path; enables confident refactors in later steps.
- **Implementation risk:** Low.
- **Dependencies on previous steps:** None.
- **Can be done independently?** Yes.

### Step 2 — Consolidate ordering/sorting ownership (high-leverage, low-risk)
- **Why it comes now:** Duplicate invariant ownership should be removed early, but only after tests exist.
- **What it changes:** Chooses one source of truth for chronology/order invariants (repository or UI derivation), removes duplicate sorting paths.
- **Expected benefit:** Less drift between persistence and UI behavior; simpler debugging and fewer edge-case bugs.
- **Implementation risk:** Low.
- **Dependencies on previous steps:** Step 1.
- **Can be done independently?** Mostly, but should follow Step 1.

### Step 3 — Standardize storage/import error semantics (high-leverage, low-risk)
- **Why it comes here:** After test coverage and invariant cleanup, error behavior can be aligned without compounding unknowns.
- **What it changes:** Defines consistent error categories and user-facing handling for hydration/import failures; removes ambiguous fallback behavior.
- **Expected benefit:** Better diagnosability and user trust; lower chance of hidden data-loss-like outcomes.
- **Implementation risk:** Low to medium.
- **Dependencies on previous steps:** Step 1 recommended; Step 2 optional.
- **Can be done independently?** Yes, if Step 1 is complete.

### Step 4 — Extract non-UI derivation logic from `HistoryScreen.tsx`
- **Why it comes here:** Once persistence contracts and invariants are stable, UI logic extraction has lower risk.
- **What it changes:** Moves chart/timeline/recommendation derivations into pure modules with focused unit tests; keeps components presentation-focused.
- **Expected benefit:** Smaller, clearer screen component; easier reuse and maintenance; improved testability.
- **Implementation risk:** Medium (behavior parity risk).
- **Dependencies on previous steps:** Step 1 strongly recommended; Step 2 helpful.
- **Can be done independently?** Partially; safest after Steps 1–2.

### Step 5 — Add targeted integration tests for critical workflows
- **Why it comes now:** After extraction, test critical paths across module boundaries rather than only pure functions.
- **What it changes:** Adds integration tests for key user flows (import, history editing, timeline rendering expectations, reset/export).
- **Expected benefit:** Catches regressions from orchestration boundaries; supports safe incremental cleanup.
- **Implementation risk:** Low to medium.
- **Dependencies on previous steps:** None strict, but highest ROI after Step 4.
- **Can be done independently?** Yes, and can start earlier in parallel.

### Step 6 — Introduce a thin application/use-case layer in front of repository/UI orchestration
- **Why it comes later:** This is structural cleanup; do it after behavior is stabilized and tested.
- **What it changes:** Pulls mutation orchestration/import-export-reset flows out of `App.tsx` into small use-case functions/modules.
- **Expected benefit:** Reduced root-component coupling; easier future feature additions; clearer responsibility boundaries.
- **Implementation risk:** Medium.
- **Dependencies on previous steps:** Steps 1, 2, 5 recommended.
- **Can be done independently?** No; should follow stabilization steps.

### Step 7 — Incremental domain-oriented module reorganization (optional)
- **Why it comes last:** File/folder moves should happen only after behavior and boundaries are already clear.
- **What it changes:** Groups modules by feature/domain seams rather than broad component buckets, done in small slices.
- **Expected benefit:** Better long-term cohesion and ownership clarity.
- **Implementation risk:** Medium.
- **Dependencies on previous steps:** Step 6 recommended.
- **Can be done independently?** Not ideally.

### Step 8 — Schema rigor + explicit versioned migrations (optional but prudent)
- **Why this position:** Valuable once current flows are stable; avoid introducing migration framework while basic contracts are still shifting.
- **What it changes:** Formal schema validation and explicit migration path/version handling for persisted state.
- **Expected benefit:** Safer model evolution and stronger backward compatibility.
- **Implementation risk:** Medium.
- **Dependencies on previous steps:** Step 1 required; Step 3 strongly recommended.
- **Can be done independently?** Partly, but best after early stabilization.

---

## 3) Minimal viable refactor
If you only do the most important work, do this sequence:

1. **Step 1:** Persistence contract tests.
2. **Step 2:** Consolidate sorting/ordering ownership.
3. **Step 3:** Standardize storage/import error semantics.
4. **Step 4:** Extract key non-UI derivations from `HistoryScreen.tsx` (only the most complex logic first).

This gives the largest reliability and maintainability gain for the least risk and effort.

---

## 4) Full refactor for this app size
For a complete cleanup that is still proportional to a small app:

1. Step 1 — persistence contract tests
2. Step 2 — ordering ownership cleanup
3. Step 3 — storage/import error semantics
4. Step 4 — `HistoryScreen` logic extraction to pure modules
5. Step 5 — targeted integration tests for critical workflows
6. Step 6 — thin application/use-case layer for orchestration
7. Step 8 — schema rigor + explicit versioned migrations
8. Step 7 — selective domain-oriented module reorganization

Notes on independence:
- **Parallelizable:** Step 5 can run in parallel with late Step 4 work.
- **Independent optional track:** Step 8 can run after Step 3 even if Step 6 is deferred.
- **Do not parallelize heavily:** Steps 2 and 3 should be sequential to simplify debugging.

---

## 5) Stop line
Stop after **Step 6** for most scenarios.

At that point, the architecture is materially improved for current app size: contracts are tested, invariants are clear, errors are explicit, heavy UI logic is decomposed, and orchestration is no longer concentrated in one component.

Further work (beyond Step 6) has diminishing returns unless one of these triggers appears:
- frequent schema changes or import compatibility incidents (then do Step 8),
- sustained team growth or repeated ownership confusion (then do Step 7),
- measurable localStorage scalability pain (outside this phase; avoid premature persistence-engine migration).

---

## 6) Architectural decisions to document
After refactor, explicitly document these decisions:

1. **Invariant ownership:** where sorting/ordering truth lives and why.
2. **Persistence contracts:** accepted state shape, normalization rules, import/export guarantees.
3. **Error model:** categories of hydration/import errors and user-facing behavior.
4. **Boundary rules:** what belongs in UI components vs pure derivation modules vs application/use-case layer.
5. **Testing policy:** required coverage areas for persistence, derivations, and critical integration flows.
6. **Migration policy (if Step 8 completed):** schema versioning strategy and compatibility guarantees.

---

## Optional work vs overengineering (explicit)

### Optional for current app size
- Step 7 (domain-oriented file reorganization)
- Step 8 (full schema/migration rigor, unless model churn is active)

### Likely overengineering right now
- Introducing a full state-management framework before Step 6 proves insufficient.
- Replacing localStorage with IndexedDB without measured performance/UX evidence.
- Large “big-bang” architecture rewrites instead of incremental seam-based refactoring.

---

## Evidence anchors
- `docs/architecture-review/05-prioritized-recommendations.md`
- `docs/architecture-review/04-scalability-assessment.md`
- `docs/architecture-review/03-critical-diagnosis.md`
- `src/state/storage.ts`
- `src/App.tsx`
- `src/components/HistoryScreen.tsx`
