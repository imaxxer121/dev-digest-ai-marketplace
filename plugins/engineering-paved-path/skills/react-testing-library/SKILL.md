---
name: react-testing-library
description: "Verify user-visible React interactions and async states using the target test stack."
---

Test via roles, names and visible results. Cover a successful interaction and
the meaningful failure or stale-state boundary introduced by the change. Mock
external I/O at the existing boundary, not React state internals. Avoid tests
that simply assert implementation wording or component filenames. Await async
transitions and verify controls while a request is pending.
