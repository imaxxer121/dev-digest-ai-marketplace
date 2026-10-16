# Releases, update and stable rollback

Manifest version is canonical. Publish backwards-compatible capabilities as a
minor release, fixes as a patch, incompatible contract changes as a major.
Validate all four packages, run tests and catalog build before tagging. Release
dependencies first: engineering-paved-path--v1.0.0, research-tools--v1.0.0,
architecture-review--v1.0.0, then sdd-engineering--v1.0.0. Tags are immutable.
From each plugin directory inspect `claude plugin tag --dry-run`, then use the
CLI's reviewed tag operation or push the equivalent exact tag through Git.

To update, publish a reviewed manifest/changelog and the matching tag, refresh
the marketplace, update the plugin and start a new session. Capture the actual
CLI list and active package manifest from that session. A changed source file
or terminal message by itself does not prove a new session loaded the new version.

There is no assumed `plugin rollback` command. Keep a separate stable marketplace
whose source is pinned to the reviewed 1.0.0 commit SHA, with a distinct marketplace
name. Disable the current-channel package and its dependency copies for the test,
install from stable, capture list/manifest evidence, and run the same smoke gate
in a fresh session. Do not erase plugin data, journals or target project work.
Return to the current channel only after recording which versions are active.

For Claude, project-scoped installation isolates the teaching consumer. Codex
CLI may store a package cache per user; use repo config enable flags so this
consumer selects the intended marketplace and does not require changing another
project. Codex and Claude dependency resolution are verified separately.
