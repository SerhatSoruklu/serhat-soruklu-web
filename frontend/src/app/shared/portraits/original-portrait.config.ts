/** The PNG is the supplied, unedited photograph; display files are format/size derivatives. */
export const ORIGINAL_PORTRAIT = {
  original: '/assets/portraits/serhat-soruklu-real-selfie.png',
  src: '/assets/portraits/serhat-soruklu-real-selfie-1022.webp',
  width: 1022,
  height: 1533,
  avifSrcset: [480, 800, 1022]
    .map((width) => `/assets/portraits/serhat-soruklu-real-selfie-${width}.avif ${width}w`)
    .join(', '),
  webpSrcset: [480, 800, 1022]
    .map((width) => `/assets/portraits/serhat-soruklu-real-selfie-${width}.webp ${width}w`)
    .join(', '),
} as const;
