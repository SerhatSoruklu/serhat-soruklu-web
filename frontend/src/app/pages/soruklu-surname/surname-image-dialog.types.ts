import type { SurnameLanguage } from './soruklu-surname-language.service';

export interface SurnameImageAssets {
  readonly avif720?: string;
  readonly avif1200?: string;
  readonly height: number;
  readonly original: string;
  readonly presentation: 'dictionary' | 'document' | 'photograph';
  readonly webp720?: string;
  readonly webp1200?: string;
  readonly width: number;
}

export interface SurnameImageContent {
  readonly action: string;
  readonly actionAriaLabel: string;
  readonly alt: string;
  readonly chips: readonly { readonly icon: string; readonly label: string }[];
  readonly closeAriaLabel: string;
  readonly context: string;
  readonly contextLabel: string;
  readonly date: string;
  readonly dateLabel: string;
  readonly description: string;
  readonly dialogEyebrow: string;
  readonly htmlLang: string;
  readonly kicker: string;
  readonly location: string;
  readonly locationLabel: string;
  readonly sourceAction?: string;
  readonly sourceActionAriaLabel?: string;
  readonly sourceUrl?: string;
  readonly summary: string;
  readonly title: string;
}

export interface SurnameImageDialogData {
  readonly assets: SurnameImageAssets;
  readonly content: Record<SurnameLanguage, SurnameImageContent>;
}
