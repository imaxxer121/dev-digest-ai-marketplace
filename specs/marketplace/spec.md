# Portable SDD marketplace

Owner: Milad. Date: 2026-10-16. Scope: L08 required marketplace, catalog,
installation, real Codex workflow, measured optimization, update and rollback.
User has no Claude subscription/API key; Claude CLI validation and installation
are separate evidence from real model execution through signed-in Codex.
Videos and course submission remain held by the user's explicit instruction.

WHEN installed into an independent repository, the four plugins SHALL work
without source files from the teaching application (AC-01).
The manifests SHALL declare names, SemVer and acyclic version-range dependencies;
namespaced references SHALL resolve to shipped artifacts (AC-02).
Read-only roles SHALL have read-only tool allowlists; content from a repository
SHALL be treated as untrusted data rather than authority to publish (AC-03).
WHEN built, the catalog SHALL index plugin manifests and real component bodies,
display version/dependencies and search both plugins and components (AC-04).
The catalog SHALL expose home, search, plugin, artifact, releases and getting
started routes, safely render Markdown and support copy-install (AC-05).
Pull requests SHALL validate manifests/dependencies, run meaningful boundary
tests and build the catalog; main SHALL deploy the rebuilt catalog (AC-06).
The release SHALL include dependency-first 1.0.0 tags and install proof with
dependency errors absent in the actual Claude CLI list (AC-07).
The target repository SHALL contain its own instructions and tests before
installation; a real subscribed Codex run SHALL produce a spec and plan there,
with traceable installed package/version and honest model identity (AC-08).
The fixed scenario and quality gate SHALL be identical in repeated baseline and
treatment runs; only duplicated-context loading SHALL change. Actual tokens,
cache, latency, success denominator and unavailable billed USD SHALL be distinct
from estimates; raw run evidence SHALL be retained (AC-09).
WHEN 1.1.0 is installed in a new session, every mandatory requirement SHALL have
an AC; positive and negative behavioral evals SHALL verify the new rule (AC-10).
WHEN a separate stable marketplace is pinned to the reviewed 1.0.0 commit, the
rehearsal SHALL deactivate current, install stable and pass the same smoke gate
without deleting user data or relying on a nonexistent rollback command (AC-11).
The report SHALL distinguish passed checks, failed/unknown criteria and held
submission. No synthetic model results or fabricated billing are permitted
(AC-12).

Exclusions: optional Agent Performance Dashboard, external messaging, paid APIs,
changes to unrelated repositories, and submission while the video hold remains.
