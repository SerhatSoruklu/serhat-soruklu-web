import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SeoService } from './core/seo/seo.service';
import { ThemeService } from './core/theme/theme.service';
import { SiteHeaderComponent } from './layout/site-header/site-header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly seoService = inject(SeoService);
  private readonly themeService = inject(ThemeService);

  constructor() {
    this.seoService.initializeRouteMetadata();
    this.themeService.setting();
  }
}
