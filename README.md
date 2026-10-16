# SDD Engineering · plugin marketplace

Four portable packages extracted as reusable engineering practices from a GoIT
course project. Authored and maintained by Milad. The product's source, local
secrets and course submissions are deliberately outside these packages.

| Package | Responsibility | Depends on |
| --- | --- | --- |
| engineering-paved-path | Focused stack and boundary practices | — |
| research-tools | Read-only repository researcher | — |
| architecture-review | Independent architecture/security review | paved-path |
| sdd-engineering | Spec → plan → implementation → independent gates | all three |

## Install

Claude Code (>=2.1.110 for version-constrained dependencies):

```sh
claude plugin marketplace add imaxxer121/dev-digest-ai-marketplace
claude plugin install sdd-engineering@dev-digest-ai-marketplace --scope project
claude plugin list --json
```

Codex CLI also supports compatible marketplaces. Add the repository, install
the four packages and start a fresh session; explicit dependency installation
is documented because Claude's dependency resolution must not be assumed in
another runtime.

In Codex CLI open `/plugins` to install from a configured marketplace, then
start a new session. The independent
[consumer's repository catalog](https://github.com/imaxxer121/sdd-release-notes-demo/blob/feat/limit-installed-workflow/.agents/plugins/marketplace.json)
shows the supported remote `git-subdir` sources, pinned to the released commit.
Its `.codex/config.toml` enables the four packages only for that trusted project.
The measured installation used the native app-server plugin API; sanitized
receipts and exact installed versions are in `docs/evidence/release-sequence.json`.

Use the target repository's instructions and test commands. Start with the
installed `sdd-engineering:spec-creator`, then `implementation-planner`; use
`sdd-engineering:run-plan` only after an agreed spec and plan exist. See
[release/update/rollback](docs/RELEASES.md), [contribution guide](CONTRIBUTING.md),
[security](docs/SECURITY.md), [experiment](docs/COST-BASELINE.md), and
[verification status](docs/VERIFICATION.md).

## Develop

```sh
npm ci
npm --prefix site ci
npm test
npm run validate
npm run build:index
npm --prefix site run build
```

The catalog is built from manifests and actual Markdown sources. Generated JSON,
body copies and site/dist are ignored. This marketplace has no setup hooks, MCP
servers or bundled credentials. A successful CLI validation is not evidence of
model quality; measured workflow results are recorded separately.
