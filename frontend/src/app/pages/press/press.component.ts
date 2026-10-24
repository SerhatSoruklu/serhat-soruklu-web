import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ThemeService } from '../../core/theme/theme.service';
import { pressContent, pressLightMedia } from './press.content';

@Component({
  selector: 'app-press',
  imports: [RouterLink],
  templateUrl: './press.component.html',
  styleUrl: './press.component.css',
})
export class PressComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly themeService = inject(ThemeService);
  readonly content = pressContent;
  readonly systemMedia = computed(() =>
    this.themeService.resolvedTheme() === 'light' ? pressLightMedia : pressContent,
  );

  constructor() {
    this.document.documentElement.lang = 'en-GB';
  }

  ngOnDestroy(): void {
    this.document.documentElement.lang = 'en';
  }
}
