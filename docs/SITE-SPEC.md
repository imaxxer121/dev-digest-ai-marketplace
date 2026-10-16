# Catalog specification

Build a static React/TypeScript/Vite application with hash routes: /, /search,
/plugin/<name>, /artifact/<id>, /whats-new and /getting-started. Read generated
index.json, releases.json and stats.json from the deployment base path. Include
version/dependencies, owners, compatibility, real component bodies and copy-install.
Search both plugin and skill/agent names, descriptions and Markdown content.

Generate all data at build time from marketplace/manifests/frontmatter/README/
CHANGELOG/COMPATIBILITY. Escape identifiers into local generated filenames;
untrusted Markdown passes through DOMPurify after marked. Never execute source
HTML or a copied command. No ratings, backend or fabricated download metrics.

Provide accessible keyboard controls, responsive layout, visible loading/error/
empty states, and a clear route back from an unknown artifact. PR CI validates
and builds; main rebuilds and publishes site/dist to GitHub Pages. Generated JSON,
body copies and dist are ignored. Tests should reject unsafe body paths and
exercise index/dependency/rendering boundaries, not mirror headings or CSS.
