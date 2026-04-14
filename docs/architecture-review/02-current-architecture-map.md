# Phase 2 — Current Architecture Map (Reconstructed from Code)

## Inputs used from earlier phases
This phase explicitly builds on Phase 1 inventory and verifies/extends it against source code paths listed there.

- Prior artifact used: `docs/architecture-review/01-repository-inventory.md`
- Verification focus in code: `src/App.tsx`, `src/state/storage.ts`, `src/domain/*`, `src/components/*`, `src/main.tsx`

---

## system overview

### Observed architectural shape (today)
The running system is a **single-process client application** in the browser with a **composition-root component (`App`) coordinating three practical layers**:

1. **UI layer** in `src/components/*` and top-level view switching in `App.tsx`
2. **Domain/rules layer** in `src/domain/decision.ts` (pure functions over typed state)
3. **Persistence/repository layer** in `src/state/storage.ts` (localStorage-backed repository API)

This is not a formal hexagonal/clean architecture implementation, but it does have an emergent **UI -> domain + repository** dependency shape.

### Evidence highlights
- App boot and rendering are browser-only (`main.tsx`), no server entry points.
- `App.tsx` owns tab state, onboarding gate, and all mutation wiring to repository methods.
- `localStateRepository` persists full `DomainState` snapshots in localStorage.
- Domain decision functions are pure and unit-tested (`decision.test.ts`).

---

## module map

### A) Composition/orchestration module
- **`src/App.tsx`**
  - Holds canonical in-memory app state (`useState(() => localStateRepository.getState())`)
  - Orchestrates navigation (`tab`), onboarding gating, data mutations, import/export/reset
  - Passes state and mutation callbacks into feature screens

### B) Domain module
- **`src/domain/types.ts`**
  - Shared domain model and aliases (`DomainState`, `Profile`, `DailyWeight`, `WeeklyMeasurement`, etc.)
- **`src/domain/decision.ts`**
  - Recommendation classification (WHtR-first, optional body-fat refinement)
  - Derived analytics (confidence, 7-day average, simple trends)
  - User-facing reasoning payload (`reason`, `explanation`, `appliedRule`)
- **`src/domain/decision.test.ts`**
  - Unit tests covering core decision behavior and helper calculations

### C) Persistence module
- **`src/state/storage.ts`**
  - Storage adapter (`LocalStateStorage`) over browser `localStorage`
  - Repository facade (`localStateRepository`) for CRUD-like operations
  - Import normalization/validation and JSON/CSV export
  - Legacy compatibility path (`weeklyCheckIns` alias)

### D) UI feature modules
- **`src/components/OnboardingScreen.tsx`** — initial profile/first entries + validation
- **`src/components/Dashboard.tsx`** — current recommendation and summary metrics
- **`src/components/DecisionScreen.tsx`** — rule transparency/explanation view
- **`src/components/CheckInScreen.tsx`** — daily/weekly entry forms + projected recommendation
- **`src/components/HistoryScreen.tsx`** — charts, timeline derivation, inline edit/delete
- **`src/components/ProfileScreen.tsx`** — profile edit + backup/import/reset actions

---

## initialization flow

1. Browser loads `index.html` and `src/main.tsx` mounts `<App />`.
2. `App` initializes state from `localStateRepository.getState()` (localStorage read).
3. `App` computes `needsOnboarding` based on profile + minimum records presence.
4. If onboarding required, only `OnboardingScreen` is rendered.
5. After onboarding completion, repository writes full initial state and app moves to dashboard tab.

**Implication:** startup is deterministic and synchronous with localStorage as single source at boot time.

---

## data flow

### Ingress points
- User form input in onboarding/check-in/profile/history edit forms
- Imported backup JSON in profile screen

