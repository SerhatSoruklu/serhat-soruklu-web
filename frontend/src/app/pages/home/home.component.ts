import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TooltipDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly browserWindow = this.isBrowser ? this.document.defaultView : null;

  get projectTitleTooltipPlacement(): 'top' | 'right' {
    return (this.browserWindow?.innerWidth ?? 0) >= 1024 ? 'right' : 'top';
  }
}
