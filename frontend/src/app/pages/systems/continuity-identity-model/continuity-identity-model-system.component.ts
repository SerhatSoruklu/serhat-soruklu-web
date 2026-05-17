import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  mdiBriefcaseOutline,
  mdiCheckDecagramOutline,
  mdiClipboardCheckOutline,
  mdiCodeBraces,
  mdiConsoleLine,
  mdiDatabaseOutline,
  mdiFileDocumentOutline,
  mdiFileImageOutline,
  mdiSitemapOutline,
  mdiTransitConnectionVariant
} from '@mdi/js';

import { TopNavigationService } from '../../../core/navigation/top-navigation.service';
import { HEADER_NAV_ITEMS } from '../../../layout/site-header/header-icons';

@Component({
  selector: 'app-continuity-identity-model-system',
  imports: [MatIconModule, RouterLink],
  templateUrl: './continuity-identity-model-system.component.html',
  styleUrls: ['../research-system-page.css', './continuity-identity-model-system.component.css']
})
export class ContinuityIdentityModelSystemComponent {
  readonly githubUrl = 'https://github.com/SerhatSoruklu/continuity-identity-model';
  readonly githubIconPath = HEADER_NAV_ITEMS.find((item) => item.path === '/github')?.iconPath ?? '';
  readonly topNavigation = inject(TopNavigationService);

  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    this.registerCtaIcons();
  }

  private registerCtaIcons(): void {
    const icons = {
      'cim-flow-decision': mdiCheckDecagramOutline,
      'cim-flow-runner': mdiConsoleLine,
      'cim-flow-spec': mdiFileDocumentOutline,
      'cim-flow-target': mdiTransitConnectionVariant,
      'cim-flow-vectors': mdiDatabaseOutline,
      'cim-flow-verifier': mdiClipboardCheckOutline,
      'cim-repo-audit': mdiClipboardCheckOutline,
      'cim-repo-core': mdiCodeBraces,
      'cim-repo-images': mdiFileImageOutline,
      'cim-repo-spec': mdiFileDocumentOutline,
      'research-cta-systems': mdiSitemapOutline,
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
