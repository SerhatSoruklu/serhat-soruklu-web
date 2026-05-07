# Serhat Soruklu Web Development Rules

This file defines project conventions for Codex, future AI agents, and human developers working in this repo.

## Scope

- Frontend is Angular, TypeScript, SSR-enabled.
- Backend is Node.js, Express, JavaScript.
- Do not create pages, navigation, footer, hero sections, cards, or visual content unless the task explicitly asks for them.
- Keep the visual system modern, clean, and restrained.
- Do not add Tailwind, Bootstrap, CSS variables, or heavy design-system tooling.
- All future Codex, AI agent, and human development must follow this file's theme palette, default dark identity, gold accent discipline, `20px` layout gutter rule, and responsive breakpoint strategy.
- Do not let pages or components invent their own color system, spacing system, or breakpoint set.

## Visual Theme

The official identity is premium systems engineering: black/deep navy with disciplined gold accents. The default theme is dark. Light theme and system preference support are allowed, but they must remain secondary to the dark identity.

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

## Validation

Before committing frontend layout changes, run:

```bash
npm run lint
npm run build
npm run check
```
