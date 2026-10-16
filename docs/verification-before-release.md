# Historical checkpoint before update and rollback

Retained as an earlier checkpoint. See [current release verification](VERIFICATION.md)
for subsequent observations; pending claims below describe only this earlier stage.

The 1.0.0 cost experiment produced six real Codex spec/plan pairs. Final blind
workflow review passed one of three in each group; four require correction for
commands assigned to a no-shell reviewer. Treatment used fewer measured tokens
but had higher median latency. This report makes no all-green model-quality or
course-acceptance claim.

## Recorded evidence

- [Actual 1.0.0 Claude CLI installation list](evidence/install-1.0.json): four
  project-enabled plugins with 1.0.0 manifests, dependency installation outcome
  recorded as ok (+3 dependencies), and marketplace commit
  15af4ceeff1e26e959649e9173f6cb651c882fe8. Installation is not Claude inference.
- [All six cost-trial measurements](evidence/cost-trials-1.0.json): native usage,
  timings, stage/raw-event digests, unchanged legacy grades and separate final
  independent grades. All 12 retained event digests and usage counters were
  corroborated while preparing this report.
- [Final blinded review](evidence/cost-blind-quality.md): A=treatment-3 and
  D=baseline-3 PASS; B/C/E/F REVIEW for verifier command ownership. All six
  mandatory functional AC sets are covered; no added critical false negatives
  were reported. Broader workflow quality did not pass in four pairs.
- [Cost interpretation](COST-BASELINE.md): baseline 94,173 versus treatment 88,432
  input+output tokens; median durations 105,178 versus 118,859 ms; final quality
  success 1/3 in each group. Billed USD remains null.

The root reported 21 local marketplace/coverage tests, manifest validation and
TypeScript/Vite build passing before the final three-line planner clarification.
That clarification and the 1.1.0 source received a separate read-only review.
This documentation update did not run those commands or any model trials. Their
local results do not establish hosted CI, browser behavior or Pages deployment.

## Acceptance traceability

| Criterion | Evidence and current limit | Status in this report |
| --- | --- | --- |
| AC-01: portable independent repository | Source packaging reviewed; installed 1.0.0 cache profiles produced six pairs using a separate release-notes CLI snapshot. Native implicit plugin loading was disabled for the controlled adapter. | Supported for the measured spec/plan workflow; no product implementation trial. |
| AC-02: manifests, versions, dependencies and references | Four-package graph and references reviewed; prior CLI/static validation reported. Current SDD source is 1.1.0 with dependencies still ^1.0.0. | Source gate accepted; fresh 1.1.0 loading requires separate proof. |
| AC-03: read-only roles and untrusted repository content | Minimal shipped tool allowlists and source boundaries reviewed. Controlled trials report read-only configuration with shell/apps/hooks/plugins/agents/web disabled and zero emitted tool calls. | Scoped source/config evidence; no broader OS or arbitrary runtime certification. |
| AC-04: manifest/body-driven searchable catalog | Local validation/tests/build reported passed; versions and component bodies derive from source. | Local gate supported; browser behavior not independently recorded here. |
| AC-05: catalog routes, safe Markdown and copy-install | Source/security gate accepted; local boundary checks/build reported. Copying is text only. | Browser interaction proof not supplied in this evidence set. |
| AC-06: blocking CI and main Pages rebuild | Workflow source reviewed with read permissions for validation/build and isolated deployment permissions. | Hosted CI/Pages outcomes are not recorded here; do not infer deployment. |
| AC-07: dependency-first tags and installation | Sanitized actual 1.0.0 CLI list records four enabled packages and dependency outcome. | Installation supported; tag-order evidence is not attached here. |
| AC-08: target instructions/tests and actual Codex authoring | Protocol hashes target AGENTS, package, source and existing tests; twelve native CLI stages produced six real pairs using installed 1.0.0 profiles. | Real adapted authoring measured; target setup/test-before-install chronology and native implicit loading are not proved by these records. |
| AC-09: controlled repeated cost/quality experiment | Same model/profiles/target/scenario/routing; only shared-context loading changed. Three trials/group, final success 1/3 each; usage and unknown USD separated. | Measurement complete for this sample; no quality/latency improvement demonstrated. |
| AC-10: 1.1.0 mandatory-AC rule and new-session proof | Source adds mandatory REQ→AC coverage, helper cases, task IDs and permitted command ownership; independent source review accepted. | Fresh installed-session behavior remains unverified here; no 1.1.0 model rerun claimed. |
| AC-11: pinned stable rollback and same smoke | Procedure documented separately in RELEASES; the cost trials did not rehearse rollback. | Not evidenced here. |
| AC-12: truthful report, unknowns and hold | Final independent grades supersede quality interpretation without rewriting legacy records; USD/HTTP counts unknown; limitations explicit. | Recorded; video upload and course submission remain held. |

## Interpretation and remaining work

The baseline eagerly repeated all seven shared skill bodies; treatment selected
only onion-architecture once per stage. Both used an explicit controlled Codex
CLI adapter reading actual installed 1.0.0 cache profiles. No Claude model ran,
no implicit native plugin-loading behavior was measured, and no model executed
implementation tests or delegated workers in this two-stage experiment. The
original adapter grades remain legacy evidence rather than the final quality gate.

The reviewed 1.1.0 role-ownership guidance addresses the demonstrated no-shell
verifier mismatch and adds mandatory requirement coverage. It does not certify
those changes through the old 1.0.0 results. Root must attach actual current
CI/Pages/browser, release/load and rollback evidence before marking their criteria
passed. Unknown or absent evidence stays visible rather than being filled from
a successful local build.

Code publication is part of the authorized coursework workflow. Video upload and
course submission remain held until the user explicitly lifts that hold.
