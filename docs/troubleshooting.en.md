# Troubleshooting

[Español](troubleshooting.md)

| Symptom | Check |
| --- | --- |
| GitHub 404 | Exact URL, visibility and application access to private repositories |
| Missing secret properties | Configure documented names in development Script Properties, never Git |
| HTTP 401/403 | Credentials, permissions and API plan; never print tokens |
| HTTP 429 | Quotas and wait policy; do not blindly repeat writes |
| Incomplete pages or unknown states | Stop writes and verify API contract with synthetic examples |
| Removal absent from native marketing settings | Imported newsletter state does not change HubSpot native consent |
| YASKCODE_SYNC_FAILED | Generic privacy-preserving failure; check configuration, quotas and connectivity in development; reproduce with synthetic data |

V4 has no persistent error queue or runtime budget. Do not alter production to diagnose the experimental copy. Live installation remains independently unverified.
