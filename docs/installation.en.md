# Independent development installation

[Español](installation.md)

Experimental guide: live end-to-end validation with test accounts is pending. Do not replace or modify an existing production installation.

## Requirements

A Google account with Apps Script and authorized external requests; authorized beehiiv subscription-read access and HubSpot contact-read/write access; your own credentials with minimum privileges. Confirm API availability and quotas for your actual plans. No universal free API entitlement is promised. Node.js 22 or later runs offline tests without npm dependencies.

The engine does not create HubSpot properties. Prepare their exact internal names in your test portal:

| Property | Required type/values |
| --- | --- |
| `email` | Standard email property |
| `yaskcode_contact_source` | Text/enumeration accepting beehiiv_newsletter |
| `yaskcode_relationship` | Text/selection accepting newsletter_subscriber; multiple values separated by semicolons |
| `beehiiv_subscription_status` | Text/enumeration: active, pending, inactive, unsubscribed, bounced |
| `beehiiv_subscribed_at` | Date accepting Unix milliseconds at UTC midnight |
| `beehiiv_last_sync` | Date/time accepting UTC ISO 8601 |

Confirm types and options against the portal API before writing. Inspect existing properties rather than blindly recreating them.

## Steps

1. Create a new Apps Script project clearly named development.
2. Copy `integrations/beehiiv-hubspot/apps-script/src/YaskCode_V4.gs`. Retain `DRY_RUN = true`.
3. Show the manifest through project settings and use the included appsscript.json. Its explicit scope allows external requests; it does not install triggers or grant general Drive/mail access.
4. Set Script Properties `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `HUBSPOT_ACCESS_TOKEN` using test-account values. Repository templates are placeholders.
5. Authorize and manually run `sincronizarYaskCodeV4`. Dry-run still reads whatever accounts you configure: use test accounts/data.
6. Review the summary and plan. Only in development, set DRY_RUN to false to test one write; verify CRM state before rerunning.
7. After validation, optionally install one time-driven development trigger for this function every 15 minutes. Do not duplicate triggers. Repository code does not install one.

## Stop and recover

Remove the development trigger to stop scheduled execution. Restoring DRY_RUN prevents writes but continues reads. Inspect CRM after ambiguous writes before retrying. Restoring code does not roll back CRM data; plan data repair separately.

See [clasp](clasp.en.md), [privacy](privacy-consent.en.md), [troubleshooting](troubleshooting.en.md) and [validation status](release-readiness.en.md).

## Official sources

Checked October 16, 2026. Independent validation must still confirm pagination, date types, plan limits and permissions.

- https://developers.beehiiv.com/api-reference/subscriptions/index
- https://developers.beehiiv.com/welcome/pagination
- https://developers.hubspot.com/docs/api-reference/latest/crm/search-the-crm
- https://developers.google.com/apps-script/guides/services/quotas
