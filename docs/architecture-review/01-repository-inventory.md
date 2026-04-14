# Phase 1 — Repository Inventory

## Scope and method
This document reconstructs the repository as it currently exists, focusing on observable architecture and implementation details without proposing changes.

---

## 1) High-level directory structure

```text
/
├─ src/
│  ├─ components/
│  │  ├─ OnboardingScreen.tsx
│  │  ├─ Dashboard.tsx
│  │  ├─ DecisionScreen.tsx
│  │  ├─ CheckInScreen.tsx
│  │  ├─ HistoryScreen.tsx
│  │  └─ ProfileScreen.tsx
│  ├─ domain/
│  │  ├─ types.ts
│  │  ├─ decision.ts
│  │  └─ decision.test.ts
│  ├─ state/
│  │  └─ storage.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ styles.css
├─ docs/
│  ├─ PROJECT_BRIEF.md
│  ├─ DECISION_RULES.md
│  ├─ FULL_SPEC.md
│  └─ architecture-review/
│     ├─ AGENTS.md
│     └─ 01-repository-inventory.md
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
└─ config.toml
```

Observations:
- Single frontend application repository with no backend/server project directories.
- Implementation code is concentrated in `src/components`, `src/domain`, and `src/state`.
- Architecture review artifacts are explicitly expected under `docs/architecture-review/`.

---

## 2) Main entry points

### Runtime entry points
- Browser HTML bootstrap: `index.html` mounts a `#root` container and loads `/src/main.tsx`.
- React bootstrap: `src/main.tsx` creates a React root and renders `<App />` within `React.StrictMode`.
- Application shell/orchestrator: `src/App.tsx` owns top-level tab navigation, onboarding gating, state hydration, state mutation handlers, import/export/reset actions, and screen composition.

### Tooling entry points
- `npm run dev` -> Vite dev server.
- `npm run build` -> TypeScript project build (`tsc -b`) + Vite production bundle.
- `npm run preview` -> Vite preview server.
- `npm run test` -> Vitest test run.

---

## 3) Runtime stack

- **UI framework:** React 18 function components + hooks.
- **Language:** TypeScript (strict mode enabled).
- **Execution target:** Browser runtime (DOM APIs such as `localStorage`, `Blob`, `URL.createObjectURL`, file input APIs).
- **Navigation model:** In-app tab state (`useState`) rather than router-based URL navigation.
- **Internationalization posture (observed):** User-facing copy is primarily Portuguese (`pt-BR`), with date formatting and labels in that locale style.

---

## 4) Build and tooling stack

- **Bundler/dev server:** Vite 5 with `@vitejs/plugin-react`.
- **Type-checking/build orchestration:** `tsc -b` with separate `tsconfig.json` and `tsconfig.node.json`.
- **Testing:** Vitest for unit tests (currently concentrated in domain logic tests).
- **Package manager lockfile:** npm (`package-lock.json`).
- **No linting/formatting tools explicitly configured** in `package.json` scripts (no ESLint/Prettier scripts observed).

---

## 5) Major dependencies and architectural implications

### Runtime dependencies
- `react`, `react-dom`
  - Implies component-driven client rendering, stateful UI via hooks, and no heavy external runtime frameworks.

### Dev dependencies
- `typescript`
  - Implies typed domain boundaries and compile-time validation across UI/domain/state layers.
- `vite`, `@vitejs/plugin-react`
  - Implies modern ESM workflow, fast HMR/dev loop, and static frontend bundling.
- `vitest`
  - Implies test execution integrated with Vite ecosystem; currently used for pure/domain logic validation.

### Notably absent (architectural signal)
- No routing library (`react-router` absent).
- No global state library (Redux/Zustand/MobX absent).
- No charting library (charts implemented manually in components via SVG/div bars).
- No form library (forms handled manually with controlled inputs and inline validation).
- No backend SDKs/client APIs (aligns with local-first/no-server stance).

---

## 6) State management approach as currently implemented

### Global app state shape
- Stored as a single `DomainState` object:
  - `profile`
  - `dailyWeights[]`
  - `weeklyMeasurements[]`

### State ownership and flow
- `App.tsx` holds the live app state in component state: `useState(() => localStateRepository.getState())`.
- `App.tsx` passes state slices and callbacks down as props (prop drilling from root to screen components).
- Mutations are command-like calls into `localStateRepository` methods; returned state is immediately set in React state.

