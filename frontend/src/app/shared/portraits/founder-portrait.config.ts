import type { ResolvedTheme } from '../../core/theme/theme.service';

export interface FounderPortrait {
  alt: string;
  src: string;
  srcSet: string;
  avifSrcSet: string;
  nativeSrc: string;
  export8kSrc: string;
}

export const FOUNDER_PORTRAIT_WIDTH = 1846;
export const FOUNDER_PORTRAIT_HEIGHT = 852;

function officePortrait(theme: ResolvedTheme): FounderPortrait {
  const prefix = `/assets/portraits/serhat-soruklu-office-${theme}`;
  const widths = [640, 960, 1440, 1846];

  return {
    src: `${prefix}-1846.webp`,
    srcSet: widths.map(width => `${prefix}-${width}.webp ${width}w`).join(', '),
    avifSrcSet: widths.map(width => `${prefix}-${width}.avif ${width}w`).join(', '),
    nativeSrc: `${prefix}-native.png`,
    export8kSrc: `${prefix}-8k.png`,
    alt: 'AI-assisted portrait of Serhat Soruklu seated in his real office, based on his original selfie.',
  };
}

export const FOUNDER_PORTRAITS = {
  dark: officePortrait('dark'),
  light: officePortrait('light'),
} as const satisfies Record<ResolvedTheme, FounderPortrait>;

export function founderPortraitThemeForSource(path: string): ResolvedTheme | null {
  return (['dark', 'light'] as const).find(theme => {
    const portrait = FOUNDER_PORTRAITS[theme];

    return [portrait.srcSet, portrait.avifSrcSet].some(srcSet =>
      srcSet.split(',').some(source => source.trim().split(' ')[0] === path),
    );
  }) ?? null;
}
