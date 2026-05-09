import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, PLATFORM_ID, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

import { PortraitDialogComponent } from '../../shared/dialogs/portrait-dialog/portrait-dialog.component';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TooltipDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly document = inject(DOCUMENT);
  private readonly dialog = inject(MatDialog);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly browserWindow = this.isBrowser ? this.document.defaultView : null;

  readonly projectTitleTooltipPlacement = signal<'top' | 'right'>(this.getProjectTitleTooltipPlacement());

  @HostListener('window:resize')
  updateProjectTitleTooltipPlacement(): void {
    this.projectTitleTooltipPlacement.set(this.getProjectTitleTooltipPlacement());
  }

  openPortraitDialog(): void {
    if (!this.isBrowser) {
      return;
    }

    this.dialog.open(PortraitDialogComponent, {
      id: 'portrait-dialog',
      ariaLabelledBy: 'portrait-dialog-title',
      autoFocus: 'dialog',
      backdropClass: 'serhat-portrait-dialog-backdrop',
      closeOnNavigation: true,
      delayFocusTrap: false,
      disableClose: false,
      enterAnimationDuration: 160,
      exitAnimationDuration: 110,
      maxHeight: 'calc(100dvh - 24px)',
      maxWidth: 'calc(100vw - 24px)',
      panelClass: 'serhat-portrait-dialog-panel',
      restoreFocus: true,
      width: 'min(960px, calc(100vw - 40px))'
    });
  }

  private getProjectTitleTooltipPlacement(): 'top' | 'right' {
    return (this.browserWindow?.innerWidth ?? 0) >= 1024 ? 'right' : 'top';
  }
}
