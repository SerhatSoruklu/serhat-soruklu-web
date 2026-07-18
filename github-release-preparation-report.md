<!-- markdownlint-disable MD013 -->

# GitHub Release Preparation Report

Preparation date: 18 July 2026

Repository: `SerhatSoruklu/serhat-soruklu-web`

Pull request: <https://github.com/SerhatSoruklu/serhat-soruklu-web/pull/14>

## 1. Outcome

GITHUB RELEASE CANDIDATE READY FOR REVIEW

The release-candidate code is verified at `bb1500668b2712ce5ddaca13c99e455a2e43def9`. All seven GitHub checks on that exact head are green, including the complete release-candidate gate, SonarQube analysis, and SonarCloud Code Analysis. The Sonar credential was renewed and the findings from the first authenticated analysis were fixed in source without skipping, weakening, or suppressing the quality gate. Pull request 14 remains deliberately open and unmerged for review.

## 2. Recovery evidence

The final pre-commit recovery set is external to the repository:

| Recovery item | Path | SHA-256 |
| ------------- | ---- | ------- |
| Tracked modifications patch | `/tmp/serhatsoruklu-release-backup-20260718-final-dycT9FXP/tracked-modifications.patch` | `d8d9a7b13f4aaef16c11c749afc67d8bee7712edeee4b2a6e1f876421fa11856` |
| Required untracked-file archive | `/tmp/serhatsoruklu-release-backup-20260718-final-dycT9FXP/untracked-release-files.tar.gz` | `5bda4fedc3c62af30d951c7319406b1d0ec4689da5f54608d10f5fe633d586ae` |

The archive contains the 59 required files that were untracked at the backup point. Both backup artifacts are mode `600` inside a mode `700` directory. The archive member list was checked: no real `.env`, production environment, credential, build, test-result, coverage, browser-profile, screenshot, video, or trace path entered it. The tracked patch contains no secret file. Secret values were never printed.

## 3. Git evidence

- Starting branch: `main`
- Starting SHA: `3f1f4f98fcbec5b79b51e0fdd63b365e3c616462`
- Release branch: `release/serhatsoruklu-production-ready-2026-07-18`
- Pushed application-code evidence SHA: `39dcab09037d0b89173873e00aab63e3b5dbcdcc`
- Final verified release-candidate SHA: `bb1500668b2712ce5ddaca13c99e455a2e43def9`
- Pull request: <https://github.com/SerhatSoruklu/serhat-soruklu-web/pull/14>
- Target branch: `main`
- Pull-request state: open, ready for review, and deliberately unmerged

The logical commits through the verified release-candidate code head are:

| SHA | Commit |
| --- | ------ |
| `473eaa9cfa9737fff8fd52faac9214e1507790bc` | `feat(content): add public pages and release assets` |
| `789dc17fe36c56d8a669d9f3d5cf6b09cce002b3` | `feat(contact): harden contact delivery and readiness` |
| `2d59a6b3d6047ff9306ccd1d9616c038090c9ce7` | `fix(ssr): harden routing security and production runtime` |
| `138e0b5095f87d784d86ff51ebe87a991313804c` | `fix(navigation-seo): correct navigation and search metadata` |
| `c16daff4233f6b5732df5c4434c65f387fcba182` | `ci(release): enforce reproducible release validation` |
| `fa90023f1f5a5faeb8d469520caae9dfa8bc6578` | `docs(release): add production readiness records` |
| `e3310f38bb88e42db3a06b7a9d0a48f4797c0a74` | `test(contact): stabilize hydrated form interaction` |
| `54e98bbc618db5c70fd7936207a0c5953648980c` | `test(dialog): wait for portrait transition state` |
| `19f44d0a8d0d2f5f765de9d0cc44a4f6566ad441` | `docs(readme): satisfy markdown lint` |
| `b355cb8af678c8f25ad88645ea60ac51cddc72e6` | `fix(ci): make theme and security checks deterministic` |
| `c980b40c7b5efa421fb98d883b81c29ad248ee75` | `fix(ci): provide scanner runtime and harden script matching` |
| `894eb113d8cd751beef10e50d3ca65c57b533ee2` | `fix(ci): keep local browser smoke on HTTP` |
| `39dcab09037d0b89173873e00aab63e3b5dbcdcc` | `test(e2e): stabilize animated and loading states` |
| `d12fadc6febda9af651c6e427fab1f7d56ed781d` | `docs(release): record GitHub release preparation` |
| `7b7e7a9d3c00893cd7db27e92e1f647a71f917a0` | `Fix Sonar security and reliability gate` |
| `bb1500668b2712ce5ddaca13c99e455a2e43def9` | `Allowlist canonical redirect targets` |

