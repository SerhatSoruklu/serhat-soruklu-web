/** Native PNGs preserve the generation outputs; previews are downscaled delivery copies. */
const profilePortraits = [
  {
    "name": "charcoal-suit-smile",
    "title": "Charcoal suit — warm smile",
    "width": 1254,
    "height": 1254,
    "bytes": 2097460,
    "alt": "AI-assisted portrait of Serhat Soruklu smiling in a charcoal suit and white shirt."
  },
  {
    "name": "navy-suit",
    "title": "Navy suit — neutral expression",
    "width": 1122,
    "height": 1402,
    "bytes": 2163161,
    "alt": "AI-assisted portrait of Serhat Soruklu with a neutral expression in a navy suit and dark shirt."
  },
  {
    "name": "outdoor-casual-smile",
    "title": "Outdoor portrait — subtle smile",
    "width": 1448,
    "height": 1086,
    "bytes": 2196545,
    "alt": "AI-assisted portrait of Serhat Soruklu with a subtle smile in a black T-shirt outdoors."
  },
  {
    "name": "white-shirt",
    "title": "White shirt — relaxed expression",
    "width": 1672,
    "height": 941,
    "bytes": 1954399,
    "alt": "AI-assisted portrait of Serhat Soruklu seated in a white shirt with a relaxed expression."
  }
] as const;

export const PROFILE_PORTRAITS = profilePortraits.map((portrait) => {
  const stem = `serhat-soruklu-ai-assisted-${portrait.name}`;
  const base = `/assets/portraits/profile/${stem}`;

  return {
    title: portrait.title,
    src: `${base}.png`,
    previewSrc: `${base}-800.webp`,
    avifSrcset: [480, 800].map((width) => `${base}-${width}.avif ${width}w`).join(', '),
    webpSrcset: [480, 800].map((width) => `${base}-${width}.webp ${width}w`).join(', '),
    alt: portrait.alt,
    assetLabel: 'AI-ASSISTED PORTRAIT',
    width: portrait.width,
    height: portrait.height,
    format: 'PNG' as const,
    fileSize: `${(portrait.bytes / (1024 * 1024)).toFixed(2)} MiB`,
    fileName: `${stem}.png`,
    provenance:
      `AI-assisted portrait created on 25 October 2026 using Serhat’s original selfie as the identity reference. Native output: ${portrait.width} × ${portrait.height}; clothing, setting and expression are generated or edited.`,
    export8k: null,
  };
});
