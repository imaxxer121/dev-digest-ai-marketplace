# Contributing

Use one focused pull request. Every plugin lives under `plugins/<name>` and has
`.claude-plugin/plugin.json`, README and CHANGELOG. Skills use
`skills/<name>/SKILL.md`; agents use `agents/<name>.md`. A plugin may omit an
empty component directory. Manifest version is the source of truth; marketplace
entries reference relative sources without duplicating versions.

Name cross-package components `plugin-name:component-name`. Declare explicit
SemVer dependency ranges and release dependencies first. Keep the graph acyclic.
Make target paths, instructions and test commands inputs, not baked-in product
assumptions. Keep read-only agent allowlists to Read/Glob/Grep; writers receive
only the files assigned by the orchestrator. Do not add hooks, network services
or credential flow incidentally to an instruction edit.

Run README's local commands and the actual Claude CLI validation for every
changed manifest. Add a behavioral case for a new capability and a negative
case for a tempting wrong activation. A static validator is only a packaging
gate. Record actual model outcomes separately, with model/routing and trace.

Before review: check dependency references, supporting files, portable paths,
permissions, compatibility, SemVer/changelog and catalog output. Generated index
and build output do not belong in commits. The owner reviews code and the final
artifact; passing CI alone does not assert that every model run is correct.

Main requires a pull request, the GitHub Actions `validate` check, an up-to-date
branch and resolved conversations, including administrators. Force pushes and
deletions are disabled. [Observed protection](docs/evidence/main-protection.json)
records the actual settings. This teaching repository has one owner, who cannot
approve their own PR: the enforced human approval count is explicitly zero;
CODEOWNERS and independent source-review evidence remain separate controls.