This report is carried by one final explicit-path documentation commit after the verified code head. Its immutable SHA is recorded by the release branch and PR head because a commit cannot embed its own SHA without changing that SHA; the final operator handoff records the exact pushed head and confirms it matches GitHub.

Every commit was staged from an explicit path list. Before each commit, the cached path set, cached diff, `git diff --cached --check`, allowlist membership, environment-file exclusion, and generated-artifact exclusion were verified. No reset, clean, force push, history rewrite, broad add, CI bypass, merge, or deployment was used.

## 4. Release boundary

The documented baseline was 133 release-critical files: 74 modified required files and 59 untracked required files. The final committed boundary is 140 files: 78 modified files and 62 added files, with no deletion.

The seven added paths relative to the documented baseline are:

1. `frontend/public/assets/social/serhat-soruklu-systems-chatpdm-og.svg` — tracked source corrected for the ChatPDM preview composition.
2. `frontend/public/assets/social/serhat-soruklu-systems-coupyn-og.svg` — tracked source corrected for the Coupyn preview composition.
3. `frontend/tests/e2e/portrait-dialog.spec.ts` — deterministic browser regression coverage for the CSS crossfade transition found by full validation.
4. `frontend/src/app/shared/dialogs/portrait-dialog/portrait-dialog.component.spec.ts` — deterministic theme-state isolation found by CI.
5. `github-release-preparation-report.md` — required release-preparation evidence.
6. `backend/start.js` — explicit production entrypoint separated from the importable backend server module.
7. `frontend/src/app/shared/icons/path-icon.component.ts` — safe compile-time SVG path rendering without an Angular sanitisation bypass.

Removed paths versus the documented baseline: none.

The regenerated ChatPDM and Coupyn PNGs were already in the original 59-file untracked allowlist; their two SVG sources explain the OG-related count change. Both PNGs are exact 1200 × 630, visually contained, uncropped, non-overlapping, readable, evenly padded, and consistent with the existing premium dark black/gold/blue identity.

All required source, configuration, tests, documentation, and assets are committed. The local and paginated GitHub PR path sets match. No real environment file, credential, generated build, test result, coverage file, browser profile, Lighthouse report, screenshot, trace, video, cache, or source map is introduced by the release diff. `backend/.env` and `backend/.env.production` remain ignored and untracked; only the redacted `backend/.env.example` is committed.

## 5. Tests and audits

