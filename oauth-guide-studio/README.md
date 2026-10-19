# AuthPath — OAuth setup guides

AuthPath is a small, dependency-free take-home prototype for developers building AI agents that need users to connect third-party accounts. It helps a developer choose a setup path, estimate effort separately from provider wait time, spot approval gates, and see what needs a human.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm start
```

Open `http://localhost:3000`.

No external service credentials or runtime configuration are required. The app runs as a small Node HTTP server and serves the frontend from `public/`.

## What is included

- **Curated guides:** GitHub, Slack, and Google Drive demonstrate different OAuth setup and release challenges.
- **Search and filters:** Find guides by provider, challenge, or setup difficulty.
- **Custom guide generation:** Enter an unfamiliar app name or public website to get a structured first-pass checklist with discovery links, risk prompts, effort/approval fields, and explicit uncertainty labels.
- **Step checklist:** Mark steps complete; progress is kept in local browser storage.
- **Share/export:** Copy a shareable guide link or export Markdown.
- **Evidence boundaries:** Curated guide sources and validation notes are shown separately from estimates and unverified assumptions.

## Important behavior and limits

The three library guides are source-reviewed examples; the app does not register provider applications, exchange credentials, or submit approval requests.

For an unfamiliar app, AuthPath creates a structured starter plan and links to search results that can help locate the provider's official documentation. These search links are discovery aids, not evidence. The app does not claim that it has crawled the provider site or independently verified facts from search results. It labels provider identity, scope requirements, time estimates, and approval rules as unverified until a developer checks the official source.

The custom guide intentionally leaves complexity, build time, and review wait unknown when the provider requirements have not been checked. This is preferable to inventing a confident-looking estimate. Once the official documentation has been reviewed, developers can use the editable/exported guide as a practical working plan.

Share links encode the generated guide in the URL fragment. They do not use central persistence and can become long. There is no authentication, revocation, analytics, or collaborative editing.

## Product decisions

1. **Show build effort and provider wait separately.** Implementation work and manual review are different dependencies and should not be collapsed into one timeline.
2. **Check managed OAuth first.** If an integration platform already manages the provider app, building a custom provider registration may be unnecessary.
3. **Make human-only steps visible.** Account access, app registration, domain ownership, consent, and approval submission remain explicit developer tasks.
4. **Prefer an honest unknown to a fabricated SLA.** A custom guide starts with unknowns clearly labeled, then points to places where those facts can be verified.
5. **Focus the take-home scope.** Three differentiated guides and a working unfamiliar-app flow demonstrate the core interaction without pretending that a 100-provider directory is complete.

## Sources used by the curated guides

- [Composio managed auth](https://docs.composio.dev/toolkits/managed-auth)
- [GitHub: Creating an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
- [GitHub: Authorizing OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [GitHub: GitHub Apps vs OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps)
- [Slack: Installing with OAuth](https://docs.slack.dev/authentication/installing-with-oauth/)
- [Slack: Marketplace review guide](https://docs.slack.dev/slack-marketplace/slack-marketplace-review-guide/)
- [Slack: App guidelines](https://docs.slack.dev/slack-marketplace/slack-app-guidelines/)
- [Google: Sensitive scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification)
- [Google: Restricted scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)
- [Google: OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)

## Deployment

The included `render.yaml` is a starter manifest for a Node-compatible Render service. Connect the source repository and deploy using `npm start`. The app listens on `0.0.0.0` and honors the host-provided `PORT` value.

## Smoke checks

The following are useful manual checks after starting the app:

1. Open `/` and confirm the library and default GitHub guide render.
2. Open `/api/health` and confirm the response reports `guide-builder-ready`.
3. POST `{"app":"Example CRM"}` to `/api/generate`; confirm the response contains a custom guide, search/discovery links, and `Unverified` validation notes.
4. POST `{"app":"https://example.com"}` to `/api/generate`; confirm the submitted website is retained as a starting point and labeled unverified.
5. Try a curated guide, mark a checklist item complete, copy a share link, and export Markdown.
6. Test mobile widths and keyboard focus order.
