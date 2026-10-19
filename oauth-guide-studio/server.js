const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 3000);
const MAX_BODY = 20_000;

function send(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_BODY) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(new Error('Body must be valid JSON')); }
    });
    req.on('error', reject);
  });
}

function normalizeAppUrl(raw) {
  let candidate = String(raw || '').trim();
  if (!candidate) return '';
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  let parsed;
  try { parsed = new URL(candidate); }
  catch { throw new Error('Enter an app name or a valid public website, such as example.com.'); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error('Use a public website without embedded credentials.');
  }
  if (!parsed.hostname.includes('.') || parsed.hostname.length > 253 || parsed.hostname.includes(' ')) {
    throw new Error('Enter an app name or a valid public website, such as example.com.');
  }
  return parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname);
}

function looksLikeWebsite(input) {
  return /^https?:\/\//i.test(input) || /^(www\.)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(input);
}

function appNameFromInput(input, appUrl) {
  if (!looksLikeWebsite(input)) return input.trim().slice(0, 80);
  if (!appUrl) return input.trim().slice(0, 80);
  const host = new URL(appUrl).hostname.replace(/^www\./, '');
  const first = host.split('.')[0] || host;
  return first.replace(/[-_]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()).slice(0, 80);
}

function discoveryUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

// This generator deliberately creates a transparent research brief, not fabricated provider research.
// Provider-specific facts remain unknown until a developer checks the linked discovery results.
function createGuide(input) {
  const isWebsite = looksLikeWebsite(input.trim());
  const appUrl = isWebsite ? normalizeAppUrl(input) : '';
  const appName = appNameFromInput(input, appUrl);
  const id = `custom-${appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'app'}-${Date.now().toString(36)}`;
  const query = `${appName} official developer documentation OAuth authorization app registration redirect URI scopes review`;
  const registrationQuery = `${appName} official OAuth app registration developer console API permissions`;
  const sources = [];
  if (appUrl) {
    sources.push({
      title: 'Website supplied for investigation',
      url: appUrl,
      supports: 'Starting point supplied by you. This site has not been verified as the official developer portal or OAuth documentation.',
      type: 'Starting point — not verified'
    });
  }
  sources.push(
    { title: `Find official OAuth documentation for ${appName}`, url: discoveryUrl(query), supports: 'Discovery search only. Open the provider-owned documentation and verify requirements before relying on them.', type: 'Discovery link — not evidence' },
    { title: `Find ${appName} app registration requirements`, url: discoveryUrl(registrationQuery), supports: 'Discovery search only. Use the result to locate the official developer console, app registration rules, and review requirements.', type: 'Discovery link — not evidence' },
    { title: 'Managed OAuth options — Composio', url: 'https://docs.composio.dev/toolkits/managed-auth', supports: 'Check whether an existing managed connection path can remove the need to register a provider-owned OAuth app.', type: 'Official platform docs' }
  );

  return {
    id,
    appName,
    appUrl,
    provider: appUrl ? new URL(appUrl).hostname : 'Provider identity not confirmed',
    symbol: appName.trim().slice(0, 2).toUpperCase() || '?',
    symbolClass: 'symbol-custom',
    category: 'Custom integration',
    difficulty: 'Unknown',
    difficultyReason: 'This starter guide does not assume provider requirements. Confirm the registration flow, requested scopes, and review gates before estimating the work.',
    readiness: 'Starter guide · provider checks pending',
    estimatedBuildTime: 'Estimate after documentation review',
    estimatedHoursLabel: 'To be confirmed',
    approvalWait: 'Not established. Check whether your scopes or distribution plan trigger review.',
    approvalLabel: 'Not established',
    confidence: 'Preliminary',
    summary: `A first-pass OAuth setup plan for ${appName}. Start by confirming the official developer documentation and whether you need your own OAuth application or can use a managed connection. Provider-specific requirements and timelines remain unverified.`,
    firstDecision: 'Before registering anything, check whether your integration platform already provides managed OAuth for this provider. If you need your own app, confirm the exact scopes, redirect URI rules, and launch/review path from official documentation.',
    steps: [
      { title: 'Confirm the official developer portal', owner: 'Developer', detail: `Open the starting website if one was provided, then use the discovery links to find the provider-owned OAuth or API documentation. Make sure the documentation matches the product and account type you intend to connect.`, estimate: '10–30 min', doneWhen: 'You have an official OAuth setup page and know which provider account is needed.', status: 'Needs human' },
      { title: 'Choose managed OAuth or your own app', owner: 'Shared', detail: 'Check whether an integration platform already operates the OAuth app. If using your own app, record the registration requirements, allowed callback URLs, and environment restrictions.', estimate: '15–45 min', doneWhen: 'The chosen setup path and required registration fields are documented.', status: 'Verify' },
      { title: 'Map permissions and approval gates', owner: 'Developer', detail: 'List the exact actions your AI agent needs. Match each action to the narrowest available scope, then check which scopes require verification, admin consent, security review, or marketplace approval.', estimate: '30–90 min', doneWhen: 'The minimum scope set and any review requirements are backed by official source links.', status: 'Verify' },
      { title: 'Plan a secure authorization flow', owner: 'Shared', detail: 'Confirm the provider’s recommended OAuth flow, exact redirect URI, state validation, PKCE support, token storage rules, expiry behavior, and revocation handling. Keep confidential credentials on a trusted server.', estimate: '30–90 min planning', doneWhen: 'The callback and token-handling design matches the provider’s current documentation.', status: 'Ready to do' },
      { title: 'Register, test, then prepare for launch', owner: 'Developer', detail: 'Create the application in the provider’s console, test with a permitted account and least-privilege scopes, then complete any branding, domain, privacy, security, or distribution checks that apply.', estimate: 'Provider-dependent', doneWhen: 'A test connection succeeds and every launch requirement has an owner and evidence link.', status: 'Needs human' }
    ],
    blockers: [
      { title: 'The supplied site may not be the developer portal', severity: 'High', signal: 'You cannot find official OAuth/API documentation or the domain does not match the provider’s product.', mitigation: 'Verify the official domain before creating an app or entering account details.' },
      { title: 'Scope choices may trigger extra review', severity: 'High', signal: 'The requested data is sensitive, restricted, administrative, or broadly exposes user/workspace content.', mitigation: 'Start with the smallest scope set and confirm every scope’s verification requirements from official documentation.' },
      { title: 'Provider approval timing is unknown', severity: 'Watch', signal: 'The launch depends on marketplace listing, publisher verification, security assessment, or manual review.', mitigation: 'Look for an official SLA; if none is published, treat review duration as an open dependency rather than promising a date.' }
    ],
    agentCanDo: [
      'Turn your use case into a checklist of questions to answer in the provider documentation.',
      'Organize discovered source links and record which claims are still unverified.',
      'Draft the callback, scope, and review plan once the provider’s official flow is confirmed.'
    ],
    humanMustDo: [
      'Confirm the provider’s identity and open the official documentation linked from the discovery searches.',
      'Sign in to the provider console, register the app, accept terms, and complete any domain or organization checks.',
      'Authorize a real test account, protect credentials, and submit any required review or verification request.'
    ],
    validationNotes: [
      { claim: 'The submitted name or website identifies the correct OAuth provider.', status: 'Unverified', note: 'A name or URL is only a starting point. Confirm the official developer domain before relying on the guide.' },
      { claim: 'Provider-specific scopes, registration fields, and approval requirements.', status: 'Unverified', note: 'The discovery links help locate documentation; they are not evidence that any specific requirement applies.' },
      { claim: 'Estimated build effort and provider approval duration.', status: 'Unverified', note: 'Both remain unknown until the official flow, requested scopes, and release path have been reviewed.' },
      { claim: 'A live OAuth registration or token exchange was tested.', status: 'Unverified', note: 'No provider app was registered and no credentials, tokens, or approval submissions were used in generating this guide.' }
    ],
    sources,
    nextAction: 'Open the first discovery link, locate the provider-owned OAuth documentation, and confirm the app-registration path and available scopes. Replace every unknown estimate with source-backed information before committing to a launch date.',
    caveat: 'This is a structured starter guide, not a claim that the provider’s website was crawled or its setup was tested. Search links are discovery aids only. Verify requirements, scope classifications, and approval timing directly with the provider.',
    generatedAt: new Date().toISOString(),
    mode: 'draft'
  };
}

