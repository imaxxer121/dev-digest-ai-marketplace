---
name: run-plan
description: "Execute an existing agreed SDD plan by its dependency DAG and owned paths, then independent review and a bounded repair loop."
---

Read the supplied agreed spec and plan plus target AGENTS.md/CLAUDE.md. This
skill executes a plan; spec and plan authoring are separate roles. Preserve
existing session authorization and holds. Missing consequential decisions go to
the orchestrator, without repeating answered questions.

Use namespaced roles: research-tools:researcher for source questions,
sdd-engineering:implementer for ready tasks,
architecture-review:architecture-reviewer and sdd-engineering:plan-verifier for
independent read-only gates. In a runtime without registered agent types, read
the shipped role profile and pass its complete scope to an available subagent;
record actual delegation instead of inventing named-agent execution.

Before dispatch, record baseline/dirty files and validate the plan's DAG,
AC coverage and exact path ownership. Use the authorized mode, maximum three
concurrent implementers and no overlapping writers. Workers cannot spawn nested
agents or publish. The orchestrator retains permitted checks and integration.
Load stack skills from engineering-paved-path only when the task needs them.

The spec's coverage table must give every mandatory requirement an AC before
execution starts. For structured requirements/acceptance arrays, the orchestrator
may run `evals/coverage-gate.mjs` from the installed plugin root; in Claude Code
that root is `${CLAUDE_PLUGIN_ROOT}`. Return missing coverage to the spec writer
without silently expanding scope. Review-gate dependencies must resolve to real
task IDs, with read-only tasks declaring no editable paths.

Collect each task's actual changes, commands/results and remaining evidence.
After implementation checks, dispatch the two independent read-only gates with
the same spec/plan/diff and evidence. Repair critical/high findings and missing
ACs for at most max-fix:3, or the user's lower cap. Re-review affected criteria.
Stop on no progress; never label missing evidence as passed. No test-writer.

Return the actual topology, changed paths, commands, gate matrices, fix rounds
and limits. This skill grants no commits, pushes, remote messages or deployment.
Preserve the user's separate publication authorization outside this skill.
