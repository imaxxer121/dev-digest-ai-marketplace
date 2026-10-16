---
name: typescript-practices
description: "Design TypeScript contracts and narrow unknown input at repository boundaries."
---

Preserve the repository's strictness and public contract compatibility. Parse
unknown external input before using it; use discriminated unions for states
whose fields differ. Model null, absent and empty deliberately. Keep mirrored
runtime schemas and inferred types aligned. Test a rejected boundary and a
valid caller; run the repository's configured typecheck after changed contracts.
