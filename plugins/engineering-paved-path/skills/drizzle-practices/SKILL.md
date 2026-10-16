---
name: drizzle-practices
description: "Design Drizzle/PostgreSQL changes with ownership checks, transactions and migration evidence."
---

Inspect the existing schema and migration journal before adding columns. Choose
one migration owner; generate rather than rewrite applied history. Scope SQL by
the resource owner, use bound values, and keep multi-row invariants transactional.
Guard concurrent updates by current revision/head where freshness matters. Use a
real isolated PostgreSQL test for SQL semantics; mocks do not prove constraints.
