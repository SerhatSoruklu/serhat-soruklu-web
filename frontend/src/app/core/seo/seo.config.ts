import { environment } from '../../../environments/environment';

export const seoConfig = {
  siteName: 'Serhat Soruklu',
  defaultTitle: 'Serhat Soruklu',
  titleSuffix: 'Serhat Soruklu',
  defaultDescription: 'Personal platform, writing hub, and systems architecture portfolio of Serhat Soruklu.',
  canonicalBaseUrl: environment.siteUrl,
  defaultOgImage: '',
  twitterHandle: '',
  authorName: 'Serhat Soruklu',
  defaultLocale: 'en_GB'
} as const;
