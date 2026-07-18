<!-- markdownlint-disable MD013 -->

# SerhatSoruklu.com Final Enterprise Production Readiness Audit

Audit date: 18 July 2026
Repository: /home/serhat/code/serhatsoruklu
Audit mode: read-only application audit; no fixes, dependency updates, commits,
pushes, deployments, live contact submissions, or
application/configuration/content/style changes were made.

## Scope, method, and limits

This audit combined repository inspection, production builds, unit and
end-to-end tests, safe backend requests, automated browser inspection,
Lighthouse, dependency audits, and timestamped public-origin checks.

The working tree already contained extensive modified and untracked application
work when the audit began. It was preserved. In particular, the untracked
contact implementation, email templates, Soruklu Order and Velari pages/assets,
and related tests were not created by this audit.

The discovered application is:

- Angular 21 with TypeScript, lazy standalone route components, Angular SSR, and
  Express-based SSR serving. Every public route uses server rendering; this is
  not a CSR-only application.
- A separate Node.js/Express backend providing /api/health and /api/contact. It
  uses Helmet, compression, CORS, request-size limits, rate limiting, Nodemailer
  SMTP, and optional MongoDB startup.
- Twelve intended public routes, no route guards, one wildcard redirect, and no
  dedicated 404 page.
- Angular production environment replacement selects
  <https://api.serhatsoruklu.com/api> and <https://serhatsoruklu.com>. Backend
  environment-file selection depends on NODE_ENV being set before process start.
- Sitemap and robots files are static public assets. The sitemap contains
  exactly the twelve intended routes.
- External integrations include SMTP, GitHub, Coupyn, ChatPDM, Medium, Hashnode,
  Instagram, Reddit, X, and remotely hosted Google Fonts files.
- The root start script starts only the backend. The deploy script builds and
  prints a backend start instruction; no complete immutable hosting/runtime
  definition was found.

Public availability checks were observations at approximately 10:20–10:25 UTC on
18 July 2026. They identify a launch condition, not the root cause: the apex,
www, and API origins returned Cloudflare HTTP 520 at that time.

## A. Executive verdict

### NOT READY TO GO LIVE

The application has a strong local foundation: all twelve intended routes
server-render, production builds succeed, unit coverage is healthy, the sitemap
exactly matches the intended route set, technical metadata is generally sound,
and automated local runtime checks found no route-level JavaScript errors or
failed asset requests.

It is not launch-ready because the public website and API were unavailable
during the audit, the audited release cannot be reproduced from the currently
tracked Git state, and several pre-launch defects remain in routing, contact
delivery safety, dependency security, frontend edge hardening, and production
performance. A successful local build does not offset those production-facing
blockers.

## B. Overall grade

| Area                           | Grade | Basis                                                                                                                                     |
| ------------------------------ | ----: | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Overall production readiness   |    D+ | Good application fundamentals, but public availability and release-critical controls fail                                                 |
| Routing and navigation         |    C- | Twelve routes work locally; invalid paths, a GitHub hash CTA, and GitHub routing policy fail                                              |
| Functional reliability         |     C | Main local flows work; production is unavailable and the E2E suite is red                                                                 |
| Contact form                   |     D | Good layered validation, but no live delivery proof and a partial-delivery abuse path                                                     |
| Production configuration       |     D | Correct Angular replacement, but weak backend mode selection and incomplete runtime definition                                            |
| SEO                            |    B- | Strong SSR metadata/canonicals; live fetchability and most social image definitions are not ready                                         |
| Sitemap and crawlability       |    B- | Exact local route coverage; live origin outage prevents production crawling                                                               |
| Performance                    |    D+ | Lighthouse performance 58–79, 3.8–7.0 s LCP, and roughly 3 MB per tested page                                                             |
| Accessibility                  |    A- | Lighthouse 100 on five pages, one h1 per route, keyboard focus and responsive navigation worked; duplicate main landmarks remain          |
| Security                       |     D | Backend controls are good, but production advisories, local secret-file permissions, and unverified frontend edge controls remain         |
| Build and deployment readiness |     D | Build/checks pass, but check can replace production output with development output and the release is not reproducible from tracked files |

## C. Route inventory

All rows below describe the local production SSR build at 127.0.0.1:4201. Every
public-origin route was unavailable during the timestamped production check
because the origin returned HTTP 520.

| Route                                    | Component                                    | Title                                          | Direct load |   Refresh | Navigation | Route-specific issues                                                                          | Indexability           |
| ---------------------------------------- | -------------------------------------------- | ---------------------------------------------- | ----------: | --------: | ---------: | ---------------------------------------------------------------------------------------------- | ---------------------- |
| /                                        | HomeComponent                                | Systems Architect \| Serhat Soruklu            |   Pass, 200 | Pass, 200 |       Pass | No route-specific runtime failure                                                              | Intended index, follow |
| /work                                    | WorkComponent                                | Work \| Serhat Soruklu                         |   Pass, 200 | Pass, 200 |       Pass | No route-specific runtime failure                                                              | Intended index, follow |
| /systems                                 | SystemsComponent                             | Systems \| Serhat Soruklu                      |   Pass, 200 | Pass, 200 |       Pass | Three View GitHub actions bypass /github                                                       | Intended index, follow |
| /systems/coupyn                          | CoupynSystemComponent                        | Coupyn System \| Serhat Soruklu                |   Pass, 200 | Pass, 200 |       Pass | No route-specific runtime failure                                                              | Intended index, follow |
| /systems/chatpdm                         | ChatpdmSystemComponent                       | ChatPDM System \| Serhat Soruklu               |   Pass, 200 | Pass, 200 |       Pass | No route-specific runtime failure                                                              | Intended index, follow |
| /systems/deterministic-boundary-firewall | DeterministicBoundaryFirewallSystemComponent | DBF System \| Serhat Soruklu                   |   Pass, 200 | Pass, 200 |       Pass | Two GitHub actions bypass /github                                                              | Intended index, follow |
| /systems/continuity-identity-model       | ContinuityIdentityModelSystemComponent       | CIM System \| Serhat Soruklu                   |   Pass, 200 | Pass, 200 |       Pass | Two GitHub actions bypass /github                                                              | Intended index, follow |
| /writing                                 | WritingComponent                             | Writing \| Serhat Soruklu                      |   Pass, 200 | Pass, 200 |       Pass | Medium/Hashnode rejected automated direct requests, but indexed destinations were discoverable | Intended index, follow |
| /github                                  | GitHubComponent                              | GitHub \| Serhat Soruklu                       |   Pass, 200 | Pass, 200 |    Partial | Explore Repositories navigates to /#repositories, where the target does not exist              | Intended index, follow |
| /soruklu-order                           | SorukluOrderComponent                        | The Soruklu Order \| Founded by Serhat Soruklu |   Pass, 200 | Pass, 200 |       Pass | Component and essential assets are currently untracked                                         | Intended index, follow |
| /velari                                  | VelariComponent                              | Velari Faith \| A Modern Belief Framework      |   Pass, 200 | Pass, 200 |       Pass | Component and essential assets are currently untracked; nested main landmark                   | Intended index, follow |
| /contact                                 | ContactComponent                             | Contact \| Serhat Soruklu                      |   Pass, 200 | Pass, 200 |       Pass | Client accepts whitespace-only required text; live API unavailable; nested main landmark       | Intended index, follow |

Unless the issue column says otherwise, each route recorded zero uncaught
console/page errors, failed requests, HTTP ≥400 subresources, broken images,
visibly ineffective controls, or horizontal overflow in the local production
harness. “Navigation: Pass” includes normal in-app routing; external and
responsive variants are summarized in section D.

