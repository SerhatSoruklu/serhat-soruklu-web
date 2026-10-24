import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TopNavigationService } from '../../../core/navigation/top-navigation.service';
import { StervoxArchitectureComponent } from '../../../shared/stervox-architecture/stervox-architecture.component';
import { StervoxBrandComponent } from '../../../shared/stervox-brand/stervox-brand.component';
import { StervoxCardShowcaseComponent } from './card-showcase/stervox-card-showcase.component';

@Component({
  selector: 'app-stervox-system',
  imports: [StervoxArchitectureComponent, RouterLink, StervoxBrandComponent, StervoxCardShowcaseComponent],
  templateUrl: './stervox-system.component.html',
  styleUrl: './stervox-system.component.css',
})
export class StervoxSystemComponent {
  readonly topNavigation = inject(TopNavigationService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('engineeringSection')
  private readonly engineeringSection?: ElementRef<HTMLElement>;

  scrollToEngineering(event: MouseEvent): void {
    if (!this.isBrowser || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const reducedMotion = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true;
    this.engineeringSection?.nativeElement.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
  }
}
