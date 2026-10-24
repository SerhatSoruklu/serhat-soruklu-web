# Stervox concept-card teaser

The portfolio teaser uses the Everyday, Gold and Business Reserve front/back
pairs from the supplied `Stervox-Concept-Cards/_redesign/web-showcase` Issue 03
archive, dated 5 October 2026. All six images were inspected before integration:
the cardholder text is “YOUR NAME” and the backs use the “Example” signature.
These are concept designs, not issued or valid payment cards.

`public/assets/projects/stervox/cards/*-front.webp` and `*-back.webp` are
byte-for-byte copies of that archive's 1200px WebP files. The `*-600.webp` files
are display derivatives, resized proportionally with Pillow Lanczos and WebP
quality 92/method 6. Neither branding nor cardholder details were edited. The
native PNG masters remain in the supplied archive. Page loading uses responsive,
lazy-loaded WebP sources; both sides are shared with the decorative underlay so
flipping does not require a new image download.

The layout adapts Stervox's `membership-plans.css`, `membership-showcase.ts` and
`membership-motion.ts` from its Home membership section: separate underlay,
isolated rotor, 1400px perspective, 780ms rotation and a midpoint face-visibility
switch for Safari. Explicit component CSS replaces the original CSS variables.
The image windows exclude the studio backdrop using the original Everyday/Gold
crop percentages and a matching Business Reserve window. Source images remain
intact. No WebGL, pointer-move loop or animation dependency is used.

Native buttons support click, tap, Enter and Space, with independent state and
accessible side/action labels. Reduced motion removes transitions and the
decorative SVG drift. Three columns begin at 1024px; tablets use two columns
with the final card centred, and phones use a single column. The teaser sits
between the product-experience and technical-stack sections on `/systems/stervox`.

The card-face magnifier displays a 2.5× circular detail window. Mouse hover tracks
the pointer in the untransformed artwork plane, including on the reverse side.
Touch users can hold for 380ms and slide; moving before that threshold keeps
ordinary page scrolling. Releasing inspection does not flip the card. Keyboard
users can press `+`, pan with arrows, and close with Escape or `-`.

The lens loads the existing 1200px WebP on demand. It paints the source crop as
one CSS background layer to avoid oversized-image compositing problems inside
the 3D rotor. Pointer updates are limited to one animation frame and run outside
Angular change detection. Flipping, leaving, scrolling, losing focus, resizing
and navigating away reset inspection and cancel pending frames/timers. No CSS
variables or additional image assets are required.