Route implementation: frontend/src/app/app.routes.ts:5-116. All twelve routes
are SSR routes; there are no guards. The wildcard at
frontend/src/app/app.routes.ts:113-116 redirects every unknown route to the home
page.

### Broken-route and URL-state results

| Request                          | Observed result                              | Assessment                                                         |
| -------------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| /does-not-exist                  | Redirected to / and ended as home with 200   | Fails intended 404 semantics; soft-404 risk                        |
| Missing JavaScript asset         | 302 to /                                     | Static misses incorrectly enter Angular fallback                   |
| /work/                           | Normalized to /work with 200                 | Pass                                                               |
| /work?utm_source=audit&mode=test | Route retained query; canonical stayed /work | Pass                                                               |
| /github#repositories             | Direct load 200 with target present          | Pass for a correctly formed direct fragment                        |
| /WORK                            | Redirected to home with 200                  | Case mismatch is hidden as a soft 200                              |
| /systems//chatpdm                | Redirected to /systems with 200              | Malformed path is silently normalized to unrelated content         |
| /%E0%A4%A                        | 500 with generic Internal Server Error       | No stack disclosure, but malformed URI is not a controlled 400/404 |

There were no blank screens, infinite redirects, navigation loops, or repeated
route requests in the automated local production pass.

## D. Link and button inventory

The browser inventory recorded 320 visible anchor instances across all desktop
route visits, representing 36 unique href values, plus 22 visible button
instances representing 11 labels. Repetition is mostly the intentional shared
header/footer shell. Twenty-three unique external destinations were inspected by
URL and security attributes.

### Broken, suspicious, or incorrectly routed controls

| Route/control                                                                    | Destination or behavior                                                | Result                                                                 |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| /github — Explore Repositories                                                   | href="#repositories" resolves from the document base to /#repositories | Broken. It leaves /github and the resulting home target does not exist |
| /systems — three View GitHub actions                                             | Direct repository URLs                                                 | Violates the required /github gateway policy                           |
| /systems/deterministic-boundary-firewall — two GitHub actions                    | Direct repository URLs                                                 | Violates the required /github gateway policy                           |
| /systems/continuity-identity-model — two GitHub actions                          | Direct repository URLs                                                 | Violates the required /github gateway policy                           |
| /contact — submit button with whitespace-only first name, last name, and message | Becomes enabled client-side                                            | Suspicious client-validation gap; backend rejects it                   |

GitHub routing audit result: fail. Seven general GitHub actions outside /github
route directly to individual repositories instead of the required /github
gateway. Relevant implementation appears in
frontend/src/app/pages/systems/systems.component.ts:148-173,
frontend/src/app/pages/systems/deterministic-boundary-firewall/deterministic-boundary-firewall-system.component.ts:30,
and
frontend/src/app/pages/systems/continuity-identity-model/continuity-identity-model-system.component.ts:28.

### Passed interaction checks

- Header, footer, desktop, and mobile navigation reached the intended internal
  routes.
- Browser back and forward navigation returned /contact → /work → /contact
  correctly.
- The mobile menu opened and navigated at 390 × 844.
- Theme selection exposed Dark, Light, and System; the light theme applied.
- The portrait dialog opened and closed.
- The Systems in-page scroll target worked, and the Writing Architecture filter
  changed its pressed state.
- Contact loading disabled the button; an attempted duplicate produced one
  intercepted request; success and failure UI paths were exercised without
  sending mail.
- No placeholder href="#", javascript:void(0), malformed placeholder URL,
  visibly inert control, or insecure target="\_blank" without appropriate rel
  was found.
- Direct checks for Coupyn, ChatPDM, GitHub, X, Instagram, and Reddit returned
  usable destinations. Medium and Hashnode returned 403 to automated curl
  requests, consistent with bot blocking; indexed pages were discoverable, so
  they are recorded as not fully browser-validated rather than dead.
- Repeated shell links and repeated social links were semantically intentional;
  no accidental duplicate control was identified.

## E. Test evidence

### Commands and outcomes

| Command                                                                                                           | Outcome                                                               |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| /usr/bin/time -p npm run lint                                                                                     | Pass; frontend and backend lint, 2.36 s                               |
| /usr/bin/time -p npm run build                                                                                    | Pass; production Angular SSR build and backend syntax checks, 4.37 s  |
| /usr/bin/time -p npm run check                                                                                    | Pass; 5.33 s, but leaves a development frontend build in dist         |
| cd frontend && /usr/bin/time -p npm test -- --watch=false                                                         | Pass; 19 files, 83/83 tests                                           |
| cd backend && /usr/bin/time -p npm test                                                                           | Pass; 16/16 tests                                                     |
| cd frontend && /usr/bin/time -p npm test -- --watch=false --coverage                                              | Pass; coverage recorded below                                         |
| cd backend && /usr/bin/time -p npm run test:coverage                                                              | Pass; coverage recorded below                                         |
| E2E_BASE_URL=`http://127.0.0.1:4201` E2E_PORT=4201 npm --prefix frontend run e2e                                  | Fail overall; 180 passed, 6 failed of 186                             |
| npm ls --depth=0, run at root/frontend/backend                                                                    | Pass; dependency trees resolved                                       |
| /usr/bin/time -p npm ci --dry-run --ignore-scripts, run separately at root/frontend/backend                       | Pass as a dry-run resolution check; this was not a clean installation |
| npm audit --json and npm audit --omit=dev --json, run separately at root/frontend/backend                         | Findings present; see Security                                        |
| PORT=4201 NODE_ENV=production npm --prefix frontend run serve:ssr:frontend                                        | Pass; production SSR started on alternate audit port                  |
| NODE_ENV=production PORT=3001 npm --prefix backend start                                                          | Pass; production-mode backend started on alternate audit port         |
| node output/playwright/production-audit/runtime-audit.mjs                                                         | Completed the isolated production-browser audit                       |
| curl-based route, header, CORS, validation, health, asset, robots, sitemap, external-link, and live-origin checks | Completed; material outcomes are recorded below                       |
| npx --yes lighthouse@13.4.0 URL --output=json --output=html ...                                                   | Completed on five local production routes                             |

The final production build contained output-hashed assets, no source maps, no
localhost reference, no development API endpoint, no unresolved import, no
missing build asset, and no detected case-sensitive path issue. The browser
initial bundle was 494.23 kB raw and 121.80 kB estimated transfer, just 5.77 kB
below the 500 kB warning budget. The largest lazy route chunks were Home 165.04
kB, Contact 99.30 kB, and Velari 77.75 kB; the server entry was 814.21 kB.

Frontend unit coverage was 94.42% statements, 75.88% branches, 72.66% functions,
and 94.23% lines. Backend coverage was 85.25% statements, 76.81% branches,
88.46% functions, and 85.25% lines.

The six Playwright failures all came from
frontend/tests/e2e/header-responsive.spec.ts: two Work heading locators now
matched more than one heading, and four Serhat Soruklu text locators matched
visible and hidden shell copies. The underlying navigation, responsive layout,
theme, and header behaviors passed the independent audit harness. The suite
remains red and its locators need maintenance; these are not six independently
demonstrated application failures.

### Browser and viewport coverage

| Browser                        | Viewport                                                                           | Coverage                                                                                                                    | Result                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Chromium                       | 1440 × 1000                                                                        | All 12 routes, direct load, refresh, metadata, headings, landmarks, images, anchors, buttons, console/network, interactions | All routes 200; zero page errors, failed requests, HTTP ≥400 responses, broken images, or horizontal overflow           |
| Chromium                       | 390 × 844                                                                          | All 12 routes plus mobile menu/navigation                                                                                   | All routes 200; no route-level runtime or overflow failure                                                              |
| Chromium, repository E2E suite | Desktop Chrome plus explicit 360 × 780, 390 × 844, 430 × 932, and 768 × 1024 cases | 186 existing E2E cases                                                                                                      | 180 pass, 6 locator failures                                                                                            |
| Firefox                        | 1366 × 900                                                                         | /, /github, /contact, /velari                                                                                               | Direct/reload 200; no page errors, failed requests, bad responses, or overflow                                          |
| WebKit                         | Attempted                                                                          | Launch only                                                                                                                 | Not run: host lacked libevent-2.1.so.7. This is an audit-environment limitation, not evidence of WebKit incompatibility |

