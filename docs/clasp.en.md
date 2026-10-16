# Development workflow with clasp

[Español](clasp.md)

1. Install compatible Node.js and @google/clasp; follow the official guide and record the tool version you use.
2. Enable Apps Script API and authenticate locally with `clasp login`.
3. Create an independent development project. Do not select production.
4. From `integrations/beehiiv-hubspot/apps-script/`, create a local `.clasp.json` following `config/clasp.example.json`: use the development ID and rootDir `src`. Never commit it or OAuth credentials such as .clasprc.json.
5. Review `clasp status` and destination before transfer. Only source and manifest should be selected. Push can overwrite remote source; pull can overwrite local source.
6. Configure private test credentials outside Git; authorize minimum permissions.
7. Test without writes before installing a development trigger.

Script Properties templates are not uploaded or applied automatically by clasp. No production deployment or clasp OAuth credentials are configured in Actions.

Official guide, checked October 16, 2026: https://developers.google.com/apps-script/guides/clasp
