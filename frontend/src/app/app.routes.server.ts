import { RenderMode, ServerRoute } from '@angular/ssr';

import { SITEMAP_ROUTES } from './core/seo/sitemap.config';

const indexableServerRoutes: ServerRoute[] = SITEMAP_ROUTES.map(({ path }) => ({
  path: path === '/' ? '' : path.slice(1),
  renderMode: RenderMode.Server,
}));

export const serverRoutes: ServerRoute[] = [
  ...indexableServerRoutes,
  {
    path: '**',
    renderMode: RenderMode.Server,
    status: 404,
  },
];
