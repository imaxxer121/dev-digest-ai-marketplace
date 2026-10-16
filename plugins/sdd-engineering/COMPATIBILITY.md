# Runtime compatibility

Claude Code >=2.1.110 is required for version-constrained plugin dependencies.
The release is validated with the actual installed CLI, recorded in evidence.
No setup hook, MCP server or API key is bundled.

Codex CLI supports Claude-compatible marketplaces and skill packages. Agent
profile bodies can be supplied to real delegated workers when the runtime does
not register Claude agent types. Codex inherits the user's authenticated model;
do not claim a Claude model ran. CLI install/list proof and model-run proof are
different artifacts. Start a fresh session after installation/update.

In Codex, use the installed skill's directory and reported plugin root when
resolving support files. In Claude Code, plugin-level paths use
`${CLAUDE_PLUGIN_ROOT}` and skill-local paths use `${CLAUDE_SKILL_DIR}`.
Target paths and test commands come from that repository, not this package.
