export type SitemapChangeFrequency = 'weekly' | 'monthly';

export interface SitemapRoute {
  path: string;
  lastModified: string;
  changeFrequency: SitemapChangeFrequency;
  priority: number;
}

// Keep lastModified stable. Update it only for meaningful public content,
// SEO structure, page intent, or major visible page revisions.
export const SITEMAP_ROUTES = [
  {
    path: '/',
    lastModified: '2026-05-08',
    changeFrequency: 'weekly',
    priority: 1.0
  },
  {
    path: '/work',
    lastModified: '2026-05-15',
    changeFrequency: 'monthly',
    priority: 0.8
  },
  {
    path: '/systems',
    lastModified: '2026-05-08',
    changeFrequency: 'monthly',
    priority: 0.8
  },
  {
    path: '/systems/coupyn',
    lastModified: '2026-05-10',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    path: '/systems/chatpdm',
    lastModified: '2026-05-10',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    path: '/systems/deterministic-boundary-firewall',
    lastModified: '2026-05-15',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    path: '/systems/continuity-identity-model',
    lastModified: '2026-05-15',
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    path: '/writing',
    lastModified: '2026-05-08',
    changeFrequency: 'monthly',
    priority: 0.8
  },
  {
    path: '/github',
    lastModified: '2026-05-08',
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    path: '/contact',
    lastModified: '2026-05-08',
    changeFrequency: 'monthly',
    priority: 0.7
  }
] as const satisfies readonly SitemapRoute[];
