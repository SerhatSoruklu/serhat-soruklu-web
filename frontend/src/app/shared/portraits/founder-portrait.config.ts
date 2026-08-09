import type { ResolvedTheme } from '../../core/theme/theme.service';

export interface FounderPortrait {
  alt: string;
  src: string;
}

export const FOUNDER_PORTRAIT_WIDTH = 1448;
export const FOUNDER_PORTRAIT_HEIGHT = 1086;

export const FOUNDER_PORTRAITS = {
  dark: {
    src: '/assets/home/serhat-soruklu-founder-dark.png',
    alt: 'Serhat Soruklu seated at his workstation in a dark office.',
  },
  light: {
    src: '/assets/home/serhat-soruklu-founder-light.png',
    alt: 'Serhat Soruklu seated at his workstation in a bright office.',
  },
} as const satisfies Record<ResolvedTheme, FounderPortrait>;
