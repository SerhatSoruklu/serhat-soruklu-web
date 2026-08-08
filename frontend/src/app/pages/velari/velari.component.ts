import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  mdiArrowRight,
  mdiArrowTopRight,
  mdiCursorDefaultClickOutline,
  mdiInstagram,
} from '@mdi/js';

import { IdentityLanguageService } from '../../core/identity/identity-language.service';
import { TopNavigationService } from '../../core/navigation/top-navigation.service';
import { pageSeoMetadata } from '../../core/seo/seo.config';
import { SeoService } from '../../core/seo/seo.service';
import { PathIconComponent } from '../../shared/icons/path-icon.component';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';
import { velariContent } from './velari.content';

@Component({
  selector: 'app-velari',
  imports: [PathIconComponent, RouterLink, TooltipDirective],
  templateUrl: './velari.component.html',
  styleUrl: './velari.component.css',
})
export class VelariComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly identityLanguage = inject(IdentityLanguageService);
  private readonly seoService = inject(SeoService);

  readonly topNavigation = inject(TopNavigationService);
  readonly language = this.identityLanguage.language;
  readonly content = computed(() => velariContent[this.language()]);
  readonly emblemPath = '/assets/brand/velari/velari-faith-emblem.jpg';
  readonly emblemSrcset =
    '/assets/brand/velari/velari-faith-emblem-540.webp 540w, /assets/brand/velari/velari-faith-emblem-1080.webp 1080w';
  readonly instagramUrl = 'https://www.instagram.com/velarifaith/';
  readonly cursorClickIcon = mdiCursorDefaultClickOutline;
  readonly iconPaths: Readonly<Record<string, string>> = {
    'velari-arrow': mdiArrowRight,
    'velari-external': mdiArrowTopRight,
    'velari-instagram': mdiInstagram,
  };

  constructor() {
    effect(() => {
      this.language();
      this.applyLanguageMetadata();
    });
  }

  ngOnDestroy(): void {
    this.document.documentElement.lang = 'en';
  }

  toggleLanguage(): void {
    this.identityLanguage.toggleLanguage();
  }

  private applyLanguageMetadata(): void {
    const content = this.content();

    this.document.documentElement.lang = content.htmlLang;
    this.seoService.setMetadata({
      title: content.seo.title,
      description: content.seo.description,
      canonicalUrl: pageSeoMetadata.velari.path,
      ogImage: pageSeoMetadata.velari.ogImage,
      ogImageAlt: pageSeoMetadata.velari.ogImageAlt,
      ogImageHeight: pageSeoMetadata.velari.ogImageHeight,
      ogImageType: pageSeoMetadata.velari.ogImageType,
      ogImageWidth: pageSeoMetadata.velari.ogImageWidth,
      locale: this.language() === 'tr' ? 'tr_TR' : 'en_GB',
      robots: 'index, follow',
    });
  }
}
