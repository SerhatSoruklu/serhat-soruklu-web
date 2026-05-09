import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // NOSONAR: Angular Material dialog animations are intentionally loaded lazily.

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { SeoTitleStrategy } from './core/seo/seo-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(), // NOSONAR: keeps animation code lazy while Angular deprecates provider-based animations.
    { provide: TitleStrategy, useClass: SeoTitleStrategy },
  ],
};
