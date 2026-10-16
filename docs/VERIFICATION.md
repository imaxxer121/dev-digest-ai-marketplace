# Release verification — 16 October 2026

[Main branch protection](evidence/main-protection.json) requires PRs, GitHub's
validate check and resolved conversations, including administrators. Force pushes
and deletions are disabled. The solo-owner human approval count is explicitly zero.

The independent consumer completed a real installed-profile workflow: generated
spec → plan → delegated source research → implementation → **45 passing tests**
→ two independent PASS gates. The marketplace released 1.0.0, updated to 1.1.0,
returned to pinned stable 1.0.0, passed its first-attempt smoke and restored current
1.1.0. Historical failed cost-trial grades remain visible.

The owner selected subscribed Codex because Claude model access is unavailable.
Official Claude CLI 2.1.301 performed real project-scoped dependency installation,
update/list/activation and tag operations without Claude inference. Codex native
API proves installed versions and fresh-session skill discovery. Actual model
calls use the documented explicit installed-profile adapter and real session
delegation. Implicit native Claude agent loading is not claimed.

| Acceptance item | Evidence and observed result |
| --- | --- |
| Portable marketplace | Four independently bounded packages; no credentials/hooks/MCP. Independent consumer has its own code/instructions and no copied SDD roles or skills. |
| Actual 1.0 installation | [Installer receipt](evidence/install-1.0.json): four enabled packages, +3 dependencies, canonical manifest versions 1.0.0. Displayed cache versions may have source suffixes. |
| Actual workflow | [Consumer PR1](https://github.com/imaxxer121/sdd-release-notes-demo/pull/1): unchanged real generated spec/plan, delegated researcher/implementer, root-executed 45 tests, independent installed-profile architecture and AC gates PASS. |
| Fresh 1.1 behavior | [Update evidence](evidence/update-1.1.json): actual installed profiles produced 10 mandatory requirements with 12 substantive ACs. Installed coverage helper accepts the result and rejects removal of R-01 coverage. Independent DAG/command-ownership review PASS. |
| Supporting files | [Native receipt](evidence/release-sequence.json): ten namespaced skills, zero discovery errors. Actual installed profile/helper/script hashes are retained. |
| Stable rollback | [First smoke](evidence/rollback-stable.json): distinct stable catalog pins all four sources to the exact 1.0 commit. Current disabled, stable enabled; same functional/coverage/DAG/role smoke PASS on its first attempt. |
| Restored current | [Release sequence](evidence/release-sequence.json): current four enabled, stable four retained and disabled. No target reset, cache purge or data deletion. |
| Catalog | [Live Pages](https://imaxxer121.github.io/dev-digest-ai-marketplace/) shows SDD 1.1.0, three skills, four agents and three dependencies. Browser search, actual artifact Markdown and copy-install text were inspected separately at 1.0. |
| Validation/release | 21 deterministic Node tests, manifest validation, TypeScript/Vite build and independent source review passed; official Claude validates 1.1 and stable. CI-green PR1/PR2 merged normally, without protection changes. |
| Cost experiment | [COST-BASELINE](COST-BASELINE.md) contains all six measured trials, separate legacy/blind grades, one changed factor, token proxies and null billing. It makes no all-green quality/optimization claim. |
| Delivery | Video upload and homework submission remain held. Instructor acceptance of the Codex adaptation is not assumed. |

All four dependency-first `--v1.0.0` tags point to reviewed merge
`15af4ceeff1e26e959649e9173f6cb651c882fe8`. Native tag dry-run/push created
`sdd-engineering--v1.1.0` at `c3f52eb7459220f81a844abd69d191c3c2ced049`;
existing tags were not moved. Hosted [PR validation](https://github.com/imaxxer121/dev-digest-ai-marketplace/actions/runs/38913881886),
[main validation](https://github.com/imaxxer121/dev-digest-ai-marketplace/actions/runs/38914059816)
and [Pages deployment](https://github.com/imaxxer121/dev-digest-ai-marketplace/actions/runs/38914060138)
all succeeded. Catalog deployment and actual client update were verified separately.

The cost experiment's final independent workflow success is **1/3 per group**;
four plans assigned commands to a no-shell verifier. Those failures motivated
separate 1.1 guidance. Treatment used **88432 versus 94173 input+output tokens**,
6.10% less, but median latency was **118859 versus 105178 ms**, 13.01% slower.
Billed USD is unknown. Three trials per group establish neither monetary savings
nor general quality improvement; old results are not relabeled as 1.1 passes.

The 1.1/stable requests are byte-identical to the original scenario; target source
text matches after LF/CRLF normalization. Raw target hashes therefore differ from
the original cost cohort. These are release smoke observations, not extra cost
group trials. Smoke proposals did not execute implementation tests; the separate
consumer workflow did. Private originals remain retained, with sanitized public
receipts rather than credentials or personal machine paths. The
[earlier checkpoint](verification-before-release.md) is preserved for chronology.