### Derived state
- `App.tsx` creates `sortedState` via `useMemo` to ensure weight/measurement arrays are date-sorted before rendering.
- `domain/decision.ts` exposes pure functions that derive recommendation, confidence, trends, and explanatory text from `DomainState`.
- Feature screens compute local derivations via `useMemo` (e.g., check-in projections, timeline computation, moving averages).

### Navigation state
- `tab` in `App.tsx` (`dashboard | decision | checkin | history | profile`).
- Onboarding condition (`needsOnboarding`) gates initial flow based on data completeness rather than route.

---

## 7) Persistence approach as currently implemented

### Primary persistence
- Browser `localStorage` via `LocalStateStorage` abstraction in `src/state/storage.ts`.
- Storage key currently: `hellenistic-dream/state/v3`.

### Persistence model
- Full-state read/write (JSON serialized `DomainState`).
- Repository-style API (`localStateRepository`) wraps CRUD-like operations:
  - profile save
  - onboarding complete
  - upsert/delete daily weight
  - upsert/delete weekly measurement
  - reset

### Data interchange
- Export JSON: pretty-printed full state.
- Export CSV: row-based type-tagged export (`profile`, `daily_weight`, `weekly_measurement`).
- Import backup: `unknown` payload -> normalization -> schema-like validation -> overwrite persisted state.

### Compatibility handling
- `normalizeState` supports a legacy field alias (`weeklyCheckIns`) indicating migration/backward compatibility concerns already handled in code.

---

## 8) Key execution flows currently inferable

1. **App boot / hydration**
   - Browser loads app -> `App` initializes from persisted local state.

2. **Onboarding flow**
   - If profile or core records are missing, onboarding screen is forced.
   - Submit onboarding -> repository `completeOnboarding` persists profile + first daily + first weekly entries -> app switches to dashboard.

3. **Daily check-in flow**
   - User selects date and weight -> submit triggers upsert by date -> persistence update -> recalculated metrics displayed.

4. **Weekly check-in flow**
   - User provides waist (+ optional body fat) -> submit upserts weekly measurement -> recommendation recomputed.

5. **Recommendation rendering flow**
   - Dashboard and Decision screen call `getRecommendation(state)`.
   - Rule precedence: WHtR thresholds first, body-fat refinement only in intermediate zone, with confidence/trend derivations.

6. **History management flow**
   - Historical charts and recommendation timeline are computed from current state.
   - In-place editing and deletion of records call update/delete callbacks wired to repository methods.

7. **Backup/reset flow**
   - Profile screen triggers JSON/CSV exports and file-based JSON import.
   - Import replaces persisted state after validation; reset clears and reinitializes to empty state.

---

## 9) Modules/areas with highest density of logic

By file size and responsibility concentration:

- `src/components/HistoryScreen.tsx` (largest component)
  - Contains chart coordinate transformation, timeline derivation, editing workflows, delete workflows, and multiple UI states.
- `src/state/storage.ts`
  - Contains persistence abstraction, state normalization, validation, CSV serialization, compatibility behavior, and repository command surface.
- `src/domain/decision.ts`
  - Contains core recommendation algorithm, confidence/trend calculations, rule explanation text generation, and final derived decision payload.
- `src/App.tsx`
  - Concentrates composition/orchestration, tab navigation, onboarding gating, persistence command wiring, and import/export/reset handlers.

---

## 10) Areas that appear highly coupled

Observed coupling patterns (descriptive):

- **UI -> repository coupling through root callbacks:** `App.tsx` binds UI events directly to storage-backed repository methods.
- **UI screens -> domain decision engine:** Multiple components invoke `getRecommendation` or related decision helpers directly.
- **Data shape coupling across layers:** `DomainState` and aliases (`UserProfile`, `DailyWeightEntry`, etc.) are shared across app, components, and storage.
- **Temporal sorting assumptions:** Both storage and app-level derivations perform date sorting, suggesting shared assumptions about chronological ordering.

---

## 11) Areas with ambiguous responsibility

Potentially overlapping responsibilities visible in current code (without judging quality):

