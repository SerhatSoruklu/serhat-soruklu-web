import { PROFILE_PORTRAITS } from '../../shared/portraits/profile-portraits.config';

export type SitemapChangeFrequency = 'weekly' | 'monthly';

export interface SitemapRoute {
  path: string;
  lastModified: string;
  changeFrequency: SitemapChangeFrequency;
  priority: number;
  images?: readonly string[];
}

// Keep lastModified stable. Update it only for meaningful public content,
// SEO structure, page intent, or major visible page revisions.
export const SITEMAP_ROUTES = [
  {
    path: '/',
    lastModified: '2026-10-24',
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    path: '/about',
    lastModified: '2026-10-25',
    changeFrequency: 'monthly',
    priority: 0.9,
    images: ['/assets/portraits/serhat-soruklu-real-selfie.png'],
  },
  {
    path: '/press',
    lastModified: '2026-10-25',
    changeFrequency: 'monthly',
    priority: 0.6,
    images: [
      '/assets/portraits/serhat-soruklu-real-selfie.png',
      ...PROFILE_PORTRAITS.map((portrait) => portrait.src),
    ],
  },
  {
    path: '/work',
    lastModified: '2026-10-24',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/systems',
    lastModified: '2026-10-24',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/systems/coupyn',
    lastModified: '2026-05-10',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/systems/stervox',
    lastModified: '2026-10-24',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/systems/chatpdm',
    lastModified: '2026-05-10',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/systems/codaris',
    lastModified: '2026-09-28',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/systems/deterministic-boundary-firewall',
    lastModified: '2026-08-09',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/systems/continuity-identity-model',
    lastModified: '2026-08-09',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/writing',
    lastModified: '2026-08-09',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/github',
    lastModified: '2026-08-09',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/soruklu-surname',
    lastModified: '2026-08-09',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/soruklu-order',
    lastModified: '2026-08-09',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/velari',
    lastModified: '2026-08-09',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/contact',
    lastModified: '2026-08-09',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
] as const satisfies readonly SitemapRoute[];
