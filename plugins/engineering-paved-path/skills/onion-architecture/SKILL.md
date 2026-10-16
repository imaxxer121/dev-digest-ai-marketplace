---
name: onion-architecture
description: "Preserve inward dependencies when designing or reviewing service and adapter boundaries."
---

Read the target repository's architecture docs and import conventions. Put
request validation at the boundary, orchestration in services and side effects
behind ports. Keep domain logic independent of database, filesystem and network
adapters. Check the actual import path before reporting a violation; cite the
local rule and code. Do not impose a directory naming scheme on another repo.