### Transformation pipeline (typical mutation)
1. UI captures raw input strings/numbers in component-local state.
2. UI performs immediate validation/parsing (range checks, optional number parsing).
3. UI calls callback prop provided by `App`.
4. `App` delegates to `localStateRepository` mutation method.
5. Repository reads current persisted state, applies immutable transformation, sorts where relevant, writes back.
6. Updated full state is returned to `App` and set into React state.
7. UI rerenders and recomputes derivations (`useMemo`, domain functions).

### Domain derivation flow
- `getRecommendation(state)` is called in Dashboard and Decision screens; CheckIn/History also use domain helpers for projections/timelines.
- Derived outputs include recommendation, rule explanations, confidence, trends, and WHtR.

**Observed pattern:** state is mutated through persistence-first operations (read/write localStorage per command), not through a dedicated in-memory reducer/store.

---

## state flow

### Canonical runtime state
- Canonical app state in memory is `state` in `App.tsx`.
- Canonical persisted state is JSON under `hellenistic-dream/state/v3` in localStorage.

### State locations by scope
- **Global app scope:** `App` (`state`, `tab`)
- **Feature-local UI scope:** each screen has local transient UI state (form fields, edit modes, success/error messages)
- **Derived state:** computed ad hoc in screens and domain helpers (`useMemo`, helper calls)

### Important state characteristics
- State is passed top-down via props (no context/store library).
- Multiple layers assume date-ordered arrays; ordering is enforced in repository writes and re-applied in `App` via `sortedState`.
- Domain aliases in `types.ts` indicate transitional naming compatibility (`AppState`, `WeeklyCheckIn`, etc.).

---

## persistence flow

### Where persistence lives
- Entirely in `src/state/storage.ts`.

### How persistence works
- Full-state snapshot persisted as JSON string in localStorage key `hellenistic-dream/state/v3`.
- Every repository mutation performs read -> transform -> write -> return new snapshot.
- Backup/export reads persisted state directly (JSON and CSV serializers).
- Import flow normalizes unknown payload, validates structural types, then overwrites persisted state.
- Reset clears key then writes empty baseline state.

### Durability and compatibility behaviors
- Corrupt JSON fallback: read failure returns empty initial state.
- Legacy field compatibility: supports `weeklyCheckIns` alias during normalization.

---

## real boundaries vs missing boundaries

### Real boundaries that exist
1. **UI vs persistence boundary** through explicit callback props from `App` into components.
2. **Domain rules boundary** via pure functions in `domain/decision.ts` that accept state and return derivations.
3. **Persistence boundary** via repository facade instead of direct localStorage use in components.

### Weak/implicit boundaries
1. **Orchestration boundary is overloaded in `App.tsx`** (navigation, hydration, mutation dispatch, side effects, import/export wiring).
2. **Business logic is split** between domain module and component-level logic (e.g., recommendation timeline and chart calculations live in `HistoryScreen`).
3. **Validation boundary is split** across UI forms and import validator in storage.
4. **Ordering invariant boundary is duplicated** (repository sorts and `App` sorts again).

### Missing boundaries
1. No explicit application service/use-case layer between UI events and repository/domain operations.
2. No centralized error handling strategy for async/import failures beyond local component feedback.
3. No explicit module-level contract for date handling/timezone policy (date strings are assumed ISO-like and compared lexicographically).
4. No dedicated selector/derivation layer; each screen derives its own projections.

---

## architectural hotspots

1. **`src/App.tsx` as a god-orchestrator risk**
   - High coupling point for navigation + mutation routing + persistence side effects.
2. **`src/components/HistoryScreen.tsx` feature density**
   - Mixes rendering, chart math, timeline classification, editing workflows, and validation.
3. **`src/state/storage.ts` persistence concentration**
   - Serialization, schema normalization, compatibility logic, repository commands in one file.
4. **Implicit invariants around sorted arrays and date strings**
   - Correctness depends on conventions rather than explicit guards/types.
5. **Shared domain types imported across all layers**
   - Helpful consistency, but increases blast radius for model changes.

---

## Direct answers to the 10 architecture questions

