# beehiiv → HubSpot · Apps Script V4

[Español](README.md)

Experimental distributed adaptation of operational source supplied by the maintainer. Offline mocked tests passed; independent live API installation remains pending.

Her operational installation writes at most one change per run on a configured 15-minute schedule. This copy keeps the one-write cap and enables DRY_RUN=true. No secrets, subscriber data or trigger installation are included.

## Behavior

Reads beehiiv states, searches normalized email, creates missing active contacts and updates non-active subscription states for linked CRM contacts. Prioritizes these updates and defers remaining operations. Does not modify native marketing consent, send email or automatically reactivate contacts. Missing records do not imply deletion; inactive does not establish why a subscription ended. Unknown states, duplicates or ambiguous contacts block the batch. Synchronization is not bidirectional.

## Start

Read [installation](../../docs/installation.en.md) and [privacy](../../docs/privacy-consent.en.md). Use an independent test project and accounts. Run `npm run validate` and `npm test` from the repository root with Node.js 22+. Tests require no real credentials. Install with dry-run enabled and review summaries before allowing development writes.

## Limits

20 pages, 500 subscribers and one write per run. These are safeguards, not supported-scale guarantees. Each contact triggers a search; before writing the publication is reread. No persistent cursor, error queue or execution budget exists. Reads have up to three attempts with one/two-second waits; Retry-After is not handled. Reconcile ambiguous writes before retrying.

See [V4 review](../../docs/v4-review.en.md), [clasp](../../docs/clasp.en.md) and [troubleshooting](../../docs/troubleshooting.en.md).
