import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mdiCursorDefaultClickOutline } from '@mdi/js';
import { siX } from 'simple-icons';

import { IdentityLanguageService } from '../../core/identity/identity-language.service';
import { pageSeoMetadata } from '../../core/seo/seo.config';
import { SeoService } from '../../core/seo/seo.service';
import { PathIconComponent } from '../../shared/icons/path-icon.component';
import { orderContent } from './soruklu-order.content';

@Component({
  selector: 'app-soruklu-order',
  imports: [PathIconComponent, RouterLink],
  templateUrl: './soruklu-order.component.html',
  styleUrl: './soruklu-order.component.css',
})
export class SorukluOrderComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly identityLanguage = inject(IdentityLanguageService);
  private readonly seoService = inject(SeoService);

  readonly language = this.identityLanguage.language;
  readonly content = computed(() => orderContent[this.language()]);
  readonly emblemPath = '/assets/brand/soruklu-order/the-soruklu-order-emblem.png';
  readonly officialXUrl = 'https://x.com/sorukluorder';
  readonly xIconPath = siX.path;
  readonly cursorClickIcon = mdiCursorDefaultClickOutline;

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
      canonicalUrl: pageSeoMetadata.sorukluOrder.path,
      ogImage: pageSeoMetadata.sorukluOrder.ogImage,
      ogImageAlt: pageSeoMetadata.sorukluOrder.ogImageAlt,
      ogImageHeight: pageSeoMetadata.sorukluOrder.ogImageHeight,
      ogImageType: pageSeoMetadata.sorukluOrder.ogImageType,
      ogImageWidth: pageSeoMetadata.sorukluOrder.ogImageWidth,
      locale: this.language() === 'tr' ? 'tr_TR' : 'en_GB',
      robots: 'index, follow',
    });
  }
}
