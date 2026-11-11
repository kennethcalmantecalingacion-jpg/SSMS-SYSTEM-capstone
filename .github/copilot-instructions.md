# Repository instructions

- The product is the institution-independent **Student Monitoring System**.
- Follow the active user task and its authorization. Use
  [MASTER_SYSTEM_BUILD_PROMPT.md](../MASTER_SYSTEM_BUILD_PROMPT.md) as the
  authoritative architecture reference.
- Inspect relevant source and supporting requirements before editing. Preserve
  working behavior unless the task requires a change.
- Implement the complete authorized scope, including connected dependencies;
  do not stop for approval between internal stages.
- Test the implementation, fix discovered defects, and update relevant existing
  documentation before reporting results.
- Use synthetic learner data only. Never request or add real learner records
  or credentials.
- Keep secrets out of frontend code, browser storage, build output, and version
  control. Enforce data authorization on the backend, not only through hidden
  UI controls.
- Do not claim unverified behavior is operational, secure, compliant,
  connected, or deployed.
- Do not commit, push, deploy, or change external services without explicit
  user authorization.

## Instruction priority

1. Current explicit user task and authorization.
2. These repository-wide instructions.
3. [MASTER_SYSTEM_BUILD_PROMPT.md](../MASTER_SYSTEM_BUILD_PROMPT.md).
4. Supporting documents for their respective reference topics.

Reconcile older supporting text when it conflicts with the approved current
architecture; retain historical decisions only when clearly labeled as history.
