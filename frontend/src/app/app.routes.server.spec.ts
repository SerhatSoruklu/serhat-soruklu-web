import { RenderMode } from '@angular/ssr';

import { serverRoutes } from './app.routes.server';
import { SITEMAP_ROUTES } from './core/seo/sitemap.config';

describe('serverRoutes', () => {
  it('renders every indexable sitemap route with the normal success status', () => {
    const indexableRoutes = serverRoutes.slice(0, -1);

    expect(indexableRoutes).toEqual(
      SITEMAP_ROUTES.map(({ path }) => ({
        path: path === '/' ? '' : path.slice(1),
        renderMode: RenderMode.Server,
      })),
    );
  });

  it('renders every non-indexable path through Angular with HTTP 404', () => {
    expect(serverRoutes.at(-1)).toEqual({
      path: '**',
      renderMode: RenderMode.Server,
      status: 404,
    });
  });
});
