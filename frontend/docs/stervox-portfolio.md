# Stervox portfolio integration

Public route: `/systems/stervox`. Added on 24 October 2026, directly after Coupyn in Home, Work, Systems, the footer, mobile navigation and project lists. About includes a dedicated English/Turkish section below Coupyn. Press includes development facts and downloadable SVG/PNG artwork. Stervox enquiry links select the matching contact topic; the backend accepts that topic through its existing validated contact flow.

## Publication status

Stervox is coming soon, in architecture, design and foundation development. Its planned launch is **5 January 2027**, supplied by the founder. This is a target, not a statement of live availability. Never automatically change status to production when that date arrives. Review actual release evidence and confirmed product scope before changing copy or structured data.

The ten-year planning horizon is 2026–2036. The public rollout is a summary of direction, not a newly committed schedule. Partner accounts/cards remain later conditional product Phase 6. Commercial traction, regulated permissions and production reliability are not inferred from the plan.

## Claim evidence reviewed

Sources are in the founder's existing Desktop `stervox` and `Stervox-Map` folders. They are read-only research inputs; no implementation or private configuration there was changed or published.

| Public statement | Local evidence | Scope |
| --- | --- | --- |
| Integer minor units, explicit currency, checked addition | `stervox/client/src/core/money.ts`, `server/include/voxcore/money.h`, `server/src/core/money.c`, `server/tests/test_money.c` | Existing primitives and test source inspected; Stervox core tests were not run as part of this portfolio task. |
| Balanced journals, immutable history and linked compensating entries | `Stervox-Map/revisions/text/VOXCORE_Ledger_Master_v0.1.md`, corrected R1 | Design intent; production ledger not implemented. Public snippets are labelled illustrative. |
| Operation keys, request fingerprints and reconciliation of uncertain results | Same ledger specification; corrected `STERVOX-2036-Master-Execution-Map.md`, VOXCORE architecture | Design requirements; no deployed deduplication guarantee. |
| In-house KYC decisions distinguish evidence, policy and human review | `stervox/server/src/modules/onboarding/kyc/README.md` | Explicitly design-only scaffold. |
| C foundation and PostgreSQL authority | `stervox/AGENTS.md`, `README.md`, server ADRs referenced by the execution map | Architecture choice, not production financial capability. |
| Ten-year roadmap, initial product direction and later cards | `Stervox-Map/00-START-HERE.md`, `DECISIONS.md`, corrected execution map | Planning evidence, not passed gates or completed integrations. |

No private roadmap documents, risk registers, credentials, internal financial projections or customer data are copied into public assets. The founder quotation is editorial copy based on the founder's supplied brief.

## Branding and SEO

The two Stervox wordmark SVGs under `public/assets/projects/stervox/` derive from the source client’s official outlined assets. Their letter geometry and E accent are preserved; trademark outlines were removed and the viewBox tightened at the founder’s request. `StervoxBrandComponent` uses the existing SSR-safe ThemeService to select one theme-appropriate image; its stylesheet controls sizing.

Social source: `public/assets/social/serhat-soruklu-systems-stervox-og.svg`. Regenerate the 1200 × 630 PNG with:

```bash
npm --prefix frontend run render:system-social-previews -- serhat-soruklu-systems-stervox-og.png
```

If the artwork changes, update the displayed download sizes in `press.content.ts`. Route metadata includes canonical/Open Graph/Twitter information; structured data describes a CreativeWork in development. Runtime and static sitemaps include the route, and SSR/production checks cover its status and artwork.

Browser review artifacts belong under ignored `output/playwright/`. Temporary validation uses port 4201; no persistent developer server or production configuration is replaced.


VOXCORE and VOXFINANCE use the existing `/public/brand/` SVG exports from the local `stervox-coming-soon` site. Its snapshot manifest identifies these as local vector equivalents of the supplied ribbon-V reference, not recovered authoritative original vectors. The ribbon-V and name outlines are reused; trademark outlines were removed at the founder’s request. Light variants change the name ink only. Public copy does not claim a separate live VOXFINANCE service. Its design is the financial-data and intelligence layer described in section 5 of the corrected execution map.

The source-backed stack is C17, libevent, libpq and PostgreSQL, with TypeScript for web presentation. It is not MySQL. C gives explicit resource ownership; the prose does not treat a language choice as proof of determinism or reliability. The page architecture diagram has light/dark SVGs; the social source embeds the same conceptual product/core/intelligence/state map.

The final footer uses ordinary text for all project names, with a Coming soon badge only for Stervox. The homepage wordmark is restrained to 180–260px across viewports.

The homepage now uses an inline SVG ownership diagram styled with the existing Coupyn/ChatPDM diagram primitives. It connects Stervox, VOXCORE, identity, VOXFINANCE, ledger, PostgreSQL and evidence nodes; the caption explicitly says planned architecture. At 1024px and above the footer reserves sufficient width for Stervox and its badge to share a row.

## Final validation

Root lint, type checks, production build, artifact verification and production SSR smoke checks passed. Frontend unit tests passed (171); backend tests passed (40). The homepage diagram suite passed all 11 cases, including the new Stervox figure. Final Chromium, Firefox and WebKit checks each covered 11 viewport widths from 320px through 1920px on Home and Stervox (66 page layouts total), with no clipping, oversize/duplicate homepage logos, or page exceptions. Desktop footer badge alignment was measured at every desktop width. All three engines also passed light/dark switching, disclosure interaction, mobile navigation and Stervox contact-topic preselection at mobile, tablet and desktop sizes. Existing integration pages were checked across six representative widths.

No Git commit, push, merge or deployment was performed. Private development files and persistent developer servers were not changed.


## Navigation and visual refinement

The public action is consistently **Explore Stervox** and keeps the internal `/systems/stervox` destination. Linked Stervox wordmarks open `https://stervox.com` with the same accessible tooltip used by Coupyn; standalone Visit links were removed. Home keeps the personal hero and a project preview; the detail route renders its own hero and project content.

Shell route state now starts from the authoritative router/Angular Location rather than a potentially stale document path. A regression test constructs the shell after initial Stervox navigation, checks that Home is absent, and verifies returning to Home. Stervox has its own continuous atmosphere from the first section through the footer. Full-width section seams and the footer's top divider are omitted on this route.

The shared SVG uses a distinct orbital ownership diagram, animated through opacity, transforms and stroke offsets; it has no scroll listener or animated blur. Hover effects apply only to suitable pointers. Reduced-motion preferences disable orbit/flow/pulse animations and hover translation. Static light/dark SVGs and the SEO preview contain the same updated constellation. The mountain source, exact generation prompt, native-resolution limitation and production encodings are documented in [stervox-mountain-artwork.md](stervox-mountain-artwork.md).