The intentional anti-self-XSS console message produced one warning plus
informational/log messages. There were zero uncaught page errors. No route-level
failed request was observed locally.

### Lighthouse results

Lighthouse used its standard mobile profile against the production SSR build.

| Route    | Performance | Accessibility | Best Practices | SEO |   FCP |   LCP |   CLS |    TBT | Speed Index | Initial server response |
| -------- | ----------: | ------------: | -------------: | --: | ----: | ----: | ----: | -----: | ----------: | ----------------------: |
| /contact |          79 |           100 |            100 | 100 | 3.8 s | 3.8 s | 0.001 |   0 ms |       3.8 s |                   20 ms |
| /github  |          58 |           100 |            100 | 100 | 6.6 s | 7.0 s | 0.002 | 180 ms |       6.6 s |                   20 ms |
| /        |          62 |           100 |            100 | 100 | 5.9 s | 6.4 s | 0.066 |  40 ms |       5.9 s |                   20 ms |
| /systems |          60 |           100 |            100 | 100 | 6.6 s | 7.0 s | 0.000 | 100 ms |       6.6 s |                   20 ms |
| /velari  |          63 |           100 |            100 | 100 | 5.4 s | 6.5 s | 0.000 |  40 ms |       5.4 s |                   30 ms |

Transfer was 2.90–3.11 MB per tested page. Every page transferred the
1,802,859-byte SVG favicon at approximately 1.80 MB over the wire; it was the
dominant resource. Remote Inter and Open Sans files added about 163 kB and 73
kB. Estimated unused JavaScript was 115–178 kB per page; unused CSS was about
12–13 kB except Home at about 97 kB. The 137 kB Velari emblem was rendered at
roughly half its intrinsic width and had an estimated 103 kB saving opportunity.
Lighthouse did not identify a render-blocking, font-display, or static-asset
cache-policy failure. It did identify uncompressed HTML, with roughly 123–165
KiB potential document savings. The 20–30 ms local SSR response was not the
bottleneck.

Performance classification:

- Launch blocker: the combined shared 1.8 MB favicon, roughly 3 MB page
  transfer, and 3.8–7.0 s LCP across representative production pages.
- Important post-launch improvement: route-level unused JavaScript/CSS reduction
  and keeping the initial bundle below a deliberate budget with more headroom.
- Minor optimisation: appropriately resize/compress the Velari emblem.
- Informational only: TBT, CLS, and local SSR response time were healthy; no
  render-blocking or font-display audit failed.

### Contact test boundaries

- Development UI/API selection was tested with an intercepted request to
  <http://localhost:3000/api/contact>.
- The local production frontend selected and attempted
  <https://api.serhatsoruklu.com/api/contact>; the browser request was
  intercepted and never left the process.
- The local production backend on 3001 was tested with health,
  allowed/disallowed CORS preflights, empty, whitespace-only, array-valued and
  malformed payloads, honeypot handling, and unknown API routes.
- A mocked mailer proved the partial-delivery/rate-limit failure mode. No SMTP
  authentication or SMTP verify was attempted.
- No real email was sent, and no end-to-end delivery to either recipient was
  claimed.

### Created audit artifacts

The following are the only intentional audit-created artifacts. Application
files were not edited.

- production-readiness-audit.md — this report.
- output/playwright/production-audit/runtime-audit.mjs — isolated browser audit
  harness.
- output/playwright/production-audit/runtime-audit.json — complete
  machine-readable route, link, interaction, contact, and cross-browser
  evidence.
- output/playwright/production-audit/cli.config.json — audit-only browser
  configuration.
- output/playwright/production-audit/screenshot-home-1440.png
- output/playwright/production-audit/screenshot-velari-1440.png
- output/playwright/production-audit/screenshot-systems-1440.png
- output/playwright/production-audit/screenshot-github-1440.png
- output/playwright/production-audit/screenshot-contact-1440.png
- output/playwright/production-audit/lighthouse-home.report.json
- output/playwright/production-audit/lighthouse-home.report.html
- output/playwright/production-audit/lighthouse-velari.report.json
- output/playwright/production-audit/lighthouse-velari.report.html
- output/playwright/production-audit/lighthouse-systems.report.json
- output/playwright/production-audit/lighthouse-systems.report.html
- output/playwright/production-audit/lighthouse-github.report.json
- output/playwright/production-audit/lighthouse-github.report.html
- output/playwright/production-audit/lighthouse-contact.report.json
- output/playwright/production-audit/lighthouse-contact.report.html
- output/playwright/production-audit/.playwright-cli/console-2026-07-18T10-14-54-902Z.log
- output/playwright/production-audit/.playwright-cli/console-2026-07-18T10-16-48-544Z.log
- output/playwright/production-audit/.playwright-cli/console-2026-07-18T10-21-46-709Z.log
- output/playwright/production-audit/.playwright-cli/console-2026-07-18T10-32-55-400Z.log
- output/playwright/production-audit/.playwright-cli/page-2026-07-18T10-14-55-395Z.yml
- output/playwright/production-audit/.playwright-cli/page-2026-07-18T10-16-49-074Z.yml
- output/playwright/production-audit/.playwright-cli/page-2026-07-18T10-21-46-409Z.yml
- output/playwright/production-audit/.playwright-cli/page-2026-07-18T10-32-56-025Z.yml
- output/playwright/production-audit/C:\Users\coupy\AppData\Local\lighthouse.23026975/\*\*
  — Lighthouse-created temporary Chromium profile files.
- output/playwright/production-audit/C:\Users\coupy\AppData\Local\lighthouse.24275155/\*\*
  — Lighthouse-created temporary Chromium profile files.
- output/playwright/production-audit/C:\Users\coupy\AppData\Local\lighthouse.69501320/\*\*
  — Lighthouse-created temporary Chromium profile files.
- output/playwright/production-audit/C:\Users\coupy\AppData\Local\lighthouse.95480532/\*\*
  — Lighthouse-created temporary Chromium profile files.
- output/playwright/production-audit/C:\Users\coupy\AppData\Local\lighthouse.98731374/\*\*
  — Lighthouse-created temporary Chromium profile files.
- frontend/playwright-report/\*\* — 52 Playwright-generated HTML report, trace
  UI, image, video, Markdown context, and trace archive files.
- frontend/test-results/\*\* — 43 Playwright-generated last-run, screenshot,
  video, error-context, and retry trace files for the six failed cases.
