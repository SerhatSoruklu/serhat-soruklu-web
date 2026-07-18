<!-- markdownlint-disable MD013 -->

# GitHub Main Merge Report

Merge date: 18 July 2026

Repository: `SerhatSoruklu/serhat-soruklu-web`

## Outcome

MAIN MERGE COMPLETE

Pull request 14 was merged through the protected GitHub pull-request path with a normal merge commit after every required check passed on the exact release head. Local `main` was fast-forwarded to the resulting remote `main`, the complete release head was confirmed as an ancestor, and the merged tree passed the required post-merge validation.

## Git evidence

- PR URL: <https://github.com/SerhatSoruklu/serhat-soruklu-web/pull/14>
- Release branch: `release/serhatsoruklu-production-ready-2026-07-18`
- Verified PR head SHA: `6102129b12260a02efd085fd3aa384b156057d3c`
- Merge commit SHA: `95b165a0e4f83cdb3b743ab4e513f4b5e1e67c44`
- Final `origin/main` SHA after the release merge and validation: `95b165a0e4f83cdb3b743ab4e513f4b5e1e67c44`
- Final local `main` SHA after the release merge and validation: `95b165a0e4f83cdb3b743ab4e513f4b5e1e67c44`
- Local and remote `main` match: yes
- Release head is an ancestor of `main`: yes
- Merge method: normal merge commit; logical release commits preserved
- Release-candidate CI run: <https://github.com/SerhatSoruklu/serhat-soruklu-web/actions/runs/29650334626>

The SHA fields above record `main` at completion of the release merge and post-merge validation. The later protected documentation merge that adds this report cannot embed its own resulting merge SHA without changing that SHA; the final operator handoff records the documentation merge SHA and confirms the final local/remote match.

## CI evidence

Every check attached to the exact verified PR head `6102129b12260a02efd085fd3aa384b156057d3c` completed successfully:

| Required check | Final status |
| -------------- | ------------ |
| Release candidate gate | PASS |
| Analyze JavaScript and TypeScript | PASS |
| CodeQL | PASS |
| GitGuardian Security Checks | PASS |
| Repository summary | PASS |
| SonarQube analysis | PASS |
| SonarCloud Code Analysis | PASS |

The release-candidate gate passed locked installs, lint, static checks, 137 unit tests, 207 Chromium end-to-end cases, 24 Firefox/WebKit route-smoke cases, production dependency audit, production build, artifact assertion, production SSR smoke, and immutable artifact upload.

## Release evidence

- All 141 required release paths are present on merged `main`: 78 modified, 63 added, and none removed relative to the audited baseline branch point.
- No real `.env`, credential, generated build output, coverage, Playwright output, Lighthouse output, screenshot, video, trace, browser profile, cache, or source map was committed.
- `backend/.env` and `backend/.env.production` remain ignored and untracked; only the redacted `backend/.env.example` is committed.
- Root, frontend, and backend production dependency audits each remain at `found 0 vulnerabilities`.
- The corrected ChatPDM and Coupyn Open Graph PNGs and their approved SVG source files are present.
- The PNGs are exact 1200 × 630 assets; the deterministic renderer loads the SVGs' exact local logo typefaces plus an Arial-compatible self-hosted face for card typography, checks for wordmark overlap, and directly rasterises each approved SVG without changing its internal artwork, layout, or composition.
- Secret and history checks recorded by the release qualification found no high-confidence credential or forbidden environment-path finding.

## Post-merge validation

The following checks were rerun from the clean merged `main` tree at `95b165a0e4f83cdb3b743ab4e513f4b5e1e67c44`:

| Validation | Exact result |
| ---------- | ------------ |
| Locked dependency installation | PASS — root 20 packages, frontend 622 packages, backend 173 packages installed from lockfiles with `--ignore-scripts`; all three install audits reported 0 vulnerabilities |
| Static checks | PASS — Angular `ngc --noEmit` and all 7 backend JavaScript syntax targets |
| Lint | PASS — Angular and backend ESLint, 0 errors |
| Frontend unit tests | PASS — 21 files, 99/99 tests |
| Backend unit tests | PASS — 38/38 tests; mocked or synthetic mail configuration only |
| Production dependency audits | PASS — root, frontend, and backend each reported `found 0 vulnerabilities` |
| Production build | PASS — browser initial bundle 499.39 kB raw/123.28 kB estimated transfer; SSR server bundle 852.56 kB |
| Artifact assertion | PASS — 116 browser files, hashed bundles, production API replacement, SSR entry, and 0 source maps |
| Production smoke | PASS — status, redirects, errors, CSP nonces, compression, caching, startup, and graceful shutdown |
| Diff hygiene | PASS — `git diff --check` |

No live SMTP request or real email delivery occurred during validation.

## Deployment status

- Code is merged to `main`.
- No dedicated-server deployment was performed.
- No dedicated-server directory was created.
- No nginx configuration was performed.
- No systemd or PM2 configuration was performed.
- No production secret was injected.
- No Cloudflare, DNS, TLS, or firewall change was performed.
- No live SMTP email was sent.
- Production deployment remains the next separate task and requires separate authorisation.

MAIN READY: PROCEED TO DEDICATED SERVER SETUP
