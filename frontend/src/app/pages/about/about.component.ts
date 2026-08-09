import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  mdiArrowRight,
  mdiArrowTopRight,
  mdiCursorDefaultClickOutline,
  mdiDomain,
  mdiGithub,
  mdiIdentifier,
  mdiLinkedin,
  mdiPostOutline,
  mdiTextBoxOutline,
} from '@mdi/js';

import { IdentityLanguageService } from '../../core/identity/identity-language.service';
import { SeoService } from '../../core/seo/seo.service';
import { PathIconComponent } from '../../shared/icons/path-icon.component';
import { aboutContent } from './about.content';
import { AboutProfileDialogService } from './about-profile-dialog/about-profile-dialog.service';

interface PublicProfile {
  readonly icon: string;
  readonly label: string;
  readonly personal: boolean;
  readonly url: string;
}

@Component({
  selector: 'app-about',
  imports: [PathIconComponent, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly identityLanguage = inject(IdentityLanguageService);
  private readonly profileDialog = inject(AboutProfileDialogService);
  private readonly seoService = inject(SeoService);

  readonly language = this.identityLanguage.language;
  readonly content = computed(() => aboutContent[this.language()]);
  readonly portraitPath = '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png';
  readonly iconPaths = {
    arrow: mdiArrowRight,
    click: mdiCursorDefaultClickOutline,
    external: mdiArrowTopRight,
  } as const;
  readonly profiles: readonly PublicProfile[] = [
    {
      icon: mdiGithub,
      label: 'GitHub',
      personal: true,
      url: 'https://github.com/SerhatSoruklu',
    },
    {
      icon: mdiLinkedin,
      label: 'LinkedIn',
      personal: true,
      url: 'https://www.linkedin.com/in/serhatsoruklu/',
    },
    {
      icon: mdiIdentifier,
      label: 'ORCID',
      personal: true,
      url: 'https://orcid.org/0009-0006-8963-5986',
    },
    {
      icon: mdiPostOutline,
      label: 'DEV Community',
      personal: true,
      url: 'https://dev.to/coupyn',
    },
    {
      icon: mdiTextBoxOutline,
      label: 'Hashnode',
      personal: true,
      url: 'https://hashnode.com/@serhatsoruklu',
    },
    {
      icon: mdiTextBoxOutline,
      label: 'Medium',
      personal: true,
      url: 'https://medium.com/@coupyn',
    },
    {
      icon: mdiDomain,
      label: 'Coupyn',
      personal: false,
      url: 'https://coupyn.com/',
    },
  ];

  constructor() {
    effect(() => {
      const content = this.content();

      this.document.documentElement.lang = content.htmlLang;
      this.seoService.applyAboutRuntimeMetadata({
        description: content.seo.description,
        inLanguage: content.htmlLang,
        locale: this.language() === 'tr' ? 'tr_TR' : 'en_GB',
        portraitAlt: content.hero.portraitAlt,
        title: content.seo.title,
      });
    });
  }

  ngOnDestroy(): void {
    this.document.documentElement.lang = 'en';
  }

  toggleLanguage(): void {
    this.identityLanguage.toggleLanguage();
  }

  openProfileDialog(): void {
    void this.profileDialog.open();
  }
}
