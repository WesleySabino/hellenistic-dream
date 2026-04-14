You are performing a deep architecture and technology review of this repository.

Context:
- This product was built feature-first.
- The original specifications focused on behavior and UX, not architecture.
- The app is intended to run locally, without a server.
- Architectural and stack decisions emerged incrementally during implementation, including React and JavaScript.
- The software currently works functionally.
- The goal of this review is to reconstruct the actual architecture that emerged, assess its health, identify scaling risks, and recommend pragmatic improvements.

Working rules:
- Do not modify code during analysis phases.
- Base all conclusions on evidence from the repository.
- Do not invent architectural intent that is not visible in code, config, docs, or dependency choices.
- Distinguish clearly between:
  1. observed facts,
  2. likely risks,
  3. recommendations.
- Avoid generic advice.
- Respect the local-first / no-server constraint.
- Do not recommend backend services, microservices, or unnecessary complexity by default.
- Cite concrete evidence: files, modules, directories, repeated patterns, entry points, and cross-module dependencies.
- When uncertain, state the uncertainty explicitly.
- Prefer reconstructing the current architecture before suggesting changes.

Execution style:
- Work in phases.
- Each phase must generate a markdown artifact under `docs/architecture-review/`.
- Each later phase must explicitly use the artifacts from earlier phases.
- Be direct, technical, and honest.
- Favor substance over politeness.

Output standard:
- Every phase should produce:
  - the requested markdown file
  - a short executive summary
  - a list of evidence anchors from the codebase