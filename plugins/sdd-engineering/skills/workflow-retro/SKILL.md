---
name: workflow-retro
description: "Analyze a completed workflow from real traces when a retrospective or cost experiment is requested."
---

Use the actual run traces, task artifacts and command logs. Report the real
topology, model when observable, tool calls, input/output/cache tokens, elapsed
time, quality outcome and repair iterations. Unknown values are null with their
missing source; never infer provider cost from a subscription price.

For repeated experiments keep scenario, model/routing and quality gate fixed;
change one factor. Report trial count and successes, median latency and total
measured usage divided by successful workflows. Keep billed USD separate from a
labeled token-cost proxy or estimated price schedule. Use the bundled script
`scripts/summarize-trials.mjs` for compatible JSON trial records. Retrospective
analysis does not authorize rerunning paid models or remote publication.
