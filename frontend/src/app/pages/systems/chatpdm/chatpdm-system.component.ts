import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  mdiAlertOctagonOutline,
  mdiArrowRight,
  mdiBlockHelper,
  mdiCheckCircleOutline,
  mdiClipboardCheckOutline,
  mdiCodeBraces,
  mdiCompareHorizontal,
  mdiFileTreeOutline,
  mdiFilterCheckOutline,
  mdiFormatListChecks,
  mdiLockCheckOutline,
  mdiShieldCheckOutline,
  mdiSitemapOutline,
  mdiSourceBranch,
  mdiSwapHorizontal,
  mdiTextBoxOutline,
  mdiTransitConnectionVariant,
  mdiTuneVariant
} from '@mdi/js';

import { TopNavigationService } from '../../../core/navigation/top-navigation.service';

@Component({
  selector: 'app-chatpdm-system',
  imports: [MatIconModule, RouterLink],
  templateUrl: './chatpdm-system.component.html',
  styleUrl: './chatpdm-system.component.css'
})
export class ChatpdmSystemComponent {
  readonly chatpdmUrl = 'https://chatpdm.com';
  readonly topNavigation = inject(TopNavigationService);

  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    this.registerIcons();
  }

  private registerIcons(): void {
    const icons = {
      'chatpdm-arrow': mdiArrowRight,
      'chatpdm-core-boundary': mdiSitemapOutline,
      'chatpdm-core-consistency': mdiCompareHorizontal,
      'chatpdm-core-refusal': mdiBlockHelper,
      'chatpdm-core-resolution': mdiCheckCircleOutline,
      'chatpdm-exists-constraint': mdiLockCheckOutline,
      'chatpdm-exists-drift': mdiSwapHorizontal,
      'chatpdm-exists-language': mdiTextBoxOutline,
      'chatpdm-principle-bound': mdiFileTreeOutline,
      'chatpdm-principle-deterministic': mdiTransitConnectionVariant,
      'chatpdm-principle-drift': mdiShieldCheckOutline,
      'chatpdm-principle-failure': mdiAlertOctagonOutline,
      'chatpdm-principle-meaning': mdiClipboardCheckOutline,
      'chatpdm-principle-refusal': mdiBlockHelper,
      'chatpdm-runtime-classify': mdiSourceBranch,
      'chatpdm-runtime-input': mdiTextBoxOutline,
      'chatpdm-runtime-parse': mdiCodeBraces,
      'chatpdm-runtime-refuse': mdiBlockHelper,
      'chatpdm-runtime-resolve': mdiCheckCircleOutline,
      'chatpdm-runtime-validate': mdiFilterCheckOutline,
      'chatpdm-signal-constraints': mdiFormatListChecks,
      'chatpdm-signal-governance': mdiTuneVariant,
      'chatpdm-signal-safe': mdiShieldCheckOutline
    };

    for (const [name, path] of Object.entries(icons)) {
      this.iconRegistry.addSvgIconLiteral(
        name,
        this.sanitizer.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="${path}"/></svg>`) // NOSONAR: icon paths are compile-time constants from @mdi/js, not user input.
      );
    }
  }
}