- Ignored build/test outputs were refreshed by normal validation:
  frontend/dist/**, frontend/.angular/cache/**, frontend/coverage/**, and
  backend/coverage/**. These are generated outputs, not source changes.

The double-star entries above are exhaustive generated directory trees: every
file beneath those paths was created by the named test tool and is included in
that entry.

## F. Findings by severity

## P0 - Launch blocker

### P0-1 — Public website and API unavailable

- Location: production public origins.
- Route: <https://serhatsoruklu.com/>, <https://serhatsoruklu.com/contact>,
  <https://www.serhatsoruklu.com/contact>, <https://api.serhatsoruklu.com/>, and
  <https://api.serhatsoruklu.com/api/health>.
- Relevant file: frontend/src/environments/environment.prod.ts:1-5 identifies
  the intended API and site origins; the root cause is outside the audited
  repository evidence.
- Exact issue: every sampled HTTPS endpoint returned Cloudflare HTTP 520. HTTP
  checks also returned 520 rather than a verified redirect.
- User or production impact: users and crawlers cannot use the site, contact
  form, health endpoint, sitemap, robots, or social assets through the public
  origins.
- Evidence: timestamped curl requests at approximately 10:20–10:25 UTC on 18
  July 2026; DNS resolution succeeded, but no origin response was available
  behind Cloudflare.
- Recommended fix: restore the frontend and API origins, determine the
  Cloudflare/origin cause, verify apex and www canonical behavior, verify
  HTTP-to-HTTPS redirection, then rerun full public smoke, crawl, asset, header,
  and contact-path checks.
- Blocks launch: Yes.

### P0-2 — Current audited release is not reproducible from tracked Git state

- Location: repository release boundary.
- Route: /contact, /soruklu-order, /velari, and backend /api/contact, with
  related assets/templates.
- Relevant file: backend/server.js:14 requires backend/contact.js, while
  backend/contact.js, backend/emails/**, backend/assets/**,
  frontend/src/app/pages/soruklu-order/**, frontend/src/app/pages/velari/**, and
  several required assets/tests are untracked.
- Exact issue: essential parts of the locally audited application are absent
  from the tracked release set. A checkout/build from the current tracked commit
  cannot reproduce the audited working tree.
- User or production impact: a Git-based deployment can omit contact delivery
  and whole public pages/assets or fail when a required module is absent.
- Evidence: git status --short --untracked-files=all before report creation;
  local build success depended on those untracked files being present.
- Recommended fix: create an intentional release commit or immutable artifact
  containing every required implementation and asset, excluding secrets and
  audit outputs; build that exact clean release in CI and deploy the same
  artifact.
- Blocks launch: Yes.

## P1 - Must fix before launch

### P1-1 — No real 404 or static-miss behavior

- Location: Angular wildcard and SSR fallback.
- Route: every invalid route and missing public asset.
- Relevant file: frontend/src/app/app.routes.ts:113-116 and
  frontend/src/server.ts:20-35.
- Exact issue: the wildcard redirects to home; unknown paths become a home-page
  200, and a missing JavaScript file returns 302 to /. Malformed encoded input
  returns a generic 500.
- User or production impact: misleading navigation, bad crawler signals,
  soft-404 indexing, concealed broken links/assets, and noisy server errors.
- Evidence: /does-not-exist and /WORK ended on home with 200; /systems//chatpdm
  ended on /systems; missing.js returned 302; /%E0%A4%A returned 500.
- Recommended fix: add a dedicated not-found route/page, preserve a 404 status
  through SSR, keep static misses as 404, and map malformed URIs to a controlled
  400 or 404.
- Blocks launch: Yes.

### P1-2 — Broken GitHub fragment CTA and seven gateway-policy violations

- Location: GitHub and Systems page controls.
- Route: /github, /systems, /systems/deterministic-boundary-firewall, and
  /systems/continuity-identity-model.
- Relevant file: frontend/src/index.html:5;
  frontend/src/app/pages/github/github.component.html:37-38,67;
  frontend/src/app/pages/systems/systems.component.ts:148-173;
  deterministic-boundary-firewall-system.component.ts:30;
  continuity-identity-model-system.component.ts:28.
- Exact issue: Explore Repositories uses href="#repositories"; with the base URL
  it navigates to /#repositories instead of retaining /github. Seven general
  GitHub actions outside /github link directly to repositories contrary to the
  explicit gateway requirement.
- User or production impact: one primary CTA is ineffective, and the intended
  central GitHub information architecture is bypassed.
- Evidence: automated click ended at <http://127.0.0.1:4201/#repositories> with
  no target; static/runtime inventory identified three plus two plus two
  direct-repository actions.
- Recommended fix: keep the repository fragment on /github and route every
  general GitHub CTA outside the gateway to /github; retain external repository
  links only within /github.
- Blocks launch: Yes.

### P1-3 — Contact partial-delivery failures bypass rate limiting and duplicate internal mail

- Location: contact mail delivery and limiter.
- Route: POST /api/contact.
- Relevant file: backend/contact.js:287-316 and 319-374.
- Exact issue: internal mail is sent before confirmation mail. The limiter has
  skipFailedRequests enabled and only counts status 200. If confirmation fails,
  the request is treated as failed even though the internal notification was
  delivered; retries can repeatedly deliver internal notifications without
  exhausting the limit.
- User or production impact: an attacker or retrying user can spam the internal
  mailbox, and legitimate submissions can be duplicated while the UI reports
  failure.
- Evidence: isolated mocked-mailer proof sent eight same-IP requests with
  internal success and confirmation failure: eight 500 responses, zero 429
  responses, eight internal notifications, and sixteen total send attempts.
- Recommended fix: rate-limit attempts independently of delivery outcome, add an
  idempotency/deduplication key, make two-recipient delivery state explicit, and
  avoid reporting an ambiguous failure after a durable internal delivery.
- Blocks launch: Yes.

### P1-4 — Contact readiness does not include required SMTP configuration or delivery

- Location: backend startup/readiness.
- Route: /api/health and POST /api/contact.
- Relevant file: backend/contact.js:244-261,287-292 and
  backend/server.js:169-179.
- Exact issue: missing SMTP settings produce a null mailer, but startup and
  /api/health remain healthy; contact then returns 503. No readiness probe
  validates SMTP configuration or reachability.
- User or production impact: an apparently healthy deployment can launch with a
  completely non-functional contact form.
- Evidence: code path inspection and safe local production-mode startup; live
  API was unavailable, and no SMTP auth or real delivery was attempted.
- Recommended fix: validate required mail settings at startup, distinguish
  liveness from readiness, include contact-delivery readiness, and perform one
  controlled production-path delivery test after deployment.
- Blocks launch: Yes.

### P1-5 — Production dependency advisories include critical and high findings

- Location: root, frontend, and backend production dependency trees.
- Route: application-wide SSR/backend runtime.
- Relevant file: package.json/package-lock.json,
  frontend/package.json/package-lock.json, and
  backend/package.json/package-lock.json.
- Exact issue: root production audit reports two critical findings through
  concurrently → shell-quote; frontend production audit reports nine findings
  including six high Angular/SSR advisories and qs; backend production audit
  reports one high and two moderate findings including Nodemailer and qs. Full
  frontend audit reports 22 total.
- User or production impact: known issues include classes of SSR XSS, SSRF,
  cache poisoning, hydration/transfer-cache faults, denial of service, and
  mail/query parsing risks. Audit results do not prove every advisory is
  exploitable here, but critical/high production findings are not acceptable at
  launch without a documented non-applicability review.
- Evidence: npm audit --omit=dev in each package tree; no package was changed.
- Recommended fix: update or replace affected production packages, move
  development-only tools such as concurrently and nodemon out of production
  dependencies where appropriate, review each advisory against deployed paths,
  and rerun build/tests/audits.
- Blocks launch: Yes.

### P1-6 — Frontend transport, headers, and compression are not established

- Location: frontend SSR server and production edge.
- Route: all frontend routes and assets.
- Relevant file: frontend/src/server.ts:12-35.
- Exact issue: the local production SSR response exposes X-Powered-By and has no
  application-level CSP, HSTS, nosniff, frame protection, referrer policy,
  Permissions Policy, cross-origin isolation policy, or compression. The
  repository contains no HTTP-to-HTTPS redirect. A future CDN or proxy may
  provide these, but the live 520 response prevented verification.
- User or production impact: if the edge does not add equivalent controls, HTML
  is needlessly large and browser-side protections/HTTPS enforcement are absent.
- Evidence: local production curl headers; Lighthouse estimated 123–165 KiB HTML
  compression savings; HTTP public origin did not demonstrate a redirect.
- Recommended fix: define and verify responsibility at SSR server or edge for
  HTTPS redirect, HSTS after HTTPS is stable, CSP, nosniff, frame-ancestors,
  referrer and permissions policy, compression, and removal of framework
  disclosure.
- Blocks launch: Yes.

### P1-7 — Validation order can replace production output with a development build

- Location: root validation workflow and frontend typecheck script.
- Route: release build artifact.
- Relevant file: package.json:9-13, frontend/package.json:9-15, and
  frontend/angular.json:39-66.
- Exact issue: npm run check invokes frontend typecheck, which is an Angular
  development build with optimization disabled and source maps enabled. Running
  the documented sequence lint → build → check leaves dist containing
  development output rather than the previously validated production output.
- User or production impact: a deployment that publishes dist after the required
  check order can ship unhashed, unoptimized JavaScript and source maps.
- Evidence: production output was 494.23 kB initial with hashed files and no
  maps; after check it was about 1.81 MB with unhashed files/maps. A final
  production build was run to restore the audited output.
- Recommended fix: make type checking non-emitting or isolate its output, then
  run the production build last and deploy only that immutable artifact.
- Blocks launch: Yes.

### P1-8 — Production startup and environment selection are not deterministic

- Location: root/backend process startup and deployment script.
- Route: frontend SSR and backend service.
- Relevant file: package.json:7-19, backend/package.json:6-13,
  backend/server.js:4-19, and scripts/deploy.sh.
- Exact issue: dotenv selects .env.production only when NODE_ENV was externally
  set before startup; npm start starts only the backend; installation uses
  mutable npm install through postinstall; no complete process definition, Node
  engine, graceful shutdown contract, or immutable frontend/backend startup
  sequence exists.
- User or production impact: a deployment can load development configuration,
  omit the frontend SSR service, resolve a different dependency graph, or
  start/stop services inconsistently.
- Evidence: repository scripts/config inspection and production startup
  requiring explicit NODE_ENV=production on port 3001.
- Recommended fix: document and automate a deterministic npm ci → validate →
  production build → start frontend and backend workflow with explicit
  environment, supported Node version, health/readiness, graceful termination,
  and an immutable artifact.
- Blocks launch: Yes.

### P1-9 — Secret-bearing local environment files have unsafe permissions

- Location: backend environment files in the audited workspace.
- Route: backend runtime.
- Relevant file: backend/.env and backend/.env.production; both are ignored and
  were not printed.
- Exact issue: backend/.env was mode 777 and backend/.env.production was
  mode 644. Both contained a present, non-placeholder SMTP password value. This
  is local-workspace evidence, not proof of production-host permissions.
- User or production impact: other local users or processes can read production
  credentials; mode 777 also permits modification of the development file.
- Evidence: stat permissions and presence-only secret checks; git ignore and
  tracked-history scans found no committed secret value.
- Recommended fix: rotate if exposure is plausible, store production secrets in
  the deployment secret manager, restrict local secret files to owner-only
  permissions such as 600, and keep them outside release artifacts.
- Blocks launch: Yes.

### P1-10 — Representative mobile performance is below a launch-quality baseline

- Location: shared frontend shell/assets and five representative routes.
- Route: /, /github, /contact, /systems, /velari.
- Relevant file: frontend/public/assets/brand/favicons/favicon.svg,
  frontend/src/server.ts:20-25, route bundles and component styles.
- Exact issue: Lighthouse performance is 58–79, LCP is 3.8–7.0 s, and each
  tested route transfers about 2.9–3.1 MB. A 1,802,859-byte SVG favicon is
  transferred on every page and dominates payload.
- User or production impact: materially slow first impressions on mobile
  networks, wasted bandwidth, and weaker search/user experience despite fast
  local SSR response.
- Evidence: five Lighthouse JSON/HTML reports; shared favicon transfer around
  1.80 MB; initial bundle within 1.15% of warning budget.
- Recommended fix: replace the favicon payload with correctly sized optimized
  assets, enable HTML compression, reassess shared/lazy bundles, and rerun
  production Lighthouse until representative LCP and payload meet an agreed
  launch threshold.
- Blocks launch: Yes.

## P2 - Strongly recommended

### P2-1 — Four routes contain nested main landmarks

- Location: application shell and page templates.
- Route: /github, /contact, /soruklu-order, /velari.
- Relevant file: frontend/src/app/app.html:2-15 and each affected page template
  at line 1.
- Exact issue: the global shell wraps the route in main, while these pages add
  another main.
- User or production impact: screen-reader landmark navigation becomes ambiguous
  despite otherwise strong semantics.
- Evidence: runtime landmark inventory reported two main elements on each
  affected route.
- Recommended fix: keep exactly one page-level main landmark by changing the
  nested semantic element.
- Blocks launch: No, provided P0/P1 items are resolved.

### P2-2 — Client-side contact validation accepts whitespace-only required text

- Location: contact form controls and computed validity.
- Route: /contact.
- Relevant file: frontend/src/app/pages/contact/contact.component.ts:131-138 and
  222-251.
- Exact issue: required/minLength validation counts spaces, so a form with
  whitespace-only first name, last name, and message enables submit.
- User or production impact: unnecessary API calls and confusing validation UX;
  backend correctly rejects the payload.
- Evidence: production browser harness observed
  whitespaceOnlySubmitEnabled=true; backend returned 400 in the separate
  whitespace test.
- Recommended fix: trim or use a non-whitespace validator before enabling
  submission and present matching client/server messages.
- Blocks launch: No; server enforcement prevents acceptance.

### P2-3 — Frontend/backend contact timeouts can produce false failure and retries

- Location: contact request timing.
- Route: /contact and POST /api/contact.
- Relevant file: frontend/src/app/pages/contact/contact.component.ts:30,235 and
  backend/contact.js:264-299.
- Exact issue: frontend timeout is 15 s while the backend can perform two
  sequential mail sends of up to 10 s each; Promise.race does not cancel the
  underlying send.
- User or production impact: the browser can report failure while mail is still
  sending, encouraging duplicates.
- Evidence: code timing comparison and sequential send implementation.
- Recommended fix: align end-to-end budgets, abort work where supported, and
  make server delivery/idempotency status queryable.
- Blocks launch: No once P1-3 is fixed; otherwise it compounds that blocker.

### P2-4 — Email address validation is too permissive

- Location: backend contact validation.
- Route: POST /api/contact.
- Relevant file: backend/contact.js:121-177.
- Exact issue: the custom regex accepts inputs such as
  <victim@example.com>,other and <victim@example.com>, although CRLF injection
  was rejected.
- User or production impact: malformed recipient addresses can reach the mailer
  and cause failures or ambiguous delivery.
- Evidence: isolated validation cases against validateContactPayload.
- Recommended fix: use a standards-aware address parser and require exactly one
  mailbox.
- Blocks launch: No after delivery safety controls are corrected.

### P2-5 — Abuse protection is process-local and origin-optional

- Location: contact API perimeter.
- Route: POST /api/contact.
- Relevant file: backend/contact.js:301-374 and backend/server.js:140-153.
- Exact issue: the five-per-IP limiter is in-memory, validates before counting,
  has no shared store/CAPTCHA/reputation layer, and intentionally permits
  requests with no Origin header.
- User or production impact: horizontal scaling resets/partitions limits,
  invalid-request probing is inexpensive, and non-browser clients can attack the
  endpoint.
- Evidence: middleware order/config inspection. No destructive abuse test was
  performed.
- Recommended fix: use a shared rate-limit store, count attempts at the
  appropriate boundary, monitor abuse, and add challenge/reputation controls if
  traffic warrants.
- Blocks launch: No after P1-3 is corrected and monitored.

### P2-6 — www contact origin is not allowed by the backend default

- Location: backend CORS defaults.
- Route: /contact when served from <https://www.serhatsoruklu.com>.
- Relevant file: frontend/src/server.ts:13-15 and backend/server.js:71-83.
- Exact issue: SSR accepts www, but production backend CORS defaults to only
  <https://serhatsoruklu.com>.
- User or production impact: if www serves the application instead of
  immediately redirecting, contact submissions fail CORS.
- Evidence: configuration comparison; live origin could not be tested
  beyond 520.
- Recommended fix: enforce an immediate canonical www-to-apex redirect, or
  include www in the explicit production allowlist.
- Blocks launch: No if the canonical redirect is verified before interaction;
  otherwise promote to P1.

### P2-7 — Long cache lifetime is applied indiscriminately

- Location: frontend static middleware.
- Route: sitemap.xml, robots.txt, web manifest, social images, and all public
  assets.
- Relevant file: frontend/src/server.ts:20-25.
- Exact issue: every static file receives a one-year max-age, including mutable
  unhashed control files.
- User or production impact: sitemap, robots, manifest, and social metadata
  assets can remain stale through launch changes.
- Evidence: local response headers, including sitemap.xml with public
  max-age=31536000.
- Recommended fix: keep immutable one-year caching for hashed/versioned assets
  and assign shorter/revalidation policies to mutable public files.
- Blocks launch: No.

### P2-8 — Social previews are incomplete and not live-verifiable

- Location: route SEO configuration and social assets.
- Route: all 12 routes, especially the 10 routes using SVG previews.
- Relevant file: frontend/src/app/core/seo/seo.config.ts:18-126 and
  frontend/src/app/core/seo/seo.service.ts.
- Exact issue: 10 of 12 routes use SVG Open Graph images; most routes omit image
  type, dimensions, and alt metadata. Only Velari has the full set. Live images
  returned 520 with the site.
- User or production impact: some social crawlers may reject or inconsistently
  render the preview, and production previews cannot currently be fetched.
- Evidence: metadata/source inventory and live-origin failure. Local URLs were
  absolute and assets existed.
- Recommended fix: provide 1200 × 630 raster previews and complete image
  metadata per route, then validate with major social debuggers after origins
  recover.
- Blocks launch: No after public availability is restored, but validate before
  marketing launch.

### P2-9 — Remote fonts duplicate an otherwise self-hosted asset strategy

- Location: multiple component style sheets.
- Route: several content/detail routes.
- Relevant file: component CSS references to fonts.gstatic.com plus frontend
  public font assets.
- Exact issue: hard-coded remote TTF URLs add third-party requests despite
  self-hosted fonts being present.
- User or production impact: extra transfer and privacy/availability dependency;
  Lighthouse measured about 235 kB across Inter/Open Sans files.
- Evidence: CSS scan and Lighthouse resource inventory.
- Recommended fix: standardize on optimized self-hosted font subsets and preload
  only critical faces.
- Blocks launch: No.

### P2-10 — CI and deployment validation are incomplete

- Location: GitHub Actions and release scripts.
- Route: full stack.
- Relevant file: .github/workflows/ci.yml, package.json, scripts/deploy.sh, and
  frontend/playwright.config.ts.
- Exact issue: CI does not run frontend unit tests or Playwright, deployment
  uses npm install rather than npm ci, and no automated full-stack production
  smoke/contact readiness check exists.
- User or production impact: locator failures, runtime regressions, and
  dependency drift can pass the publish gate.
- Evidence: workflow/script inspection and the local E2E suite's six failures.
- Recommended fix: run lint, unit tests, production build last, backend tests,
  dependency review, and production-SSR smoke/E2E against the immutable
  artifact.
- Blocks launch: No after a one-time clean release qualification; required for
  dependable ongoing delivery.

### P2-11 — Production observability and readiness are too shallow

- Location: backend/server lifecycle and frontend SSR.
- Route: /api/health, /api/contact, all frontend routes.
- Relevant file: backend/server.js:169-219 and frontend/src/server.ts:31-50.
- Exact issue: health does not cover SMTP/readiness, logs are unstructured, no
  request correlation/error monitoring is evident, and graceful shutdown is not
  defined.
- User or production impact: outages and partial contact failures are harder to
  detect, diagnose, and recover from.
- Evidence: repository/server inspection.
- Recommended fix: separate liveness/readiness, add structured redacted logs,
  request IDs, error/uptime alerts, contact-delivery metrics, and graceful
  shutdown.
- Blocks launch: No after explicit readiness and monitoring for the first
  release are established.

### P2-12 — The existing Playwright gate is red and some SEO coverage is stale

- Location: frontend E2E suite.
- Route: responsive shell and route metadata.
- Relevant file: frontend/tests/e2e/header-responsive.spec.ts and
  frontend/tests/e2e/seo.spec.ts.
- Exact issue: six ambiguous/stale locator assertions fail; the hard-coded SEO
  route list omits four system/detail routes.
- User or production impact: a red suite cannot act as a trustworthy release
  gate, and metadata regressions can escape route coverage.
- Evidence: 180/186 passing E2E run and test-source inventory.
- Recommended fix: use unique roles/test IDs or exact locators, derive SEO cases
  from the route/sitemap source, and require the suite to pass in CI.
- Blocks launch: No; independent checks confirmed the underlying application
  flows.

### P2-13 — Production bundle has little budget headroom and substantial unused code

- Location: frontend browser bundle.
- Route: shared shell and representative pages.
- Relevant file: frontend/angular.json:46-56 and built chunk graph.
- Exact issue: the 494.23 kB initial raw bundle is 98.85% of its warning budget;
  Lighthouse estimates 115–178 kB unused JavaScript and 12–97 kB unused CSS per
  page.
- User or production impact: small additions can cross the budget, while users
  download work not needed for the first view.
- Evidence: Angular production build and five Lighthouse reports.
- Recommended fix: inspect shared imports, defer non-critical UI
  libraries/content, and set evidence-based CI budgets.
- Blocks launch: No after the P1 shared-payload problem is corrected.

### P2-14 — Environment documentation contains stale or mismatched keys

- Location: backend environment examples/documentation.
- Route: backend startup/contact.
- Relevant file: backend environment files and README.md compared with
  backend/server.js and backend/contact.js.
- Exact issue: CONTACT*TO exists while code expects CONTACT_INTERNAL_TO; generic
  RATE_LIMIT keys do not match STATIC_RATE_LIMIT*\*; documentation omits
  important NODE_ENV, CORS, trust-proxy, and contact readiness details.
- User or production impact: operators can set plausible variables that the
  runtime silently ignores.
- Evidence: key-name comparison only; no secret values were exposed.
- Recommended fix: maintain a non-secret .env.example/schema and validate
  unknown/missing keys at startup.
- Blocks launch: No once the deterministic production configuration in P1-8 is
  implemented.

## P3 - Post-launch improvement

### P3-1 — Structured-data ownership and hierarchy can be cleaner

- Location: global SEO service and detail pages.
- Route: system detail routes, /soruklu-order, /velari.
- Relevant file: frontend/src/app/core/seo/seo.service.ts and route
  structured-data configuration.
- Exact issue: static and dynamic JSON-LD overlap, and system breadcrumbs omit
  the Systems parent level.
- User or production impact: no syntax failure was found, but search engines
  receive a less precise graph/hierarchy.
- Evidence: JSON-LD parsing and breadcrumb inspection.
- Recommended fix: define a single ownership model and include the complete
  route hierarchy.
- Blocks launch: No.

### P3-2 — Twitter/X author handle is empty

- Location: global SEO configuration.
- Route: all public routes.
- Relevant file: frontend/src/app/core/seo/seo.config.ts:129-139.
- Exact issue: twitterHandle is empty.
- User or production impact: cards lack creator/site attribution.
- Evidence: configuration inspection.
- Recommended fix: populate the verified production handle if one should be
  associated.
- Blocks launch: No.

### P3-3 — Optional browser coverage remains incomplete

- Location: test infrastructure.
- Route: representative cross-browser routes.
- Relevant file: audit environment, not application code.
- Exact issue: WebKit could not start because the host lacked libevent-2.1.so.7;
  Firefox covered four representative routes rather than all twelve.
- User or production impact: Safari/WebKit-specific behavior remains unproven.
- Evidence: Playwright launch error and audit matrix.
- Recommended fix: install the Playwright host dependencies in CI and run a
  compact WebKit/Firefox smoke matrix.
- Blocks launch: No; this is an evidence gap, not a demonstrated
  incompatibility.

### P3-4 — Oversized Velari content image

- Location: Velari emblem.
- Route: /velari.
- Relevant file: frontend/public/assets/brand/velari/velari-faith-emblem.jpg.
- Exact issue: a 137 kB, 1080-pixel image is rendered at roughly 543 pixels.
- User or production impact: avoidable transfer on one route.
- Evidence: Lighthouse image sizing opportunity estimated about 103 kB savings.
- Recommended fix: provide responsive modern-format sizes.
- Blocks launch: No.

## Pass

### Pass-1 — Production compilation and server rendering

- Location: Angular/frontend and backend build pipeline.
- Route: all twelve routes and backend startup.
- Relevant file: package.json, frontend/angular.json, backend/package.json.
- Exact issue: Pass — lint, production build, backend syntax checks, and
  production-mode startups passed; all routes direct-loaded and refreshed.
- User or production impact: core code compiles and SSR deep links work when the
  local services are available.
- Evidence: recorded commands, 12-route Chromium matrix, representative Firefox
  matrix.
- Recommended fix: none required; retain these checks and run them on the exact
  release artifact.
- Blocks launch: No.

### Pass-2 — Route metadata, canonical URLs, and primary headings

- Location: SEO service/configuration.
- Route: all twelve intended routes.
- Relevant file: frontend/src/app/core/seo/seo.config.ts and seo.service.ts.
- Exact issue: Pass — every route had a unique title/description, production
  absolute canonical, index/follow, matching Open Graph URL/title, and exactly
  one h1; metadata updated during client navigation.
- User or production impact: locally served SSR pages provide a strong technical
  SEO baseline.
- Evidence: static metadata inventory and desktop/mobile production browser
  collection.
- Recommended fix: none required locally; preserve route-derived metadata tests
  and verify again on the restored public origin.
- Blocks launch: No.

### Pass-3 — Sitemap and robots route set

- Location: public crawl files.
- Route: all twelve intended routes.
- Relevant file: frontend/public/sitemap.xml, frontend/public/robots.txt,
  frontend/src/app/core/seo/sitemap.config.ts.
- Exact issue: Pass — sitemap routes exactly matched the twelve route
  definitions; robots allowed crawling and referenced the production sitemap;
  local content types were correct.
- User or production impact: once the origin is available, intended content has
  a complete discovery list.
- Evidence: route/sitemap set comparison and local response headers.
- Recommended fix: none required for route completeness; add a CI equality check
  and apply a revalidation-friendly cache policy.
- Blocks launch: No independently; live origin availability does.

### Pass-4 — Backend request security baseline

- Location: Express middleware.
- Route: backend and /api.
- Relevant file: backend/server.js:123-202.
- Exact issue: Pass — backend disables X-Powered-By, applies Helmet and
  compression, restricts CORS, limits bodies to 100 kB, sets no-store on API
  responses, rejects disallowed origins, and returns generic 500 errors.
- User or production impact: the API has a sound first security layer.
- Evidence: source inspection plus local health, CORS, malformed JSON, and
  unknown-route requests.
- Recommended fix: none required for this baseline; keep controls covered by
  integration tests and verify edge/proxy behavior.
- Blocks launch: No.

### Pass-5 — Contact validation and output encoding

- Location: frontend/backend contact implementation and email templates.
- Route: /contact and POST /api/contact.
- Relevant file: frontend/src/app/pages/contact/contact.component.ts,
  backend/contact.js, backend/emails/templates/\*\*.
- Exact issue: Pass — required fields, types, length limits, topics,
  empty/array/whitespace payloads, honeypot, spam-like content, escaping,
  generic errors, loading state, and duplicate-click protection are implemented
  across layers; CRLF injection was rejected.
- User or production impact: ordinary malformed and unsafe content is rejected
  or safely encoded.
- Evidence: 16 backend tests, contact unit/E2E coverage, safe API requests, and
  browser interception.
- Recommended fix: none required for the passing controls; retain them while
  fixing delivery/idempotency and address parsing.
- Blocks launch: No independently.

### Pass-6 — Production frontend endpoint replacement

- Location: Angular environments and compiled output.
- Route: /contact.
- Relevant file: frontend/src/environments/environment.prod.ts:1-5 and
  frontend/angular.json:39-45.
- Exact issue: Pass — production replacement selected
  <https://api.serhatsoruklu.com/api>; compiled production output contained no
  localhost or development endpoint and no source map.
- User or production impact: the production browser does not accidentally call
  the development backend.
- Evidence: compiled-output scan and intercepted production request URL.
- Recommended fix: none required; keep an automated assertion in the release
  pipeline.
- Blocks launch: No.

### Pass-7 — External-link security and basic accessibility

- Location: site-wide links, controls, and landmarks.
- Route: all twelve routes.
- Relevant file: route templates and shared header/footer.
- Exact issue: Pass — no insecure external target without noopener/noreferrer
  was found; tab focus was visible on sampled links/buttons, mobile navigation
  was operable, image loads succeeded, all pages had an h1, and Lighthouse
  accessibility scored 100 on five representative pages.
- User or production impact: normal keyboard and link use is broadly sound.
- Evidence: runtime inventory, tab sequence, responsive harness, and Lighthouse.
- Recommended fix: none for the passing controls; fix the separately reported
  nested main landmarks and keep automated accessibility checks.
- Blocks launch: No.

### Pass-8 — Secret values were not committed or exposed by the audit

- Location: repository history/ignore configuration and report handling.
- Route: backend configuration.
- Relevant file: .gitignore and backend secret files.
- Exact issue: Pass — environment files are ignored, targeted tracked-history
  scans found no secret values, production values were checked only for
  presence/placeholder state, and this report contains no credentials.
- User or production impact: no repository secret disclosure was demonstrated.
- Evidence: git tracking/ignore/history checks without printing values.
- Recommended fix: none for repository exposure; move production secrets to
  managed storage and correct the separately reported file permissions.
- Blocks launch: No independently; unsafe permission handling is P1-9.

### Pass-9 — Client-side security sanity checks

- Location: frontend source, generated production output, and public routes.
- Route: all public routes, query parameters, and fragments.
- Relevant file: frontend/src/**and compiled frontend/dist/**.
- Exact issue: Pass — no user-controlled unsafe innerHTML path, open redirect,
  mixed-content request, client-side secret, development/admin route, directory
  listing, placeholder script URL, or production source map was found. Angular
  sanitizer bypass calls construct SVG icons from compile-time library path
  constants rather than request/user content. Reduced-motion handling exists in
  shared navigation and relevant animated component styles/services.
- User or production impact: no direct client-side XSS, open-redirect,
  mixed-content, private-route, or source-disclosure defect was demonstrated by
  safe review.
- Evidence: targeted source scan, compiled-output scan, route/query/fragment
  browser tests, external-link inventory, and response checks.
- Recommended fix: none for these passing checks; retain static analysis and
  safe runtime coverage when routes change.
- Blocks launch: No.

## G. SEO and sitemap conclusion

- Sitemap complete: Yes. The sitemap contains exactly all twelve intended public
  routes and no wildcard/error/utility route.
- Sitemap needs updating: No route-list update is required for the audited route
  set. Its cache policy should be corrected, and it must be revalidated after
  the live origin is restored.
- robots.txt correct: Yes in repository and local production serving. It allows
  crawling and references <https://serhatsoruklu.com/sitemap.xml>. Production
  fetchability is currently blocked by the 520 outage, not by robots rules.
- Every intended route indexable: Yes by metadata and SSR implementation; every
  route emits index, follow and server-rendered content. No accidental noindex
  or robots block was found. In practice, none was reliably crawlable while the
  public origin returned 520.
- Canonical URLs correct: Yes. Every canonical uses the intended HTTPS apex
  production domain, matches the clean route, excludes query parameters, and
  contains no localhost/development reference.
- Metadata production-ready: Mostly, but not fully. Titles, descriptions,
  canonicals, Open Graph/Twitter basics, one h1, heading structures, alt text,
  syntactically valid JSON-LD, favicon declarations, and the web manifest were
  present locally. Nested main landmarks, the oversized favicon payload, and
  minor structured-data refinements remain.
- Social previews production-ready: No. The public assets were unavailable
  during the live check, 10 of 12 routes use SVG previews, and most omit image
  type/dimensions/alt metadata. Only Soruklu Order and Velari use 1200 × 630 PNG
  files, with Velari carrying the complete image metadata set.

Practical crawlability conclusion: Angular SSR removes the normal CSR
discovery/social-preview limitation; rendered HTML and route metadata were
present on direct loads and refreshes. The actual SEO launch risk is public
availability, soft-404 behavior, mutable crawl-file caching, and incomplete
social image definitions—not client-only rendering.

## H. Contact form conclusion

- Development mode works: UI behavior and development endpoint selection worked
  under interception, targeting <http://localhost:3000/api/contact>.
  Invalid/honeypot backend paths also worked locally. Real SMTP delivery was not
  tested.
- Local production build works: Yes for rendering, validation UI,
  loading/success/error states, and an intercepted submission.
- Production endpoint selection works: Yes. The production build selected
  exactly <https://api.serhatsoruklu.com/api/contact> and contained no localhost
  reference. The live endpoint itself returned 520 during the audit.
- Form validation sufficient: Server-side validation is strong for ordinary
  malformed payloads; client validation is not fully sufficient because
  whitespace-only required text enables submission, and the email parser is too
  permissive.
- Accidental duplicates and basic abuse: Accidental rapid double clicks are
  suppressed while loading, the honeypot and per-IP limiter provide a baseline,
  and payload limits/CORS are present. Protection is not sufficient under
  confirmation-mail failure because successful internal deliveries are not
  counted and are not idempotent.
- Sensitive handling/errors: Secrets remain server-side and ignored; HTML
  content is escaped; production 500 errors are generic. Local secret-file
  permissions are unsafe, and health does not prove SMTP readiness.
- Safe to launch: No. Restore the API, fix partial-delivery rate
  limiting/idempotency, validate SMTP/readiness, align timeout/address handling,
  and complete one controlled end-to-end production-path delivery before launch.

No real contact message, confirmation, or internal notification was sent during
this audit.

## I. Go-live checklist

### Required before launch

- [ ] Restore apex, www, and API availability; eliminate the 520 response and
      verify stable HTTPS service.
- [ ] Verify canonical apex/www behavior, HTTP-to-HTTPS redirect, /api/health
      readiness, contact endpoint, robots, sitemap, social assets, and security
      headers on the real edge.
- [ ] Produce a clean, reproducible release containing every required
      currently-untracked source file/template/asset, while excluding all
      secrets and audit output.
- [ ] Make the production build/start sequence deterministic: explicit NODE_ENV,
      immutable npm ci installation, non-emitting/isolated typecheck, production
      build last, and both frontend SSR and backend processes defined.
- [ ] Add a real SSR 404 path/status, preserve static-asset 404 responses, and
      handle malformed URLs without a generic 500.
- [ ] Fix Explore Repositories so it retains /github#repositories.
- [ ] Route all seven general GitHub CTAs outside /github through /github.
- [ ] Make contact delivery rate limiting count attempted/partially delivered
      requests and add idempotent/deduplicated delivery semantics.
- [ ] Fail readiness when required SMTP configuration/delivery prerequisites are
      unavailable; perform one controlled production-path end-to-end mail test.
- [ ] Resolve or explicitly document non-applicability of all critical/high
      production dependency advisories, then rerun the complete suite.
- [ ] Establish verified production HTTPS enforcement, security headers,
      compression, and framework-disclosure policy at the frontend server or
      edge.
- [ ] Move production secrets to managed storage, restrict local secret files to
      owner-only access, and rotate any credential plausibly exposed.
- [ ] Correct the shared favicon/page payload and rerun Lighthouse to an agreed
      launch threshold; current 3.8–7.0 s LCP and roughly 3 MB transfers are not
      accepted.

### Recommended before launch

- [ ] Repair all six stale Playwright locators and cover all routes in the SEO
      suite so the E2E gate is green.
- [ ] Remove nested main landmarks from /github, /contact, /soruklu-order, and
      /velari.
- [ ] Make client text validation reject whitespace-only values and use a
      single-mailbox address parser.
- [ ] Align frontend/backend contact timeouts and improve shared abuse controls.
- [ ] Enforce www-to-apex before interaction or add www to the backend CORS
      allowlist.
- [ ] Use revalidation-friendly caching for sitemap, robots, manifest, and other
      mutable assets.
- [ ] Provide raster social cards with complete metadata and validate them with
      production social debuggers.
- [ ] Self-host/subset the remaining remote fonts and remove unnecessary shared
      JavaScript/CSS.
- [ ] Add structured readiness, redacted logging, request correlation, delivery
      metrics, and alerts.

### Safe to complete after launch

- [ ] Consolidate JSON-LD ownership and enrich system breadcrumbs.
- [ ] Add the verified Twitter/X handle if desired.
- [ ] Add WebKit and broader Firefox smoke coverage in CI.
- [ ] Serve responsive, smaller Velari emblem variants.
- [ ] Continue bundle-budget and route-level unused-code optimization after the
      shared launch payload is corrected.

## J. Final recommendation

The smallest exact blocker set is:

1. Restore and verify the public apex, www, and API origins, including canonical
   HTTPS behavior and the real contact/crawl/social surface.
2. Build a clean reproducible release containing all required
   currently-untracked work, with deterministic production environment
   selection, installation, build-last validation, and frontend/backend startup.
3. Make contact delivery safe and observable: SMTP/readiness validation,
   attempt-based rate limiting, idempotent partial-delivery handling, secure
   secret storage, and one controlled end-to-end production-path mail
   verification.
4. Correct release-critical web behavior: real 404/static-miss semantics, the
   broken /github repository fragment CTA, and all seven GitHub gateway
   violations.
5. Establish and verify frontend HTTPS enforcement, security headers,
   compression, and remediate or formally disposition every critical/high
   production dependency advisory.
6. Remove the shared 1.8 MB favicon bottleneck and bring representative mobile
   payload/LCP to the agreed launch threshold.

Once those six workstreams pass a clean release-candidate rerun, the remaining
P2/P3 findings can be managed without blocking launch.

DO NOT GO LIVE YET