### 1) What architectural shape does this system really have today?
An **emergent layered frontend monolith**: React component UI, pure-domain helper module, and localStorage repository, coordinated centrally by `App`.

### 2) How does data enter, move through, transform within, and persist across the application?
Data enters through UI forms/import, is validated/parsing in components, routed through `App` callbacks to repository commands, transformed immutably, persisted to localStorage, and re-hydrated into `App` state for rerender and domain derivation.

### 3) Where is UI logic located?
Primarily `src/components/*` plus tab/onboarding render orchestration in `src/App.tsx`.

### 4) Where is business logic located?
Core recommendation logic is in `src/domain/decision.ts`; additional behavior logic (timeline generation, chart transforms, some validation) is embedded in components, especially `HistoryScreen` and onboarding/check-in forms.

### 5) Where is state located?
Global runtime state in `App` React state; transient interaction state in feature components; persisted canonical snapshot in localStorage via repository.

### 6) Where is persistence located?
`src/state/storage.ts` exclusively (adapter + repository + import/export).

### 7) What module boundaries actually exist?
- UI modules by screen
- Domain module by rules/types
- Persistence module by storage/repository
- App composition boundary coordinating cross-module interactions

### 8) Which boundaries are weak, implicit, or missing?
Weak: orchestration and business-rule placement in UI components. Implicit: ordering/date conventions and validation split. Missing: explicit use-case/service layer and shared selector/derivation boundary.

### 9) What conventions appear to govern the codebase?
- Local-first, browser-only operation
- TypeScript shared domain types across layers
- Function components + hooks + prop callbacks
- Immutable update style
- Portuguese user-facing copy
- Decision-rule purity in domain with unit tests

### 10) What dependencies between modules look fragile or overly implicit?
- UI depends on repository side effects per action (read/write each command)
- Components assume shape/order invariants of `DomainState`
- History and Check-in screens call domain rules directly while also reimplementing related derivations
- `App` depends on repository naming/backward-compatible aliases, signaling transitional coupling

---

## Architecture health classification

**Classification: acceptable but improvised**

### Why this classification
- **Healthy signals:** clear practical separation between domain rules and persistence; pure tested core decision module; minimal dependency surface; local-first constraint is consistently respected.
- **Improvised signals:** orchestration concentration in `App`, heavy feature component logic (`HistoryScreen`), duplicated invariants (sorting/validation split), and missing explicit application-service boundaries.
- **Net effect:** the current architecture is workable and coherent for present scope, but scaling feature complexity will likely increase coupling and change risk unless boundaries become more explicit.

---

## Executive summary
The actual architecture is a browser-only, local-first React frontend monolith with emergent layering rather than formal architecture patterns. `App.tsx` is the composition root and operational hub: it hydrates state, gates onboarding, manages tab navigation, and routes all mutation commands to a localStorage repository. Core recommendation logic is separated and pure in `domain/decision.ts`, with test coverage validating key rule precedence and helper behavior. Persistence is centralized in `state/storage.ts`, including backup import/export, validation, and a compatibility path for older field names. UI components are feature-oriented, but some contain non-trivial business/derivation logic (notably `HistoryScreen`). State exists simultaneously as App in-memory state and persisted full snapshots in localStorage; most flows are synchronous and deterministic. Architectural boundaries exist, but key ones are implicit or overloaded, leading to an "acceptable but improvised" posture: stable now, with visible scaling hotspots.

## Evidence anchors
- `docs/architecture-review/01-repository-inventory.md`
- `src/main.tsx`
- `src/App.tsx`
- `src/state/storage.ts`
- `src/domain/types.ts`
- `src/domain/decision.ts`
- `src/domain/decision.test.ts`
- `src/components/OnboardingScreen.tsx`
- `src/components/Dashboard.tsx`
- `src/components/DecisionScreen.tsx`
- `src/components/CheckInScreen.tsx`
- `src/components/HistoryScreen.tsx`
- `src/components/ProfileScreen.tsx`
