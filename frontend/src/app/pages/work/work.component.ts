import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  mdiApi,
  mdiClipboardCheckOutline,
  mdiCloudOutline,
  mdiDatabaseOutline,
  mdiEmailOutline,
  mdiHammerWrench,
  mdiNoteTextOutline,
  mdiShieldCheckOutline,
  mdiSitemapOutline,
  mdiSync,
  mdiTimelineCheckOutline,
  mdiWeb
} from '@mdi/js';

import { TopNavigationService } from '../../core/navigation/top-navigation.service';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';

@Component({
  selector: 'app-work',
  imports: [MatIconModule, RouterLink, TooltipDirective],
  templateUrl: './work.component.html',
  styleUrl: './work.component.css'
})
export class WorkComponent {
  readonly topNavigation = inject(TopNavigationService);

  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    this.registerCtaIcons();
  }

  private registerCtaIcons(): void {
    const icons = {
      'work-execution-audit': mdiClipboardCheckOutline,
      'work-execution-build': mdiHammerWrench,
      'work-execution-constraint': mdiTimelineCheckOutline,
      'work-execution-outcome': mdiSync,
      'work-production-delivery': mdiHammerWrench,
      'work-cta-contact': mdiEmailOutline,
      'work-cta-systems': mdiSitemapOutline,
      'work-cta-writing': mdiNoteTextOutline,
      'work-scope-api': mdiApi,
      'work-scope-data': mdiDatabaseOutline,
      'work-scope-frontend': mdiWeb,
      'work-scope-infrastructure': mdiCloudOutline,
      'work-scope-product': mdiSitemapOutline,
      'work-scope-trust': mdiShieldCheckOutline
    };

    for (const [name, path] of Object.entries(icons)) {
      this.iconRegistry.addSvgIconLiteral(
        name,
        this.sanitizer.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="${path}"/></svg>`) // NOSONAR: icon paths are compile-time constants from @mdi/js, not user input.
      );
    }
  }
}
