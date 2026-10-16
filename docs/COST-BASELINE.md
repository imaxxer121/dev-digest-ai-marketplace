# Cost experiment — measured 1.0.0 results

The treatment used 6.10% fewer measured tokens, but it did not improve the final
workflow-quality success rate and was slower in this sample. Baseline and treatment
each passed 1 of 3 independent blinded reviews. Median latency rose from 105,178
to 118,859 ms. Billed USD is unavailable and remains null; token totals are a
cost proxy, not a dollar amount.

The complete selected measurements, stage counters, raw-event digests and grading
provenance are in [cost-trials-1.0.json](evidence/cost-trials-1.0.json). The separate
[blind quality report](evidence/cost-blind-quality.md) preserves the final mapping
and the role-permission finding.

## Fixed protocol and the one changed factor

The scenario asks for proposed specification and implementation-plan artifacts for
an independent offline release-notes CLI. Add --limit N, accepting decimal integers
1 through 100; reject missing, non-integer, non-decimal, out-of-range and duplicate
options with stderr and exit code 2. Preserve omitted-option output, input ordering,
empty-array output and offline operation. Verification must cover 1, 100, 0, 101,
1.5, abc, missing value and duplicate flags using the target's actual files and
test command. No product implementation, test execution or publication is part
of the generated workflow.

Both groups used the same installed sdd-engineering 1.0.0 profiles, configured
gpt-6.1-sol model, target-source hashes, scenario, spec→plan routing, output schema
and final quality criteria. The adapter supplied the actual installed cache
profiles explicitly to two sequential subscribed Codex CLI stages per trial.
Native implicit plugins and model tools/delegation were disabled. These are real
Codex-generated artifacts, not Claude inference or proof of implicit plugin loading.
The native events do not establish a separate backend-resolved model identity.

Baseline eagerly included all seven shared engineering skill bodies twice in
each stage prompt. Treatment supplied only onion-architecture once per stage,
selected by the controlled adapter. This measures that context-loading change;
it does not measure autonomous skill selection. Each planner received its own
trial's generated spec, so later prompt sizes naturally vary with that output.

Actual execution order was baseline-1, treatment-1, treatment-2, baseline-2,
baseline-3, treatment-3. Every trial completed both native CLI stages without a
reported timeout or nonzero exit. There were 12 CLI invocations and 12 emitted
completed turns overall, with zero emitted model-generated tool calls. Actual
HTTP request count is unknown; CLI invocation counts are not HTTP-call counts.

## All six trials

Legacy is the original deterministic adapter grade. Final is the independently
reviewed blinded workflow grade. REVIEW is not counted as a quality success.

| Trial | Blind case | Input tokens | Cached input | Output tokens | Total tokens | Duration ms | Legacy | Final |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| baseline-1 | B | 27,078 | 0 | 5,363 | 32,441 | 123,533 | FAIL | REVIEW |
| treatment-1 | C | 24,505 | 0 | 5,538 | 30,043 | 129,169 | PASS | REVIEW |
| treatment-2 | F | 24,444 | 0 | 4,795 | 29,239 | 118,859 | PASS | REVIEW |
| baseline-2 | E | 26,401 | 0 | 4,593 | 30,994 | 101,584 | FAIL | REVIEW |
| baseline-3 | D | 26,474 | 0 | 4,264 | 30,738 | 105,178 | PASS | PASS |
| treatment-3 | A | 24,301 | 0 | 4,849 | 29,150 | 108,842 | FAIL | PASS |

## Group comparison

| Metric | Baseline | Treatment |
| --- | ---: | ---: |
| Trials | 3 | 3 |
| Final independent quality successes | 1/3 | 1/3 |
| Final independent REVIEW results | 2 | 2 |
| Input tokens | 79,953 | 73,250 |
| Cached input tokens | 0 | 0 |
| Output tokens | 14,220 | 15,182 |
| Total tokens: input + output | 94,173 | 88,432 |
| Uncached input tokens per quality success | 79,953 | 73,250 |
| Total tokens per quality success | 94,173 | 88,432 |
| Median stage-summed trial duration, ms | 105,178 | 118,859 |
| Total stage-summed duration, ms | 330,295 | 356,870 |
| Supplied application prompt UTF-8 bytes | 105,471 | 67,899 |
| Native CLI invocations | 6 | 6 |
| Emitted model-generated tool calls | 0 | 0 |
| Measured cache ratio | 0/79,953 = 0% | 0/73,250 = 0% |
| Billed USD | null | null |

Total tokens fell by 5,741, or 6.10% of baseline. Median latency increased by
13,681 ms, or 13.01%. Output tokens increased, so reduced prompt bytes should not
be mistaken for an equal reduction in provider usage. Prompt bytes, native token
counters and elapsed milliseconds are separate units. No price schedule or
monetary estimate has been substituted for unavailable billing.

Per-success proxies include every trial's usage, including REVIEW results, divided
by final independent PASS workflows. The denominator is one in each group. Cache
ratios use summed native input_tokens, with cached_input_tokens as its included
subset; measured zero cache usage is distinct from an unavailable counter.
Native reasoning detail is retained per stage in the JSON and is not added again
to input + output totals.

## Quality findings and the 1.1.0 repair

Blind A (treatment-3) and D (baseline-3) passed. B (baseline-1), C (treatment-1),
E (baseline-2) and F (treatment-2) require review because their plans assign test
execution to the shipped no-shell plan-verifier. All six pairs covered the mandatory
functional requirements, and the final review reported no added critical false
negatives. Functional coverage alone did not establish an executable workflow.

The original automatic grades were baseline 1/3 and treatment 2/3. They are
preserved unchanged as legacy evidence, including their original errors. They
are not the final quality gate and must not be used to claim a quality lift.

The reviewed 1.1.0 source now requires mandatory REQ→AC coverage, real task-ID
dependencies and executable checks assigned only to a runtime permitted to run
them. No-shell architecture/plan reviewers consume source and recorded check
output. Its coverage helper has positive and negative deterministic cases.
These changes address a demonstrated workflow problem; they do not retroactively
turn the six 1.0.0 trials into 1.1.0 passes. New-session 1.1.0 behavior needs its
own evidence.

## Evidence boundaries

Three trials per group support a descriptive comparison, not statistical
significance, general model-quality improvement or proven monetary savings. The
artifacts propose future code/tests; the model did not implement --limit or run
those tests. Independent review is a quality judgment, with its final grades
supplied by the root after blind mapping; no unreported reviewer model is invented.

Original trial JSON, prompts, schemas, outputs, stderr, native event JSONL and
blind pairs remain unchanged in private workspace evidence. Public JSON records
their source hashes and all 12 event digests without copying credentials, personal
paths or private journals. This documentation task read and aggregated retained
evidence; it ran no shell commands, tests or model calls. Course video upload and
submission remain held.
