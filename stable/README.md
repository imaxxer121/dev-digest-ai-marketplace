# Stable channel

Both catalogs pin every package to the reviewed 1.0.0 release commit
`15af4ceeff1e26e959649e9173f6cb651c882fe8`. They fetch packages from GitHub,
without relying on a DevDigest checkout or a copied local package. The channel
has a distinct marketplace identity so current and stable activation is visible.

For a Claude client, register the hosted JSON catalog:

```sh
claude plugin marketplace add https://raw.githubusercontent.com/imaxxer121/dev-digest-ai-marketplace/main/stable/.claude-plugin/marketplace.json --scope project
```

Disable the four current-channel packages in the consumer project, then install
`sdd-engineering@dev-digest-ai-stable --scope project`. Verify all dependencies
with `claude plugin list --json`, inspect cached manifests, and start a new
session before the smoke eval. Keep target work and plugin data intact.

The official [marketplace reference](https://code.claude.com/docs/en/plugins-marketplace-reference)
documents `git-subdir` sources and full-commit `sha` pins. Actual rehearsal
results belong in `docs/VERIFICATION.md`; this file alone is configuration,
not evidence that rollback has run.
