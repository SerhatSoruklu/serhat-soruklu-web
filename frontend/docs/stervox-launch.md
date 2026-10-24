# Home launch countdown

The Home launch section uses a fixed target of **5 January 2027 at 00:00 UK time**
(GMT). It recalculates the remaining time from the current clock every second,
so refreshes and server restarts do not reset it. No database or browser storage
is needed. The server transfers its initial clock snapshot for stable hydration.
Hidden tabs pause the scheduled updates and resynchronise when visible again.
At the deadline the counter stops at zero and asks visitors to check release
status; it does not automatically claim that a product is live.

Each character rolls independently when its value changes, adapting the original
Stervox `hero-stage/money-odometer.ts`: a one-em vertical journey, opacity fade,
and one-second `cubic-bezier(.2,.65,.3,1)` motion. Static digits stay stationary,
and each full-height column softly fades the incoming and outgoing glyphs at
its edges, without a hard crop or centre divider. Reduced motion keeps the numerals static
while continuing to update the values. The timer does not announce every second
to screen readers.

January is the planned platform milestone, subject to readiness. Mobile apps
are separately described as planned for around May 2027. Store badges are
preview artwork, not links to unannounced listings.

Assets in `public/assets/projects/stervox/launch/`:

- `app-icon-{384,768}.webp`: optimised from the supplied original
  `/mnt/c/Users/coupy/Desktop/stervox-logo-app.png`.
- `uk-flag.svg`: original Stervox `client/public/flags/gb.svg`.
- Store badges: crisp SVG artwork using the Apple and Google Play symbols from
  the existing `simple-icons` dependency with explicit coming-soon labels.
- The linked wordmark reuses the existing theme-aware `StervoxBrandComponent`.