| Gate | Exact result |
| ---- | ------------ |
| Locked installs | 3/3 clean lockfile installs passed: root, frontend, backend |
| Lint | 2/2 targets passed with 0 errors: Angular and backend ESLint |
| Static checks | 1 Angular `ngc --noEmit` project and 7 backend JavaScript syntax targets passed |
| Frontend unit | 21 files, 99/99 tests passed |
| Backend unit | 38/38 tests passed; no live SMTP delivery |
| Chromium E2E | 207/207 passed with 0 retries against the development SSR test server |
| Production-artifact Chromium E2E | 207/207 passed with 0 retries against the final built SSR artifact |
| Firefox smoke | 12/12 local route cases passed |
| WebKit CI smoke | 12/12 route cases passed after CI installed the required native dependencies |
| Production route/runtime audit | 48/48 direct/reload route loads passed across 2 viewports; 944 link and 164 button observations; 0 console, page, or network errors |
| Production build | Passed; browser initial bundle 499.39 kB raw/123.28 kB estimated transfer and SSR server bundle 852.56 kB |
| Production artifact assertion | Passed: 116 browser files, hashed bundles, production API replacement, SSR entry, and 0 emitted source maps |
| Production HTTP smoke | Passed headers, CSP nonce uniqueness, compression, caching, status/redirect semantics, startup, and graceful shutdown |
| Dependency audits | 3/3 production and 3/3 full-tree audits passed with `found 0 vulnerabilities` |
| Secret scans | 0 high-confidence findings in 252 release source files; 0 in valid branch/tag/remote history; 0 sensitive environment-path commits |
| Markdown lint | 5/5 changed Markdown files passed with 0 issues |
| Diff hygiene | `git diff --check` passed |

Local WebKit could not launch because this WSL host lacks required native GTK, GStreamer, and libevent libraries and the task prohibited OS-package changes. No application case was misreported as a local pass. GitHub CI installs browser host dependencies with Playwright's `--with-deps` path and executed all 12 WebKit route cases.

The final local production build, artifact assertion, and production smoke validation were rerun after the Sonar remediation. The ignored deployable output remains uncommitted.

## 6. CI result

| GitHub check | Final status | Evidence |
| ------------ | ------------ | -------- |
| CodeQL | PASS | Workflow configuration query passed after the script-element matching regression was fixed |
| Analyze JavaScript and TypeScript | PASS | Code scanning completed successfully |
| Release candidate gate | PASS | Locked installs, lint, static checks, 137 unit tests, 207 Chromium E2E cases, 24 Firefox/WebKit smoke cases, audit, build, artifact assertion, production smoke, and artifact upload passed |
| GitGuardian Security Checks | PASS | GitGuardian reported success |
| Repository summary | PASS | Repository summary job completed successfully |
| SonarQube analysis | PASS | Credential rotation authenticated; tests, coverage, build, scanner execution, and analysis acceptance completed successfully |
| SonarCloud Code Analysis | PASS | New reliability, security, and maintainability ratings are A; coverage is 81.8%; duplication is 0.5%; security-hotspot review is 100% |

The renewed token exposed genuine quality-gate findings after the first authenticated scan. The remediation removed Angular sanitisation bypasses, eliminated reflected redirect input through a fixed route allowlist, replaced insecure random identifiers with Web Crypto, corrected reliability and accessibility defects, and separated the backend production entrypoint from its importable server module. The final scan and every other check are green on `bb1500668b2712ce5ddaca13c99e455a2e43def9`.

## 7. Remaining deployment work

No deployment or production-infrastructure action was performed. Specifically, this pass did not perform:

- dedicated-server directory creation;
- nginx configuration;
- systemd or PM2 setup;
- production secret injection;
- firewall configuration;
- Cloudflare, DNS, or TLS changes;
- production deployment; or
- live SMTP delivery.

The dedicated-server folder does not currently exist, nginx is not configured, frontend/backend production services have not been created, production secrets have not been injected, the public Cloudflare 520 remains unresolved, and no live SMTP test has been performed. Those remain a later, separately authorised deployment phase. That phase must use the exact reviewed Git SHA/artifact and retain a known-good prior artifact and matching configuration for rollback.

## 8. Next exact action

Review pull request 14. Its verified code parent is `bb1500668b2712ce5ddaca13c99e455a2e43def9`; the final report-only head is recorded in the operator handoff. If intended, explicitly authorise merging pull request 14 into `main`. Dedicated-server or production deployment remains a separate authorisation and must not be inferred from this GitHub publication.

GITHUB PR READY FOR REVIEW: ALL REQUIRED CHECKS PASS
