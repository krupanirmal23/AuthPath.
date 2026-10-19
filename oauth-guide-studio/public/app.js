const SOURCES = {
  composio: { title: 'Managed OAuth apps — Composio', url: 'https://docs.composio.dev/toolkits/managed-auth', supports: 'Explains when Composio maintains the OAuth app, client credentials, and redirect URI, and when custom credentials are needed.', type: 'Official platform docs' },
  githubCreate: { title: 'Creating an OAuth app — GitHub Docs', url: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app', supports: 'Registration flow, required public fields, callback URLs, device flow, and expiring-token setting.', type: 'Official provider docs' },
  githubAuth: { title: 'Authorizing OAuth apps — GitHub Docs', url: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps', supports: 'Authorization flow, token handling, and short-lived token considerations.', type: 'Official provider docs' },
  githubDifferences: { title: 'Differences between GitHub Apps and OAuth apps', url: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps', supports: 'Helps decide whether a GitHub App is a better fit than an OAuth App.', type: 'Official provider docs' },
  githubCallback: { title: 'About the user authorization callback URL — GitHub Docs', url: 'https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/about-the-user-authorization-callback-url', supports: 'Callback URL behavior and current wildcard-matching caveats; note this page is for GitHub Apps, not OAuth Apps.', type: 'Official provider docs' },
  slackOauth: { title: 'Installing via OAuth authorization code flow — Slack', url: 'https://docs.slack.dev/authentication/installing-with-oauth/', supports: 'OAuth v2 installation flow, scopes, redirect, and code exchange.', type: 'Official provider docs' },
  slackDistribution: { title: 'Distributing Slack apps — Slack', url: 'https://api.slack.com/docs/slack-apps-mgmt', supports: 'Distinguishes internal/unlisted distribution from Marketplace listing and public distribution.', type: 'Official provider docs' },
  slackReview: { title: 'Slack Marketplace review guide', url: 'https://docs.slack.dev/slack-marketplace/slack-marketplace-review-guide/', supports: 'Submission prerequisites, automated checks, manual review, and feedback loop.', type: 'Official provider docs' },
  slackGuidelines: { title: 'Slack Marketplace app guidelines', url: 'https://docs.slack.dev/slack-marketplace/slack-app-guidelines/', supports: 'Least-privilege scopes, security requirements, TLS, state parameter, and review expectations.', type: 'Official provider docs' },
  googleSensitive: { title: 'Sensitive scope verification — Google for Developers', url: 'https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification', supports: 'Scope-dependent verification, privacy/domain/branding requirements, sensitive scope timing estimate, and exceptions for testing.', type: 'Official provider docs' },
  googleRestricted: { title: 'Restricted scope verification — Google for Developers', url: 'https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification', supports: 'Additional requirements for restricted scopes, including potential security assessment.', type: 'Official provider docs' },
  googleOverview: { title: 'OAuth 2.0 for Web Server Applications — Google Identity', url: 'https://developers.google.com/identity/protocols/oauth2/web-server', supports: 'Web-server authorization flow, redirect URI configuration, and token exchange.', type: 'Official provider docs' }
};

const BASE_GUIDES = [
  {
    id: 'github', appName: 'GitHub', appUrl: 'https://github.com', provider: 'GitHub', symbol: 'GH', symbolClass: 'symbol-github', category: 'Developer platform', difficulty: 'Low', difficultyReason: 'Registration is direct; the key nuance is choosing the correct GitHub integration type and supporting token expiry.', readiness: 'OAuth flow can be tested without a Marketplace submission', estimatedBuildTime: '2–4 hours', approvalWait: 'No separate provider review wait identified for basic OAuth App registration', confidence: 'High', summary: 'A comparatively direct path for user-authorized GitHub access. Register the app, set a callback, implement the code exchange, and test with least-privilege access.',
    firstDecision: 'Do you truly need a classic OAuth App? GitHub recommends considering a GitHub App where fine-grained repository permissions or app-identity access matter. If using Composio, its managed-auth directory lists GitHub as available; custom credentials may still be required for branding or custom behavior.',
    steps: [
      { title: 'Choose OAuth App vs GitHub App', owner: 'Developer', detail: 'Classic OAuth Apps act on behalf of a user. GitHub Apps support fine-grained permissions and can act as themselves as well as on behalf of a user. Choose based on what the agent needs to do.', estimate: '15–30 min', doneWhen: 'The permission model matches the integration use case.', status: 'Ready to do' },
      { title: 'Register the OAuth App', owner: 'Developer', detail: 'In GitHub Settings → Developer settings → OAuth Apps, create an app and enter a public application name, homepage URL, and authorization callback URL. Do not expose internal URLs or secrets in public fields.', estimate: '10–20 min', doneWhen: 'GitHub issues a client ID and the registration fields are saved.', status: 'Needs human' },
      { title: 'Implement callback and token exchange', owner: 'Shared', detail: 'Redirect to GitHub authorization, validate a CSRF-protecting state value, handle the callback, and exchange the temporary code server-side with the client secret. Do not put the secret in mobile or browser code.', estimate: '1–2 hours', doneWhen: 'A test account completes authorization and the server receives a usable token.', status: 'Ready to do' },
      { title: 'Support token expiry and validate scopes', owner: 'Developer', detail: 'GitHub’s current registration form enables expiring user access tokens by default. Ensure your token-refresh / re-authorization behavior supports your configured choice and request only necessary access.', estimate: '30–90 min', doneWhen: 'Expired access is recovered gracefully and the smallest required access is requested.', status: 'Verify' }
    ],
    blockers: [
      { title: 'Wrong integration type', severity: 'Watch', signal: 'The agent needs repository-level fine-grained permissions or needs to act without a user.', mitigation: 'Compare OAuth Apps with GitHub Apps before registration; the latter may be a better fit.' },
      { title: 'Token expiration breaks long-running agents', severity: 'High', signal: 'The app is configured for expiring user access tokens but the integration assumes a token never expires.', mitigation: 'Test refresh and re-authorization paths before rollout. Keep client secrets on a trusted server.' },
      { title: 'Callback mismatch', severity: 'High', signal: 'The redirect URL sent by the application differs from the registered callback.', mitigation: 'Register the exact callback for each environment and send the intended redirect_uri when multiple callbacks are configured.' }
    ],
    agentCanDo: ['Draft the authorization URL, callback handler, state validation, and token-exchange code.', 'Map each requested GitHub permission to a concrete agent action and recommend a narrower alternative.', 'Review error logs with secrets removed and suggest a fix.'],
    humanMustDo: ['Choose the app type and create the registration inside an authorized GitHub account.', 'Store the client secret in server-side secret management and authorize a real test account.', 'Confirm data access is appropriate for the repositories and organization policies involved.'],
    validationNotes: [
      { claim: 'GitHub OAuth App registration requires a name, homepage URL, and callback URL.', status: 'Verified in official docs', note: 'These fields are described in the official registration guide.' },
      { claim: 'GitHub supports up to 10 callback URLs on its current OAuth App form.', status: 'Verified in official docs', note: 'The current GitHub OAuth App registration docs state up to 10 callback URLs.' },
      { claim: 'A basic OAuth App registration has a provider-wide approval SLA.', status: 'Unverified', note: 'No such approval SLA is stated in the registration guide reviewed. This is not a claim that organizational/security review never applies.' },
      { claim: 'The guide was tested against a real GitHub app and token exchange.', status: 'Unverified', note: 'Documentation was reviewed; no provider app was registered and no credentials or tokens were exchanged for this prototype.' }
    ],
    sources: [SOURCES.githubCreate, SOURCES.githubAuth, SOURCES.githubDifferences, SOURCES.composio],
    estimatedHoursLabel: '2–4 h', approvalLabel: 'No review found', nextAction: 'Confirm whether OAuth App or GitHub App fits your access model, then register a development app and implement the callback.', caveat: 'This is a source-reviewed setup guide, not a completed OAuth test. Registration and token exchange were not attempted. Provider, organization, and security policies can add requirements.'
  },
  {
    id: 'slack', appName: 'Slack', appUrl: 'https://slack.com', provider: 'Slack', symbol: '✳', symbolClass: 'symbol-slack', category: 'Workspace collaboration', difficulty: 'Moderate', difficultyReason: 'The OAuth flow is documented, but app scopes and whether you need unlisted distribution or Marketplace listing change the launch path.', readiness: 'Unlisted distribution and Marketplace listing are different milestones', estimatedBuildTime: '4–8 hours', approvalWait: 'Marketplace review: no reliable public SLA found in docs reviewed', confidence: 'High', summary: 'Good for showing why “OAuth works” is not the same as “public launch approved.” Minimize scopes, complete OAuth v2, and choose the distribution path deliberately.',
    firstDecision: 'Do you need a private/unlisted integration across customer workspaces, or a public Slack Marketplace listing? OAuth installation can be implemented before Marketplace review. Composio also lists Slack as a managed OAuth option for supported toolkit auth.',
    steps: [
      { title: 'Decide distribution path and app shape', owner: 'Developer', detail: 'Create the app in Slack’s developer portal. Decide whether it stays in a development workspace, is distributed unlisted for a pilot, or needs a public Marketplace listing. These are distinct readiness levels.', estimate: '20–45 min', doneWhen: 'The distribution path and the app’s user-facing purpose are documented.', status: 'Needs human' },
      { title: 'Define the smallest useful scope set', owner: 'Shared', detail: 'Choose bot token scopes for app actions and user token scopes only when an operation must run from the authorizing user’s perspective. Tie every scope to a feature that can be demonstrated.', estimate: '30–60 min', doneWhen: 'Each scope has a plain-language justification and a tested feature.', status: 'Ready to do' },
      { title: 'Configure OAuth & Permissions', owner: 'Developer', detail: 'Add exact redirect URLs in the OAuth & Permissions configuration and implement Slack’s OAuth v2 authorization-code flow. Validate the state parameter, handle denial/errors, and exchange the code server-side.', estimate: '1–3 hours', doneWhen: 'A test workspace can install the app and return to the configured callback.', status: 'Needs human' },
      { title: 'Test scope behavior and security', owner: 'Shared', detail: 'Install into a clean test workspace, verify each feature with only its required scopes, use TLS for production endpoints, and protect tokens and signing secrets. Remove test-only or unused scopes.', estimate: '1–2 hours', doneWhen: 'The documented feature set works end-to-end and secrets never appear in logs or client code.', status: 'Verify' },
      { title: 'Prepare review assets if listing publicly', owner: 'Developer', detail: 'Complete the Marketplace listing, provide reviewer access and test credentials where needed, check submission feedback, and respond to any issues. Slack documents automated checks followed by manual review.', estimate: '1–3 hours prep, excluding review', doneWhen: 'The app is submitted with reviewable features and all follow-up requests have an owner.', status: 'Needs human' }
    ],
    blockers: [
      { title: 'Scopes are too broad or hard to justify', severity: 'High', signal: 'You request broad history, admin, user-token, or future-feature access that is not needed for a demoable current feature.', mitigation: 'Reduce scopes to least privilege and explain how each one supports a feature reviewers can test.' },
      { title: 'Marketplace-ready is mistaken for OAuth-ready', severity: 'High', signal: 'OAuth works in your own workspace, but customer distribution, reviewer access, listing details, or automated checks are unfinished.', mitigation: 'Track unlisted installation and Marketplace approval as separate milestones.' },
      { title: 'Security or reviewer access blocks validation', severity: 'Watch', signal: 'Tokens are logged/client-exposed, TLS is absent, or reviewers cannot access the features they must test.', mitigation: 'Secure secrets, use TLS, provide valid test/reviewer access, and test in a clean workspace before submission.' }
    ],
    agentCanDo: ['Map product features to bot/user scopes and draft a least-privilege scope justification.', 'Generate OAuth v2 callback / code-exchange examples and a Marketplace submission checklist.', 'Review public docs and turn reviewer feedback into a remediation checklist.'],
    humanMustDo: ['Create and own the Slack app and choose its distribution path.', 'Authorize installation in a real workspace and provide any reviewer account or test credentials.', 'Submit the Marketplace listing and respond to Slack’s review team.'],
    validationNotes: [
      { claim: 'Slack’s OAuth install flow uses OAuth v2 and scopes affect what the app can access.', status: 'Verified in official docs', note: 'The official OAuth installation guide describes scope selection and authorization-code exchange.' },
      { claim: 'Public Marketplace review includes automated checks and manual review.', status: 'Verified in official docs', note: 'The review guide describes preliminary checks and functional review.' },
      { claim: 'Slack Marketplace review finishes within a specific number of days.', status: 'Unverified', note: 'No reliable time guarantee was found in the official review materials reviewed; timelines can vary with feedback and re-submission.' },
      { claim: 'OAuth and Marketplace submission were exercised end-to-end.', status: 'Unverified', note: 'Documentation was reviewed; no Slack app was created or submitted for review in this prototype.' }
    ],
    sources: [SOURCES.slackOauth, SOURCES.slackDistribution, SOURCES.slackReview, SOURCES.slackGuidelines, SOURCES.composio],
    estimatedHoursLabel: '4–8 h', approvalLabel: 'SLA not published', nextAction: 'Decide whether unlisted distribution is enough. Then prune scopes, finish OAuth v2, and test a clean workspace before considering Marketplace review.', caveat: 'Effort is an estimate for implementation and preparation. Marketplace wait time is intentionally left unknown because a dependable SLA was not found in reviewed official docs.'
  },
  {
    id: 'google-drive', appName: 'Google Drive', appUrl: 'https://drive.google.com', provider: 'Google APIs', symbol: '▰', symbolClass: 'symbol-drive', category: 'Files & productivity', difficulty: 'High', difficultyReason: 'The required scopes determine the review path. Public access to sensitive or restricted data can require verification, domain ownership, privacy disclosures, and potentially a security assessment.', readiness: 'Prototype may be quick; public production can require scope-specific verification', estimatedBuildTime: '4–10 hours + compliance prep', approvalWait: 'Sensitive-scope verification typically 3–5 business days; more complex reviews may take longer', confidence: 'High', summary: 'The most review-sensitive path of this sample. Start from the exact Drive actions the agent must perform, choose the narrowest scopes, and classify each scope before estimating public launch.',
    firstDecision: 'Which Drive actions does the agent actually need? Scopes determine review obligations. Composio lists managed OAuth for Google Drive, which may avoid creating a provider app for a supported toolkit, but custom scopes or consent branding may require your own configuration.',
    steps: [
      { title: 'Map features to exact Drive scopes', owner: 'Shared', detail: 'List every Drive operation the agent needs, then use Google’s scope and API reference docs to select the narrowest permission. Do not request broad read/write access “just in case.”', estimate: '45–90 min', doneWhen: 'Every intended API operation maps to a minimal scope and a visible product feature.', status: 'Ready to do' },
      { title: 'Create a Cloud project and OAuth client', owner: 'Developer', detail: 'Enable the required Drive API, configure the OAuth consent screen and client, set redirect URIs, and keep client secrets on a trusted server. Separate test and production projects when appropriate.', estimate: '45–120 min', doneWhen: 'A test user can authorize the development client and the callback completes.', status: 'Needs human' },
      { title: 'Prepare public app identity and privacy disclosures', owner: 'Developer', detail: 'For brand verification, prepare a publicly accessible homepage, a privacy policy on the same domain as the homepage, app name/logo, support email, developer contact, and verified authorized domains.', estimate: '1–4 hours if assets exist; longer if they do not', doneWhen: 'The app identity and privacy policy accurately describe how Google user data is accessed, used, stored, and shared.', status: 'Needs human' },
      { title: 'Classify the scopes and confirm review path', owner: 'Shared', detail: 'Check the Google Cloud Data Access page for non-sensitive, sensitive, and restricted scope classification. Testing/staging and certain limited-use cases can have exceptions, but verify the exact case instead of assuming.', estimate: '30–90 min', doneWhen: 'The review requirement and any exception are documented for the exact client and scope set.', status: 'Verify' },
      { title: 'Submit verification if required', owner: 'Developer', detail: 'For sensitive scopes, prepare per-scope justification and a demonstration video. Restricted scopes may trigger additional requirements and a third-party security assessment depending on the app/data path. Track requests in the Verification Center.', estimate: '2–6 hours preparation, excluding assessment work', doneWhen: 'The appropriate verification request is submitted and follow-up emails have an owner.', status: 'Needs human' }
    ],
    blockers: [
      { title: 'A requested scope triggers review', severity: 'Critical', signal: 'The Cloud Console identifies one or more sensitive or restricted scopes.', mitigation: 'Reduce scope breadth if possible; document why each remaining scope is necessary and plan for verification before public launch.' },
      { title: 'Homepage, privacy policy, or domain is not review-ready', severity: 'High', signal: 'A policy link is missing, not publicly accessible, on a different domain, or does not accurately explain Google data use.', mitigation: 'Publish accurate, public documentation on the same domain as the homepage and verify domain ownership in the appropriate Google tools.' },
      { title: 'A limited testing setup is mistaken for production readiness', severity: 'High', signal: 'The app works for listed test users but is still in Testing or shows unverified-app warnings/limits.', mitigation: 'Record test-mode limitations and complete the appropriate production verification path before opening access broadly.' }
    ],
    agentCanDo: ['Map requested Drive operations to candidate scopes and flag potentially sensitive/restricted permissions for verification.', 'Draft a privacy-policy checklist, per-scope rationale, reviewer walkthrough, and demo-video script.', 'Estimate preparation work separately from provider-controlled review and third-party assessment time.'],
    humanMustDo: ['Own the Google Cloud project, register OAuth clients, verify domains, and maintain app contact details.', 'Confirm actual scope classifications in the Cloud Console and ensure the product complies with Google API data policies.', 'Record the real user flow for review, submit the verification request, and answer Trust & Safety follow-ups.'],
    validationNotes: [
      { claim: 'Google verification depends substantially on what data and scopes the app requests.', status: 'Verified in official docs', note: 'Google’s verification guide makes the user-data type and scope breadth key criteria.' },
      { claim: 'Sensitive scope verification typically takes 3–5 business days.', status: 'Verified in official docs', note: 'Google states this typical window; it is not a guarantee and does not include preparation, rework, or every restricted-scope security assessment.' },
      { claim: 'Testing/staging always requires public verification.', status: 'Not applicable', note: 'Google documents testing/staging exceptions, but test-user limitations can remain. Confirm the project’s exact use case.' },
      { claim: 'Restricted-scope security assessment is always required.', status: 'Not applicable', note: 'Additional assessment depends on applicable restricted-scope requirements and how the app accesses/transmits the data.' },
      { claim: 'Drive OAuth verification was submitted or exercised with a live Cloud project.', status: 'Unverified', note: 'Documentation only; no Cloud project, OAuth client, test account, or verification request was created for this prototype.' }
    ],
    sources: [SOURCES.googleSensitive, SOURCES.googleRestricted, SOURCES.googleOverview, SOURCES.composio],
    estimatedHoursLabel: '4–10 h + prep', approvalLabel: '3–5 business days*', nextAction: 'Write down the exact Drive operations and scopes first. Check each scope in Google Cloud, then decide whether you need a test-only setup or public verification.', caveat: '*Google calls 3–5 business days typical for sensitive-scope verification. Preparation, follow-ups, restricted-scope assessment, or changes can add time. Not every Drive use case triggers the same review path.'
  }
];

let guides = [...BASE_GUIDES];
let selectedId = 'github';
let activeFilter = 'All';
let searchTerm = '';
let activeGuide = BASE_GUIDES[0];
let guideMode = 'seed';
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const esc = (value = '') => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeUrl = (value) => { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; } };
const initials = (g) => g.symbol || (g.appName || '?').trim().charAt(0).toUpperCase();
const difficultyClass = (d) => ({Low:'pill-low',Moderate:'pill-moderate',High:'pill-high',Unknown:'pill-unknown'})[d] || 'pill-unknown';
const difficultyWidth = (d) => ({Low:35,Moderate:62,High:88,Unknown:20})[d] || 20;

function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
function modeBadge() {
  const dot = $('#modeDot'); const txt = $('#modeText');
  dot.classList.add('live');
  txt.textContent = 'Guide builder ready';
}
async function checkMode() {
  try { await fetch('/api/health'); } catch {}
  modeBadge();
}

function renderCards() {
  const list = guides.filter(g => {
    const matchesFilter = activeFilter === 'All' || g.difficulty === activeFilter;
    const haystack = `${g.appName} ${g.category} ${g.summary} ${g.difficultyReason} ${g.approvalWait}`.toLowerCase();
    return matchesFilter && haystack.includes(searchTerm.toLowerCase());
  });
  $('#guideGrid').innerHTML = list.map((g) => `
    <button type="button" class="guide-card ${g.id === selectedId ? 'selected' : ''}" data-guide-id="${esc(g.id)}" aria-pressed="${g.id === selectedId}">
      <div class="card-top"><span class="app-symbol ${esc(g.symbolClass || 'symbol-custom')}">${esc(initials(g))}</span><span class="difficulty-pill ${difficultyClass(g.difficulty)}">${esc(g.difficulty)} effort</span></div>
      <h3>${esc(g.appName)}</h3><div class="card-subtitle">${esc(g.category || g.provider || 'Custom provider')}</div>
      <p class="card-summary">${esc(g.summary)}</p>
      <div class="card-metrics"><div class="card-metric"><b>${esc(g.estimatedHoursLabel || g.estimatedBuildTime || 'Unknown')}</b><span>Build work</span></div><div class="card-metric"><b>${esc(g.approvalLabel || g.approvalWait || 'Unknown')}</b><span>Approval wait</span></div></div>
      <div class="card-footer"><span class="card-open-label">Open setup guide</span><span class="card-selected-label">Currently selected</span><span class="card-arrow" aria-hidden="true">→</span></div>
    </button>`).join('');
  $('#emptyState').hidden = list.length > 0;
  $('#guideGrid').querySelectorAll('[data-guide-id]').forEach(btn => btn.addEventListener('click', () => selectGuide(btn.dataset.guideId, true)));
}

function decisionText(guide) {
  if (guide.firstDecision) return guide.firstDecision;
  return 'First confirm whether your auth platform offers a managed OAuth app for this toolkit. Custom credentials are usually needed for consent-screen branding, custom scopes, or separate quotas.';
}
function renderSteps(guide) {
  const completed = getCompleted(guide);
  const steps = guide.steps || [];
  const readyCount = steps.filter((step, index) => completed.includes(index)).length;
  return `<div class="detail-panel steps-panel"><div class="panel-heading"><h3>Setup path</h3><span class="panel-meta">${readyCount} / ${steps.length} CHECKED OFF</span></div><ol class="steps-list">${steps.map((step, i) => {
    const checked = completed.includes(i);
    const ownerClass = step.owner === 'Agent' ? 'owner-agent' : step.owner === 'Developer' ? 'owner-human' : '';
    return `<li class="step-item"><button class="step-check ${checked?'checked':''}" type="button" aria-label="${checked?'Mark incomplete':'Mark complete'}: ${esc(step.title)}" data-step="${i}" data-guide="${esc(guide.id)}">${checked?'✓':''}</button><div class="step-main"><div class="step-title-row"><div class="step-title ${checked?'completed':''}">${esc(step.title)}</div><span class="owner-pill ${ownerClass}">${esc(step.owner || 'Shared')}</span></div><p class="step-detail">${esc(step.detail)}</p><div class="step-foot"><span>Effort: ${esc(step.estimate || 'Unestimated')}</span><span class="step-estimate">${esc(step.status || 'Planned')}</span></div>${step.doneWhen?`<div class="done-when"><b>Done when:</b> ${esc(step.doneWhen)}</div>`:''}</div></li>`;
  }).join('')}</ol></div>`;
}
function getCompleted(guide) {
  try { return JSON.parse(localStorage.getItem(`authpath:${guide.id}:steps`) || '[]'); } catch { return []; }
}
function bindChecklist() {
  document.querySelectorAll('[data-step][data-guide]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.guide; const index = Number(btn.dataset.step); const guide = guides.find(g => g.id === id); if (!guide) return;
    let completed = getCompleted(guide);
    completed = completed.includes(index) ? completed.filter(n => n !== index) : [...completed, index];
    try { localStorage.setItem(`authpath:${guide.id}:steps`, JSON.stringify(completed)); } catch {}
    renderDetail(guide); renderCards();
  }));
}
function renderBlockers(guide) {
  const blockers = guide.blockers || [];
  if (!blockers.length) return `<div class="detail-panel"><div class="panel-heading"><h3>Potential blockers</h3><span class="panel-meta">NEEDS REVIEW</span></div><div class="blocker-list"><div class="blocker"><span class="severity-dot severity-Watch"></span><div><h4>Provider-specific nuance</h4><p>No blockers were found in the preliminary pass.</p><small><b>Next:</b> Verify the official documentation and test the provider flow.</small></div></div></div></div>`;
  return `<div class="detail-panel"><div class="panel-heading"><h3>Potential blockers</h3><span class="panel-meta">WATCH BEFORE LAUNCH</span></div><div class="blocker-list">${blockers.map(b => `<div class="blocker"><span class="severity-dot severity-${esc(b.severity || 'Watch')}"></span><div><h4>${esc(b.title)}</h4><p><b>Signal:</b> ${esc(b.signal)}</p><small><b>Mitigation:</b> ${esc(b.mitigation)}</small></div></div>`).join('')}</div></div>`;
}
function renderCapabilities(title, items, human = false) {
  const list = items?.length ? items : ['No specific actions are documented yet; inspect the sources and confirm with the provider.'];
  return `<div class="capability-panel"><div class="capability-heading"><span class="capability-icon ${human?'human':''}">${human?'♙':'✳'}</span>${esc(title)}</div><ul class="capability-list">${list.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></div>`;
}
function renderEvidence(guide) {
  const notes = guide.validationNotes || [];
  const statusClass = (s) => s === 'Verified in official docs' ? '' : s === 'Likely' ? 'likely' : (s === 'Unverified' ? 'unverified' : '');
  const validationHTML = `<div class="evidence-panel"><div class="panel-heading"><h3>What we checked</h3><span class="panel-meta">EVIDENCE NOTES</span></div>${notes.map(n=>`<div class="evidence-row"><div class="evidence-status ${statusClass(n.status)}">${esc(n.status)}</div><div><div class="evidence-claim">${esc(n.claim)}</div><div class="evidence-note">${esc(n.note)}</div></div></div>`).join('')}</div>`;
  const sources = (guide.sources || []).filter(s => safeUrl(s.url) !== '#');
  const sourcesHTML = `<div class="evidence-panel"><div class="panel-heading"><h3>Sources</h3><span class="panel-meta">${String(sources.length).padStart(2,'0')} LINKS</span></div><div class="source-list">${sources.map((s, i)=>`<div class="source-item"><span class="source-number">${String(i+1).padStart(2,'0')}</span><div><a class="source-title" href="${esc(safeUrl(s.url))}" target="_blank" rel="noreferrer">${esc(s.title)} ↗</a><a class="source-url" href="${esc(safeUrl(s.url))}" target="_blank" rel="noreferrer">${esc(s.url)}</a><div class="source-support">${esc(s.supports || '')}</div><span class="source-type">${esc(s.type || 'Source')}</span></div></div>`).join('') || '<div class="source-item">No validated sources returned. Do not rely on this guide until sources are added.</div>'}</div></div>`;
  return validationHTML + sourcesHTML;
}
function renderDetail(guide) {
  activeGuide = guide;
  guideMode = guide.mode || 'seed';
  const index = BASE_GUIDES.findIndex(g => g.id === guide.id);
  $('#detailIndex').textContent = index >= 0 ? `${String(index+1).padStart(2,'0')} / ${String(BASE_GUIDES.length).padStart(2,'0')}` : 'CUSTOM GUIDE';
  const confidence = guide.confidence || 'Preliminary';
  const confidenceCopy = confidence === 'High' ? 'Official docs support the key requirements. Setup was not executed here.' : confidence === 'Medium' ? 'Some steps depend on your app type or requested scopes.' : 'Provider-specific requirements have not been verified. Use the discovery links before relying on estimates.';
  const generatedMeta = guide.mode === 'draft' ? `Starter guide created ${guide.generatedAt ? new Date(guide.generatedAt).toLocaleString() : 'just now'}` : guide.mode === 'shared' ? 'Shared guide' : `Source-reviewed example · ${guide.provider || 'provider docs'}`;
  const buildEstimate = guide.estimatedHoursLabel || guide.estimatedBuildTime || 'Unknown';
  const approvalEstimate = guide.approvalLabel || guide.approvalWait || 'Unknown';
  const sourceCount = (guide.sources || []).length;
  $('#guideDetail').innerHTML = `
    <div class="guide-head"><div><div class="guide-title-row"><span class="app-symbol ${esc(guide.symbolClass || 'symbol-custom')}">${esc(initials(guide))}</span><div><h2>${esc(guide.appName)}</h2><div class="guide-title-meta">${esc(guide.category || guide.provider || 'OAuth provider')} · ${guide.appUrl ? `<a href="${esc(safeUrl(guide.appUrl))}" target="_blank" rel="noreferrer">${esc(guide.appUrl)} ↗</a>` : 'Website not confirmed'}</div></div></div><p class="guide-summary">${esc(guide.summary || '')}</p></div><div class="guide-head-side"><span class="review-state">${esc(guide.readiness || 'Setup guide')}</span><div class="confidence-note"><b>${esc(confidence)} confidence</b><br>${esc(confidenceCopy)}<br>${esc(generatedMeta)}</div></div></div>
    <div class="metrics-strip"><div class="metric-block"><div class="metric-label">Setup complexity</div><div class="metric-value"><span class="difficulty-pill ${difficultyClass(guide.difficulty)}">${esc(guide.difficulty || 'Unknown')}</span></div><div class="metric-detail">${esc(guide.difficultyReason || 'Unknown provider-specific effort.')}</div></div><div class="metric-block"><div class="metric-label">Build effort</div><div class="metric-value">${esc(buildEstimate)}</div><div class="metric-detail">Implementation / preparation estimate, not provider wait.</div></div><div class="metric-block"><div class="metric-label">Approval wait</div><div class="metric-value">${esc(approvalEstimate)}</div><div class="metric-detail">Applies only to the stated path; follow-ups may add time.</div></div><div class="metric-block"><div class="metric-label">Source links</div><div class="metric-value">${String(sourceCount).padStart(2,'0')}</div><div class="metric-detail">Open sources to verify the assumptions that matter.</div></div></div>
    <div class="first-decision"><div class="decision-icon">↳</div><div class="decision-copy"><strong>Before you create an app</strong><p>${esc(decisionText(guide))}</p></div></div>
    <div class="detail-columns">${renderSteps(guide)}<div class="right-stack">${renderBlockers(guide)}</div></div>
    <div class="capability-columns">${renderCapabilities('What the agent can do', guide.agentCanDo, false)}${renderCapabilities('Where you take over', guide.humanMustDo, true)}</div>
    <div class="evidence-section">${renderEvidence(guide)}</div>
    <div class="caveat-box"><span class="warning-icon">⚠</span><div><strong>Evidence boundary</strong><p>${esc(guide.caveat || 'Estimates are directional. Confirm critical requirements with the provider before launch.')}</p></div></div>
    <div class="next-action"><div><div class="next-action-label">RECOMMENDED NEXT ACTION</div><h3>${esc(guide.nextAction || 'Verify requirements and choose a setup path.')}</h3><p>Use the linked sources as the source of truth. Do not share client secrets, refresh tokens, or private account data with the research agent.</p></div><button class="next-action-button" id="nextActionButton" type="button">Copy next action ↗</button></div>`;
  bindChecklist();
  $('#nextActionButton')?.addEventListener('click', () => copyText(guide.nextAction || 'Verify provider requirements.'));
}
function selectGuide(id, scroll = false) {
  const found = guides.find(g => g.id === id); if (!found) return;
  selectedId = id; activeGuide = found; renderCards(); renderDetail(found);
  if (found.mode === 'draft' || found.mode === 'live' || found.mode === 'scaffold' || found.mode === 'shared') {
    // Keep the generated result shareable in the URL after selection.
    updateHashForGuide(found, false);
  } else {
    history.replaceState(null, '', `${location.pathname}${location.search}#guide=${encodeURIComponent(found.id)}`);
  }
  if (scroll) $('#guideDetailSection').scrollIntoView({behavior:'smooth', block:'start'});
}
function tokenFromGuide(guide) {
  const json = JSON.stringify(guide);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function guideFromToken(token) {
  const b64 = token.replace(/-/g,'+').replace(/_/g,'/');
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}
function updateHashForGuide(guide, replace = true) {
  const token = tokenFromGuide(guide);
  const hash = `#shared=${token}`;
  if (replace) history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
  else history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
}
function loadFromHash() {
  const raw = location.hash.slice(1);
  const params = new URLSearchParams(raw);
  const shared = params.get('shared');
  if (shared) {
    try {
      const sharedGuide = guideFromToken(shared);
      sharedGuide.mode = sharedGuide.mode || 'shared';
      if (!sharedGuide.id) sharedGuide.id = `shared-${Date.now()}`;
      sharedGuide.symbolClass = sharedGuide.symbolClass || 'symbol-custom';
      guides = [...BASE_GUIDES.filter(g => g.id !== sharedGuide.id), sharedGuide];
      selectedId = sharedGuide.id;
      return sharedGuide;
    } catch { showToast('That shared guide link could not be opened. Showing the library instead.'); }
  }
  const guideId = params.get('guide') || 'github';
  selectedId = BASE_GUIDES.some(g=>g.id===guideId) ? guideId : 'github';
  return guides.find(g => g.id === selectedId) || BASE_GUIDES[0];
}
function exportMarkdown(guide) {
  const out = [`# ${guide.appName} — OAuth setup guide`, '', `- Provider: ${guide.provider || guide.appName}`, `- Website: ${guide.appUrl || ''}`, `- Difficulty: ${guide.difficulty || 'Unknown'}`, `- Build estimate: ${guide.estimatedHoursLabel || guide.estimatedBuildTime || 'Unknown'}`, `- Approval wait: ${guide.approvalLabel || guide.approvalWait || 'Unknown'}`, `- Confidence: ${guide.confidence || 'Preliminary'}`, '', '## Summary', guide.summary || '', '', '## First decision', decisionText(guide), '', '## Setup path'];
  (guide.steps || []).forEach((s,i)=>out.push('', `### ${i+1}. ${s.title}`, `- Owner: ${s.owner}`, `- Estimate: ${s.estimate || 'Unknown'}`, `- Detail: ${s.detail}`, `- Done when: ${s.doneWhen || 'Not specified'}`, `- Status: ${s.status || 'Planned'}`));
  out.push('', '## Potential blockers');
  (guide.blockers || []).forEach(b=>out.push('', `### ${b.title} (${b.severity || 'Watch'})`, `- Signal: ${b.signal}`, `- Mitigation: ${b.mitigation}`));
  out.push('', '## What the agent can do'); (guide.agentCanDo || []).forEach(x=>out.push(`- ${x}`));
  out.push('', '## Where a human must take over'); (guide.humanMustDo || []).forEach(x=>out.push(`- ${x}`));
  out.push('', '## Validation notes'); (guide.validationNotes || []).forEach(n=>out.push('', `### ${n.claim}`, `- Status: ${n.status}`, `- Note: ${n.note}`));
  out.push('', '## Sources'); (guide.sources || []).forEach(s=>out.push(`- [${s.title}](${s.url}) — ${s.supports}`));
  out.push('', '## Recommended next action', guide.nextAction || '', '', '## Caveat', guide.caveat || '', '', '_Generated by AuthPath. Verify critical requirements with the provider._');
  return out.join('\n');
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); showToast('Copied to clipboard.'); }
  catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); showToast(ok ? 'Copied to clipboard.' : 'Copy failed. Use Export guide instead.'); }
}
function downloadMarkdown(guide) {
  const blob = new Blob([exportMarkdown(guide)], {type:'text/markdown;charset=utf-8'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  const slug = (guide.appName || 'oauth-guide').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'oauth-guide';
  a.href = url; a.download = `${slug}-oauth-guide.md`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  showToast('Markdown guide exported.');
}

let loading = false;
async function investigateApp(event) {
  event.preventDefault();
  if (loading) return;
  const input = $('#appInput').value.trim();
  if (!input) return;

  // Reuse a curated guide when the submitted app is already in the library.
  const normalizedInput = input.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
  const curated = BASE_GUIDES.find(guide => {
    const name = guide.appName.toLowerCase();
    const host = guide.appUrl ? new URL(guide.appUrl).hostname.replace(/^www\./, '') : '';
    return normalizedInput === name || normalizedInput === host || normalizedInput === host.replace(/^www\./, '');
  });
  if (curated) {
    selectGuide(curated.id, true);
    showToast(`Opened the curated ${curated.appName} guide.`);
    return;
  }

  loading = true;
  const button = $('#generateButton');
  button.disabled = true;
  $('#formError').hidden = true;
  $('#researchProgress').hidden = false;
  $('#progressTitle').textContent = 'Building your starter guide…';
  $('#progressPercent').textContent = 'WORKING';
  $('#progressBar').classList.add('indeterminate');
  $('#progressBar').style.width = '34%';
  $('#progressSpinner').style.animationPlayState = 'running';
  $('#researchHint').textContent = 'Organizing setup steps, human handoffs, and links to help you verify provider requirements.';

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app: input })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    const guide = data.guide;
    if (!guide || !guide.appName) throw new Error('No guide was returned. Please try again.');
    guide.id = guide.id || `generated-${Date.now()}`;
    guide.symbol = guide.symbol || guide.appName.trim().slice(0, 2).toUpperCase();
    guide.symbolClass = guide.symbolClass || 'symbol-custom';
    guide.category = guide.category || guide.provider || 'Custom provider';
    guide.mode = 'draft';
    guides = [...guides.filter(g => g.id !== guide.id), guide];
    selectedId = guide.id;
    $('#progressTitle').textContent = 'Your starter guide is ready.';
    $('#progressPercent').textContent = 'DONE';
    $('#progressBar').classList.remove('indeterminate');
    $('#progressBar').style.width = '100%';
    $('#progressSpinner').style.animationPlayState = 'paused';
    $('#researchHint').textContent = 'Open the discovery links and confirm high-impact requirements before implementation. Unknown details remain marked as unverified.';
    renderCards();
    renderDetail(guide);
    updateHashForGuide(guide);
    window.setTimeout(() => $('#guideDetailSection').scrollIntoView({ behavior: 'smooth', block: 'start' }), 130);
    showToast('Starter guide created. Provider checks are marked clearly.');
  } catch (error) {
    $('#formError').textContent = error.message || 'Could not create the guide. Try again.';
    $('#formError').hidden = false;
    $('#progressTitle').textContent = 'Guide could not be created.';
    $('#progressPercent').textContent = 'ERROR';
    $('#progressBar').classList.remove('indeterminate');
    $('#progressBar').style.width = '100%';
    $('#progressBar').style.background = 'var(--orange)';
    showToast('Guide creation failed. See the message above.');
  } finally {
    loading = false;
    button.disabled = false;
    window.setTimeout(() => {
      if (!loading) {
        $('#researchProgress').hidden = true;
        $('#progressBar').style.background = 'var(--green)';
        $('#progressBar').classList.remove('indeterminate');
        $('#progressBar').style.width = '0';
      }
    }, 2200);
  }
}

function init() {
  checkMode();
  activeGuide = loadFromHash();
  renderCards(); renderDetail(activeGuide);
  $('#researchForm').addEventListener('submit', investigateApp);
  document.querySelectorAll('[data-quick-app]').forEach(btn => btn.addEventListener('click', () => {
    $('#appInput').value = btn.dataset.quickApp;
    $('#researchForm').requestSubmit();
  }));
  $('#librarySearch').addEventListener('input', e=>{searchTerm=e.target.value;renderCards();});
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    activeFilter=btn.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b=>{
      const active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    renderCards();
  }));
  $('#copyShareButton').addEventListener('click',async()=>{
    const guide = activeGuide;
    if (guide.mode === 'draft' || guide.mode === 'live' || guide.mode === 'scaffold' || guide.mode === 'shared') updateHashForGuide(guide);
    else history.replaceState(null,'',`${location.pathname}${location.search}#guide=${encodeURIComponent(guide.id)}`);
    await copyText(location.href);
  });
  $('#exportButton').addEventListener('click',()=>downloadMarkdown(activeGuide));
  window.addEventListener('hashchange',()=>{ const guide=loadFromHash(); renderCards(); renderDetail(guide); });
}
init();
