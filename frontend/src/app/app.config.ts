import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // NOSONAR: Angular Material dialog animations are intentionally loaded lazily.

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { SeoTitleStrategy } from './core/seo/seo-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    provideClientHydration(),
    provideAnimationsAsync(), // NOSONAR: keeps animation code lazy while Angular deprecates provider-based animations.
    { provide: TitleStrategy, useClass: SeoTitleStrategy },
  ],
};
