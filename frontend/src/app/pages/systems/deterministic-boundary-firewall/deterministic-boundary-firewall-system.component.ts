import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  mdiBlockHelper,
  mdiBriefcaseOutline,
  mdiBugOutline,
  mdiCheckCircleOutline,
  mdiClipboardCheckOutline,
  mdiCompareHorizontal,
  mdiHubOutline,
  mdiLockCheckOutline,
  mdiSitemapOutline,
  mdiSwapHorizontal,
  mdiTextBoxOutline,
  mdiTransitConnectionVariant
} from '@mdi/js';

import { TopNavigationService } from '../../../core/navigation/top-navigation.service';
import { HEADER_NAV_ITEMS } from '../../../layout/site-header/header-icons';

@Component({
  selector: 'app-deterministic-boundary-firewall-system',
  imports: [MatIconModule, RouterLink],
  templateUrl: './deterministic-boundary-firewall-system.component.html',
  styleUrls: ['../research-system-page.css', './deterministic-boundary-firewall-system.component.css']
})
export class DeterministicBoundaryFirewallSystemComponent {
  readonly githubPath = '/github';
  readonly githubIconPath = HEADER_NAV_ITEMS.find((item) => item.path === '/github')?.iconPath ?? '';
  readonly topNavigation = inject(TopNavigationService);

  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    this.registerCtaIcons();
  }

  private registerCtaIcons(): void {
    const icons = {
      'dbf-attack-surface': mdiBugOutline,
      'dbf-boundary-client': mdiCompareHorizontal,
      'dbf-boundary-gate': mdiLockCheckOutline,
      'dbf-boundary-normalize': mdiTextBoxOutline,
      'dbf-boundary-refusal': mdiBlockHelper,
      'dbf-boundary-release': mdiCheckCircleOutline,
      'dbf-boundary-transport': mdiSwapHorizontal,
      'dbf-boundary-tripwire': mdiTransitConnectionVariant,
      'dbf-proof-docs': mdiSitemapOutline,
      'dbf-proof-quality': mdiCheckCircleOutline,
      'dbf-proof-tests': mdiClipboardCheckOutline,
      'research-cta-chatpdm': mdiHubOutline,
      'research-cta-work': mdiBriefcaseOutline
    };

    for (const [name, path] of Object.entries(icons)) {
      this.iconRegistry.addSvgIconLiteral(
        name,
        this.sanitizer.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="${path}"/></svg>`) // NOSONAR: icon paths are compile-time constants from @mdi/js, not user input.
      );
    }
  }
}
