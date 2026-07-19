# Serhat Soruklu Web Development Rules

This file defines project conventions for Codex, future AI agents, and human developers working in this repo.

## Scope

- Frontend is Angular, TypeScript, SSR-enabled.
- Backend is Node.js, Express, JavaScript.
- Do not create pages, navigation, footer, hero sections, cards, or visual content unless the task explicitly asks for them.
- Do not commit, push to GitHub, push to `main`, deploy, merge pull requests, or run deployment scripts unless the user explicitly asks for that action.
- Keep the visual system modern, clean, and restrained.
- Do not add Tailwind, Bootstrap, CSS variables, or heavy design-system tooling.
- All future Codex, AI agent, and human development must follow this file's theme palette, default dark identity, gold accent discipline, `20px` layout gutter rule, and responsive breakpoint strategy.
- Do not let pages or components invent their own color system, spacing system, or breakpoint set.

## Visual Theme

The official identity is premium systems architecture: black/deep navy with disciplined gold accents. The default theme is dark. Light theme and system preference support are allowed, but they must remain secondary to the dark identity.

Dark theme palette:

- Background: `#07090d`
- Surface: `#10141c`
- Text: `#f5f7fa`
- Muted text: `#a8b0bd`
- Gold accent: `#d6a84f`
- Soft gold: `#f0d58c`
- Border: `#252b36`

Light theme palette:

- Background: `#ffffff`
- Surface: `#f8f7f3`
- Text: `#111827`
- Muted text: `#5f6673`
- Gold accent: `#b8872f`
- Soft gold: `#e7c46f`
- Border: `#e5e0d6`

Theme CSS lives in `frontend/src/styles/theme.css` and is imported from `frontend/src/styles.css`. Use explicit classes and plain CSS values. Do not use CSS variables.

Theme classes:

- `.theme-dark` applies the dark palette.
- `.theme-light` applies the light palette.
- `.theme-system` may follow `prefers-color-scheme` through CSS only.

The application defaults to dark through global `body` styles. A future app shell may apply `.theme-dark`, `.theme-light`, or `.theme-system`, but browser-only theme logic must use Angular platform checks and must not access `window`, `document`, `localStorage`, or `sessionStorage` directly.

Gold usage is allowed for:

- logo accents
- link hover states
- small dividers
- selected navigation state
- badges
- key callouts

Gold usage is not allowed for:

- large backgrounds
- full sections
- excessive borders
- every button
- decorative noise

Use minimal theme utilities when useful:

- `.theme-background`
- `.theme-surface`
- `.theme-text`
- `.theme-muted`
- `.theme-border`
- `.theme-accent`
- `.theme-accent-soft`
- `.theme-link`

## Responsive Architecture

Use mobile-first CSS. Start with the smallest practical layout, then add media queries only when the layout needs more room.

Standard breakpoints:

- Mobile: `0px` to `767px`
- Tablet: `768px` and up
- Mini laptop: `1024px` and up
- Medium laptop: `1280px` and up
- Desktop: `1440px` and up
- Large desktop: `1728px` and up

These are coordination points, not a requirement to add every breakpoint to every component. Prefer the fewest breakpoints that make the layout correct.

## Global Spacing Rule

The website must not feel glued to screen edges. Default left and right layout gutters are `20px` across mobile, tablet, laptop, and desktop layouts.

Rules:

- Use `20px` left and right gutters for primary content containers.
- Components should inherit the page/container spacing instead of inventing local edge padding.
- Avoid edge-to-edge layouts unless the task explicitly calls for a deliberate full-bleed treatment.
- Center primary layout containers with `margin-left: auto` and `margin-right: auto`.
- Prefer responsive max-width containers over uncontrolled full-width stretching.
- Avoid random per-component spacing values and one-off magic numbers.
- Keep spacing predictable and quiet; the site should feel clean and Google-like, not decorative.

## Header Overlay Rule

The site header is a fixed transparent overlay at the top of the viewport.

New pages must start their first visual section behind the header so the header blends with the page/hero background at rest.

Do:

- Let the first section background extend underneath the header.
- Add enough top padding inside the first section so content does not collide with the header.
- Keep top/rest header transparent.
- Use the scrolled/header-active backing only for readability.

Do not:

- Add a blank top spacer just for the header.
- Add a solid page strip behind the header.
- Make first sections start below the header unless the page intentionally has no visual background.

## Frontend CSS Conventions

Do not dump all styling into `frontend/src/styles.css`. It should stay small and contain only imports for true global foundation styles.

Allowed in global styles:

- base `html` and `body` reset
- font smoothing and browser normalization
- global background and text defaults
- theme foundation classes
- responsive container and gutter utilities
- accessibility helpers
- shared low-level layout utilities only when genuinely reused

Not allowed in global styles:

- page section styling
- navigation or footer styling
- hero styling
- card-specific styling
- one-off component styling
- large visual layouts
- future page-specific responsive rules

