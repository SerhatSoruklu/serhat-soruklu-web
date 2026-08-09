import { NgClass } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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
  mdiWeb,
} from '@mdi/js';

import { ThemeService } from '../../../core/theme/theme.service';
import { PathIconComponent } from '../../icons/path-icon.component';
import {
  FOUNDER_PORTRAIT_HEIGHT,
  FOUNDER_PORTRAITS,
  FOUNDER_PORTRAIT_WIDTH,
} from '../../portraits/founder-portrait.config';
import { PortraitDialogChip, PortraitDialogFocusPoint } from './portrait-dialog.types';

@Component({
  selector: 'app-portrait-dialog',
  imports: [PathIconComponent, NgClass],
  templateUrl: './portrait-dialog.component.html',
  styleUrl: './portrait-dialog.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class PortraitDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<PortraitDialogComponent>>(MatDialogRef);

  readonly themeService = inject(ThemeService);
  readonly isLightPortrait = computed(() => this.themeService.resolvedTheme() === 'light');
  readonly portrait = computed(() => FOUNDER_PORTRAITS[this.themeService.resolvedTheme()]);
  readonly portraitHeight = FOUNDER_PORTRAIT_HEIGHT;
  readonly portraitWidth = FOUNDER_PORTRAIT_WIDTH;
  readonly iconPaths = {
    architecture: mdiSitemapOutline,
    briefcase: mdiBriefcaseOutline,
    close: mdiClose,
    rocket: mdiRocketLaunchOutline,
  } as const;
  readonly focusPoints: PortraitDialogFocusPoint[] = [
    {
      label: 'deterministic architecture',
      iconName: 'portrait-architecture',
      iconPath: mdiSitemapOutline,
    },
    { label: 'operational clarity', iconName: 'portrait-clarity', iconPath: mdiMagnifyScan },
    {
      label: 'infrastructure ownership',
      iconName: 'portrait-infrastructure',
      iconPath: mdiServerNetwork,
    },
    {
      label: 'scalable web platforms',
      iconName: 'portrait-platforms',
      iconPath: mdiTransitConnectionVariant,
    },
    {
      label: 'safe system behavior',
      iconName: 'portrait-safety',
      iconPath: mdiShieldCheckOutline,
    },
  ];
  readonly currentSystems: PortraitDialogChip[] = [
    {
      label: 'Coupyn.com',
      href: 'https://coupyn.com',
      iconName: 'portrait-domain',
      iconPath: mdiWeb,
    },
    {
      label: 'ChatPDM.com',
      href: 'https://chatpdm.com',
      iconName: 'portrait-domain',
      iconPath: mdiWeb,
    },
  ];
  readonly chips: PortraitDialogChip[] = [
    { label: 'Angular', iconName: 'portrait-code', iconPath: mdiCodeTags },
    { label: 'Node.js', iconName: 'portrait-code', iconPath: mdiCodeTags },
    { label: 'MongoDB', iconName: 'portrait-database', iconPath: mdiDatabaseOutline },
    { label: 'OVH', iconName: 'portrait-server', iconPath: mdiServerNetwork },
    { label: 'SSR', iconName: 'portrait-platforms', iconPath: mdiTransitConnectionVariant },
    { label: 'SEO', iconName: 'portrait-seo', iconPath: mdiMagnifyScan },
  ];

  close(): void {
    this.dialogRef.close();
  }
}
