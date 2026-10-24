# Founder portrait assets · 24 October 2026

The original photograph is `public/assets/portraits/serhat-soruklu-real-selfie.png`.
It is a byte-for-byte copy of the user-supplied `serhat-soruklu-real-selfie.png`
(1022 × 1533). No retouching, relighting, crop or generative edit was applied to
that original. SHA-256:
`991dee27d82e54bdceb578a0541bae402d4b8eee46189d155a139251f5fa992d`.

The two office composites were created using the built-in OpenAI image generation
tool, with this selfie as the identity reference and the supplied
`office-background.jpg` (8160 × 3768) as the office reference. The light variant
also referenced the approved dark composition. They are AI-assisted images,
including the seated pose, clothing, lighting and tidied right side of the room;
they are not unaltered photographs. Prompts are recorded in
`founder-portrait-dark-prompt.txt` and `founder-portrait-light-prompt.txt`.

The tool returned **1846 × 852** native PNGs. It exposed no selectable model
version or resolution parameter. Do not describe the results as native 4K/8K or
as generated with a verified “2.5” model. No claim is made about embedded Content
Credentials.

## Files and delivery

All portrait deliverables live under `public/assets/portraits/`:

- `serhat-soruklu-real-selfie.png`: unchanged supplied original, 2.68 MiB.
- `serhat-soruklu-office-{dark,light}-native.png`: untouched generation outputs,
  1846 × 852, approximately 1.88 / 2.00 MiB.
- `serhat-soruklu-office-{dark,light}-8k.png`: 7680 × 3545 PNG exports,
  approximately 11.45 / 12.79 MiB. These are Lanczos upscales of the native
  outputs, adding no native detail. They are explicit downloads, never page
  previews or preloads.
- Office AVIF/WebP display variants at 640, 960, 1440 and 1846 pixels wide.
  Their sizes are approximately 56–306 KiB, depending on size/theme/format.
- Original-photo AVIF/WebP display variants at 480, 800 and 1022 pixels wide,
  approximately 51–198 KiB. These are compressed display copies; the original
  PNG is the source and download.

Display copies use Pillow Lanczos resizing, WebP quality 95/method 6 and AVIF
quality 90/speed 4 with 4:4:4 chroma. They preserve the complete composition.
Compression is high quality but is not described as lossless. Native PNGs and the
supplied original remain available without a re-encode.

Home's early theme preload and picture sources use the same responsive AVIF
widths and sizes. The expanded dialog selects a larger display variant. About
and Press use responsive previews, with lazy loading away from the hero. The
About and Press social SVGs embed the new original; their raster previews are
rendered through `render-system-social-previews.mjs --sync-embedded-portraits`.