Component-specific CSS belongs in that component's own CSS file. Page-specific CSS belongs in that page component's CSS file once pages exist.

Global layout utilities live in `frontend/src/styles/responsive-layout.css` and are imported from `frontend/src/styles.css`. Theme foundation utilities live in `frontend/src/styles/theme.css`.

Use these classes for future pages/components:

- `.layout-container` for normal centered content.
- `.layout-container--narrow` for reading-width content.
- `.layout-container--wide` for wider work surfaces.
- `.layout-section` for page sections that should span full width while containing centered inner content.
- `.layout-full-bleed` only when an intentional edge-to-edge layout is needed.

Do not use inline responsive hacks. If a layout rule will be reused, add it to the global layout utilities or a focused component stylesheet with the same breakpoint standards.

## SSR Safety

Angular code must be SSR-safe:

- Do not access `window`, `document`, `localStorage`, `sessionStorage`, or `navigator` directly.
- Use Angular platform checks for browser-only behavior.
- Keep global CSS static and browser-API free.

## Local Development Ports

The official persistent local development workflow is:

```bash
npm run dev
```

Default persistent local development ports:

- Angular SSR frontend: `4200`
- Express backend API: `3000`

These ports are the primary always-on development environment. Codex, AI agents, scripts, and temporary validation commands must not assume port `4200` or port `3000` is free because the developer may already have `npm run dev` running continuously.

Temporary runtime validation must use alternate ports.

Preferred temporary test ports:

- Angular SSR frontend test port: `4201`
- Express backend API test port: `3001`

Examples:

```bash
ng serve --port 4201
PORT=3001 npm --prefix backend run dev
```

Rules:

- Never kill active developer servers.
- Never replace the main `npm run dev` workflow.
- Never modify production environment values for temporary tests.
- Temporary test processes must shut down cleanly after validation.
- Use alternate ports for Playwright, end-to-end, and runtime smoke tests when needed.
- If both frontend and backend are tested together, use the `4201` and `3001` pair.

## GitHub Publish And Yeet Rules

GitHub publishing is opt-in only. Do not commit, push, deploy, create pull requests, merge pull requests, or publish anything to GitHub after normal edits unless the user explicitly asks for it.

Recognized explicit publish commands include:

- `push to GitHub`
- `push and deploy`
- `yeet deploy`
- `full live merge yeet`

For this repo, these phrases authorize the GitHub publish flow. Do not perform
separate manual production, Docker, PM2, Vercel, or infrastructure mutations
unless the user explicitly names that target. Merging into `main` still invokes
the repository's existing automatic production workflow as described below.

When a publish command is given, use this flow:

- Inspect `git status` and the diff before staging.
- Stage only the intended files.
- Run the required checks before committing or pushing so broken code is not published.
- At minimum, run `npm run lint`, `npm run build`, and `npm run check` from the repo root when those scripts exist.
- If a required check fails, fix it and rerun it before pushing. Do not push known-broken code unless the user explicitly overrides that rule.
- Commit with a clear message.
- Push to GitHub.
- If the work is on a feature branch or a pull request is appropriate, open or update the PR, review the PR status/checks, and merge into `main` only when the user requested the full merge flow and checks are clean.
- Use a unique, specific commit message and PR title/body that describe the actual change. Do not use vague messages like `update`, `changes`, `fix stuff`, or repeated boilerplate.
- PR descriptions should explain what changed, why it changed, how it was validated, and any remaining risk.
- Never stage unrelated user changes silently.

## Automatic Production Deployment

- Production deployment is automatic only after a change reaches `main` and the
  GitHub `CI` release-candidate gate passes. A feature-branch push alone is not
  deployed.
- The deployment uses a GitHub-hosted runner and the isolated
  `serhatsoruklu-deploy` account. Never reuse or modify Coupyn/ChatPDM runners,
  accounts, services, files, databases, or credentials. The sole exception is
  the explicitly approved `admin@coupyn.com` SMTP identity used by the Serhat
  contact form; this exception does not authorize any other Coupyn or ChatPDM
  access.
- Production uses the isolated `serhatsoruklu-frontend.service` and
  `serhatsoruklu-backend.service` systemd units, not PM2.
- Do not bypass the CI gate or manually SSH-deploy ordinary code changes. Expect
  a normal verified deployment to take about seven to eight minutes after the
  merge to `main`.
- `backend/.env.production` is intentionally ignored by Git. When its production
  values change, run `npm run publish:production-env` before merging into `main`.
  This updates the protected GitHub `production` Environment secret without
  committing or printing it; the next verified `main` deployment installs it.
- For a requested full live publish, monitor both the `main` CI run and the
  subsequent `Deploy production` run. Report success only after the public site
  and API respond successfully.

## Validation

Before committing frontend layout changes, run:

```bash
npm run lint
npm run build
npm run check
```