- **State ordering responsibility** appears in both repository upsert methods and `App.tsx` memoized sorting.
- **Validation responsibility** is split across UI forms (range/input checks) and repository import validation logic.
- **Decision presentation responsibility** is split between domain output strings and component-level formatting/contextual text.
- **Profile/edit onboarding semantics** are separated into Onboarding and Profile screens with partially overlapping field sets.

---

## 12) Existing docs, conventions, and architectural hints

### Product and architecture intent docs
- `docs/PROJECT_BRIEF.md`: concise product constraints (local-first, no backend, privacy, simple maintenance).
- `docs/DECISION_RULES.md`: explicit business rules for WHtR/body-fat classification and confidence semantics.
- `docs/FULL_SPEC.md`: extensive feature and UX specification, including planned routes and component ideas.

### In-code conventions/hints
- Portuguese-first user copy and domain terminology.
- Explicit local-first messaging in UI (“dados ficam no navegador”).
- Backward-compatible aliases in `types.ts` and compatibility parsing in `storage.ts` indicate incremental evolution rather than greenfield final model.
- Domain logic isolated enough to support unit testing (`decision.test.ts`) independent from UI rendering.

---

## Initial architectural hypotheses

1. The codebase has converged toward a **single-process frontend architecture** with no remote dependencies by design.
2. The project structure reflects an emerging **three-part split**: UI components, domain decision logic, and persistence/repository.
3. `App.tsx` currently functions as an **application coordinator/composition root** and carries much of orchestration behavior.
4. Feature growth appears to have happened primarily through **component-level expansion**, especially in `HistoryScreen`.
5. The architecture favors **explicitness over abstraction** (manual forms/charts/state handling) to preserve local simplicity.
6. Existing docs suggest broader planned scope than currently implemented runtime routing and module decomposition.

---

## Open questions for later phases

1. What is the intended long-term boundary between domain logic and presentation text generation?
2. Should persistence remain full-state localStorage writes, or is incremental persistence expected later?
3. Is URL-based navigation intentionally deferred, or intentionally rejected for this product stage?
4. How should state evolution/migrations be handled beyond current alias compatibility (`weeklyCheckIns`)?
5. Which responsibilities should stay in `App.tsx` versus move into dedicated orchestration modules/hooks?
6. Is `HistoryScreen` intended to remain a monolithic feature component or become subdivided?
7. What acceptance threshold defines “high confidence” operationally vs. current count-based heuristic?
8. Which portions of the large `FULL_SPEC.md` are authoritative versus aspirational?
9. Are offline/PWA capabilities planned or intentionally out of scope despite spec references?
10. What testing strategy is expected beyond current domain-level unit coverage?

---

## Executive summary (10–15 lines)

Hellenistic Dream is currently a single-page, local-first React + TypeScript application with no backend integration.
Its runtime architecture is intentionally browser-only, with persistence implemented through a localStorage-backed repository.
The app bootstraps through `main.tsx` and centralizes orchestration in `App.tsx`, which manages tabs, onboarding gating, and data mutation wiring.
Domain decision logic (WHtR + optional body-fat refinement + confidence/trend derivations) is concentrated in `src/domain/decision.ts` and covered by Vitest unit tests.
UI functionality is split into six primary screens, each rendered conditionally from a tab state rather than URL routing.
The most logic-dense UI area is `HistoryScreen`, which combines chart preparation, timeline derivation, inline editing, and deletion workflows.
Persistence concerns are dense in `storage.ts`, including normalization, compatibility handling, import validation, JSON/CSV export, and CRUD-like operations.
State is passed from the root through props; no external global state library or router is present.
The dependency footprint is intentionally small (React/Vite/TypeScript/Vitest), with many features implemented manually (forms/charts/navigation).
Documentation in `docs/` strongly reinforces product constraints: local-first operation, privacy by default, and no remote server.
Overall, the repository exhibits an organically evolved frontend architecture with clear functional behavior and concentrated orchestration points.

---

## Evidence anchors

- Runtime/bootstrap: `index.html`, `src/main.tsx`, `src/App.tsx`
- Domain model & rules: `src/domain/types.ts`, `src/domain/decision.ts`, `src/domain/decision.test.ts`, `docs/DECISION_RULES.md`
- Persistence/repository: `src/state/storage.ts`
- Feature UI modules: `src/components/*.tsx`
- Tooling/build: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`
- Product constraints/spec context: `docs/PROJECT_BRIEF.md`, `docs/FULL_SPEC.md`
