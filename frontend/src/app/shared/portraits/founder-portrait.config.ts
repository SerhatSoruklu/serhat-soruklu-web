import type { ResolvedTheme } from '../../core/theme/theme.service';

export interface FounderPortrait {
  alt: string;
  src: string;
}

export const FOUNDER_PORTRAIT_WIDTH = 1973;
export const FOUNDER_PORTRAIT_HEIGHT = 797;

export const FOUNDER_PORTRAITS = {
  dark: {
    src: '/assets/home/serhat-soruklu-workstation-dark.png',
    alt: 'Serhat Soruklu, founder of Coupyn, seated at his workstation.',
  },
  light: {
    src: '/assets/home/serhat-soruklu-workstation-light.png',
    alt: 'Serhat Soruklu, founder of Coupyn, seated at his workstation.',
  },
} as const satisfies Record<ResolvedTheme, FounderPortrait>;
