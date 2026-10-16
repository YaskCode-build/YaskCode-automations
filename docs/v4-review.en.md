# V4 source review

[Español](v4-review.md)

Static review, October 16, 2026. No production code or trigger was changed.

Two earlier candidates both had DRY_RUN=true, a 20-page and 500-subscriber cap, ScriptLock, complete-pagination checks, normalized email searches, duplicate detection, blocked reactivation and bounded read retries. No embedded credential values or contacts were observed. The earlier candidate blocked more than five planned writes; Etapa6 instead processed a limited batch, prioritizing non-active state updates.

The maintainer subsequently supplied YaskCode_V4.gs, with DRY_RUN=false and MAX_ESCRITURAS=1. Its algorithm follows Etapa6. The 15-minute schedule describes her deployment; the source does not install that trigger.

The distribution keeps the algorithm and one-write cap, enables dry-run, updates stale comments, replaces platform exception propagation with a generic error and rechecks source/relationship linkage before updates. No second write-enabled operational copy is committed.

## Remaining limits

Each contact requires a search, and each write rereads the publication. The write cap does not ensure short execution. Read retry waits are one and two seconds, without Retry-After. There is no time budget, durable work queue or durable reconciliation. Unknown/ambiguous cases block the whole batch and may defer otherwise valid removals. CRM eventual search consistency and ambiguous-write outcomes need live validation. Property types/options and plan-specific API access must be confirmed.

The 14 offline tests use synthetic API adapters. They do not certify live pagination compatibility, plan entitlement, date acceptance or independent installation. See [validation status](release-readiness.en.md).
