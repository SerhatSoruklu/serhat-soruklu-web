import { Component, computed, inject, input } from '@angular/core';

import { ThemeService } from '../../core/theme/theme.service';
import { TooltipDirective } from '../tooltip/tooltip.directive';

@Component({
  selector: 'app-stervox-brand',
  imports: [TooltipDirective],
  template: `
    @if (linked()) {
      <a
        href="https://stervox.com"
        target="_blank"
        rel="noopener noreferrer"
        appTooltip="https://stervox.com"
        [appTooltipPlacement]="tooltipPlacement()"
        aria-label="Open Stervox.com in a new tab"
      >
        <img
          [class.dark]="!isLight()"
          [class.light]="isLight()"
          [src]="source()"
          width="410"
          height="65"
          alt="STERVOX"
        />
      </a>
    } @else {
      <img
        [class.dark]="!isLight()"
        [class.light]="isLight()"
        [src]="source()"
        width="410"
        height="65"
        alt="STERVOX"
      />
    }
  `,
  styleUrl: './stervox-brand.component.css',
})
export class StervoxBrandComponent {
  readonly linked = input(false);
  readonly tooltipPlacement = input<'top' | 'right' | 'bottom'>('right');
  private readonly theme = inject(ThemeService);
  readonly isLight = computed(() => this.theme.resolvedTheme() === 'light');
  readonly source = computed(() =>
    this.isLight()
      ? '/assets/projects/stervox/wordmark-light.svg'
      : '/assets/projects/stervox/wordmark-dark.svg',
  );
}
