import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TopNavigationService } from '../../core/navigation/top-navigation.service';
import { PortraitDialogService } from '../../shared/dialogs/portrait-dialog/portrait-dialog.service';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TooltipDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly document = inject(DOCUMENT);
  private readonly portraitDialog = inject(PortraitDialogService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly browserWindow = this.isBrowser ? this.document.defaultView : null;

  readonly projectTitleTooltipPlacement = signal<'top' | 'right'>(this.getProjectTitleTooltipPlacement());
  readonly topNavigation = inject(TopNavigationService);

  @HostListener('window:resize')
  updateProjectTitleTooltipPlacement(): void {
    this.projectTitleTooltipPlacement.set(this.getProjectTitleTooltipPlacement());
  }

  openPortraitDialog(): void {
    if (!this.isBrowser) {
      return;
    }

    void this.portraitDialog.open();
  }

  private getProjectTitleTooltipPlacement(): 'top' | 'right' {
    return (this.browserWindow?.innerWidth ?? 0) >= 1024 ? 'right' : 'top';
  }
}