function staticFile(req, res, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  const normalized = path.normalize(decoded === '/' ? '/index.html' : decoded).replace(/^([.][.][/\\])+/, '');
  const file = path.resolve(PUBLIC, `.${normalized}`);
  if (!file.startsWith(`${PUBLIC}${path.sep}`) && file !== path.join(PUBLIC, 'index.html')) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, { error: 'Not found' });
    const ext = path.extname(file).toLowerCase();
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return send(res, 200, { ok: true, mode: 'guide-builder-ready' });
  }
  if (req.method === 'POST' && url.pathname === '/api/generate') {
    try {
      const body = await readBody(req);
      const input = String(body.app || '').trim();
      if (!input || input.length > 200) return send(res, 400, { error: 'Enter an app name or website (max 200 characters).' });
      if (looksLikeWebsite(input) && !input.includes(' ')) normalizeAppUrl(input);
      const guide = createGuide(input);
      return send(res, 200, { guide, mode: 'draft' });
    } catch (error) {
      const message = error?.message || 'Could not create a guide. Please try again.';
      const status = /valid public website|Enter an app name|Use a public website/.test(message) ? 400 : 500;
      return send(res, status, { error: message });
    }
  }
  if (req.method === 'GET' && !url.pathname.startsWith('/api/')) return staticFile(req, res, url.pathname);
  return send(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`AuthPath running at http://localhost:${PORT}`);
});
