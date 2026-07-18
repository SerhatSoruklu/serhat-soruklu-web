import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  mdiAccountGroupOutline,
  mdiChartBar,
  mdiCheckDecagramOutline,
  mdiChevronRight,
  mdiCodeBraces,
  mdiDatabaseOutline,
  mdiDomain,
  mdiFormatListGroup,
  mdiGiftOutline,
  mdiMagnify,
  mdiShieldCheckOutline,
  mdiSitemapOutline,
  mdiTagMultipleOutline,
  mdiTransitConnectionVariant,
  mdiTuneVariant
} from '@mdi/js';

import { TopNavigationService } from '../../../core/navigation/top-navigation.service';

@Component({
  selector: 'app-coupyn-system',
  imports: [MatIconModule, RouterLink],
  templateUrl: './coupyn-system.component.html',
  styleUrl: './coupyn-system.component.css'
})
export class CoupynSystemComponent {
  readonly coupynUrl = 'https://coupyn.com';
  readonly topNavigation = inject(TopNavigationService);

  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    this.registerIcons();
  }

  private registerIcons(): void {
    const icons = {
      'coupyn-architecture-api': mdiCodeBraces,
      'coupyn-architecture-data': mdiDatabaseOutline,
      'coupyn-architecture-directory': mdiSitemapOutline,
      'coupyn-architecture-dynamic': mdiTransitConnectionVariant,
      'coupyn-architecture-frontend': mdiDomain,
      'coupyn-architecture-seo': mdiMagnify,
      'coupyn-arrow': mdiChevronRight,
      'coupyn-snapshot-categories': mdiFormatListGroup,
      'coupyn-snapshot-companies': mdiDomain,
      'coupyn-snapshot-directory': mdiSitemapOutline,
      'coupyn-snapshot-industries': mdiTagMultipleOutline,
      'coupyn-snapshot-ranking': mdiChartBar,
      'coupyn-snapshot-submissions': mdiAccountGroupOutline,
      'coupyn-trust-community': mdiAccountGroupOutline,
      'coupyn-trust-quality': mdiCheckDecagramOutline,
      'coupyn-trust-ranking': mdiTuneVariant,
      'coupyn-trust-shield': mdiShieldCheckOutline,
      'coupyn-what-deals': mdiGiftOutline,
      'coupyn-what-directory': mdiSitemapOutline,
      'coupyn-what-search': mdiMagnify,
      'coupyn-what-submit': mdiAccountGroupOutline
    };

    for (const [name, path] of Object.entries(icons)) {
      this.iconRegistry.addSvgIconLiteral(
        name,
        this.sanitizer.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="${path}"/></svg>`) // NOSONAR: icon paths are compile-time constants from @mdi/js, not user input.
      );
    }
  }
}
