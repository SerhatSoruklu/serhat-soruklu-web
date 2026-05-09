import { NgClass } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import {
  mdiBriefcaseOutline,
  mdiClose,
  mdiCodeTags,
  mdiDatabaseOutline,
  mdiMagnifyScan,
  mdiRocketLaunchOutline,
  mdiServerNetwork,
  mdiShieldCheckOutline,
  mdiSitemapOutline,
  mdiTransitConnectionVariant,
  mdiWeb
} from '@mdi/js';

import { ThemeService } from '../../../core/theme/theme.service';
import { PortraitDialogChip, PortraitDialogFocusPoint } from './portrait-dialog.types';

@Component({
  selector: 'app-portrait-dialog',
  imports: [MatIconModule, NgClass],
  templateUrl: './portrait-dialog.component.html',
  styleUrl: './portrait-dialog.component.css',
  encapsulation: ViewEncapsulation.None
})
export class PortraitDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<PortraitDialogComponent>>(MatDialogRef);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  readonly themeService = inject(ThemeService);
  readonly isLightPortrait = computed(() => this.themeService.resolvedTheme() === 'light');
  readonly focusPoints: PortraitDialogFocusPoint[] = [
    { label: 'deterministic architecture', icon: 'portrait-architecture' },
    { label: 'operational clarity', icon: 'portrait-clarity' },
    { label: 'infrastructure ownership', icon: 'portrait-infrastructure' },
    { label: 'scalable web platforms', icon: 'portrait-platforms' },
    { label: 'safe system behavior', icon: 'portrait-safety' }
  ];
  readonly currentSystems: PortraitDialogChip[] = [
    { label: 'Coupyn.com', href: 'https://coupyn.com', icon: 'portrait-domain' },
    { label: 'ChatPDM.com', href: 'https://chatpdm.com', icon: 'portrait-domain' }
  ];
  readonly chips: PortraitDialogChip[] = [
    { label: 'Angular', icon: 'portrait-code' },
    { label: 'Node.js', icon: 'portrait-code' },
    { label: 'MongoDB', icon: 'portrait-database' },
    { label: 'OVH', icon: 'portrait-server' },
    { label: 'SSR', icon: 'portrait-platforms' },
    { label: 'SEO', icon: 'portrait-seo' }
  ];

  constructor() {
    this.registerIcons();
  }

  close(): void {
    this.dialogRef.close();
  }

  private registerIcons(): void {
    const icons = {
      'portrait-architecture': mdiSitemapOutline,
      'portrait-briefcase': mdiBriefcaseOutline,
      'portrait-clarity': mdiMagnifyScan,
      'portrait-close': mdiClose,
      'portrait-code': mdiCodeTags,
      'portrait-database': mdiDatabaseOutline,
      'portrait-domain': mdiWeb,
      'portrait-infrastructure': mdiServerNetwork,
      'portrait-platforms': mdiTransitConnectionVariant,
      'portrait-rocket': mdiRocketLaunchOutline,
      'portrait-safety': mdiShieldCheckOutline,
      'portrait-server': mdiServerNetwork,
      'portrait-seo': mdiMagnifyScan
    };

    for (const [name, path] of Object.entries(icons)) {
      this.iconRegistry.addSvgIconLiteral(
        name,
        this.sanitizer.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="${path}"/></svg>`) // NOSONAR: icon paths are compile-time constants from @mdi/js, not user input.
      );
    }
  }
}
