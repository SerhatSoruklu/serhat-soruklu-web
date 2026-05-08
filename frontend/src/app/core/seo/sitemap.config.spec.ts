import { SITEMAP_ROUTES } from './sitemap.config';

describe('SITEMAP_ROUTES', () => {
  it('defines stable sitemap metadata for every public route', () => {
    expect(SITEMAP_ROUTES).toEqual([
      {
        path: '/',
        lastModified: '2026-05-08',
        changeFrequency: 'weekly',
        priority: 1.0
      },
      {
        path: '/work',
        lastModified: '2026-05-08',
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
    ]);
  });

  it('keeps sitemap paths unique and absolute-date based', () => {
    const paths = SITEMAP_ROUTES.map((route) => route.path);

    expect(new Set(paths).size).toBe(paths.length);
    expect(SITEMAP_ROUTES.every((route) => /^\d{4}-\d{2}-\d{2}$/.test(route.lastModified))).toBe(true);
  });
});
