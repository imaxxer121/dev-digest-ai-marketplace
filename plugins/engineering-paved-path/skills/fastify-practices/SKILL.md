---
name: fastify-practices
description: "Plan or review Fastify routes with scoped validation and service-owned operations."
---

Follow the target server's plugin/container conventions. Validate route params
and bodies before service calls, obtain tenant/workspace identity from the
existing trusted context, and scope lookup before external I/O. Register routes
and response schemas consistently. Distinguish absent, forbidden and invalid
states without leaking another tenant's resources. Test with injected requests.
