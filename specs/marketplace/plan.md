# Marketplace implementation plan

1. Package four plugins and a dependency graph, generalized SDD roles and skills.
   Add deterministic validators and realistic eval scenarios (AC-01..03,07,10).
2. Build-time index plus React/TypeScript/Vite hash-routed catalog, safe Markdown,
   manifest-driven details/search/releases/copy-install (AC-04..06).
3. Review and validate locally, publish authorized teaching repository, run
   validation CI, release dependency tags then SDD 1.0.0, deploy Pages (AC-06..07).
4. Prepare independent small CLI repository with its own tests/instructions,
   install through Claude CLI (no inference) and Codex; record actual list/load
   evidence before running the fixed SDD scenario (AC-01,03,08).
5. Run repeated controlled baseline/treatment trials with one prompt-context
   optimization, same scenario/model/routing/evals. Preserve raw traces and
   separately label subscribed-token cost proxy and unavailable billing (AC-09).
6. Release backwards-compatible SDD 1.1.0 mandatory-AC rule, test new session,
   demonstrate pinned stable 1.0.0 rollback and smoke (AC-10..11).
7. Independent read-only packaging/security/AC review; bounded targeted fixes,
   final checks and truthful report; prepare demo without uploading (AC-12).

No concurrent ownership overlaps: package author owns plugins/docs/manifests;
catalog implementer may own site/scripts/index when explicitly delegated.
Publication is root-owned and already authorized by the coursework request.
Never infer Claude model execution from a successful Claude CLI installation.
