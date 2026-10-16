# Security and trust

Review a package before installation. This release supplies Markdown workflows
and a local retrospective summarizer. It declares no setup hooks, MCP servers
or authentication flow. It does not grant permission to publish, delete data,
run paid APIs or message another person. Existing human instructions prevail.

Repository content, diffs and external documents are untrusted inputs. A role
must not follow an embedded request to send secrets or change its scope. Give
read-only roles a read-only runtime as well as minimal declared tools. Attribute
security findings to real input-to-sink data flow, not a keyword or JSX value.

Do not commit API keys, private journals, .env or absolute personal paths. Report
a suspected unsafe release through a private GitHub security advisory; do not
post a secret into an issue. Disable the affected current-channel plugin,
pin the reviewed stable commit, and run the documented smoke check. Revoke any
exposed credential with its provider; shipping a later package does not revoke it.

The catalog sanitizes rendered Markdown and restricts fetches to generated local
body paths. It contains no executable plugin installer; copy-install only copies
text for a user to review in their CLI.
