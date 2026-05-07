# Serhat Soruklu Web Development Rules

This file defines project conventions for Codex, future AI agents, and human developers working in this repo.

## Scope

- Frontend is Angular, TypeScript, SSR-enabled.
- Backend is Node.js, Express, JavaScript.
- Do not create pages, navigation, footer, hero sections, cards, or visual content unless the task explicitly asks for them.
- Keep the visual system modern, clean, and restrained.
- Do not add Tailwind, Bootstrap, CSS variables, or heavy design-system tooling.

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

Global layout utilities live in `frontend/src/styles/responsive-layout.css` and are imported from `frontend/src/styles.css`.

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
