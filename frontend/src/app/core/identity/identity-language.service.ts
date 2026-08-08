import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

import { SorukluSurnameLanguageService } from '../../pages/soruklu-surname/soruklu-surname-language.service';

export type IdentityLanguage = 'en' | 'tr';

const IDENTITY_LANGUAGE_STORAGE_KEY = 'serhatsoruklu-identity-language';
const SURNAME_LANGUAGE_STORAGE_KEY = 'serhatsoruklu-surname-language';

@Injectable({ providedIn: 'root' })
export class IdentityLanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly browserWindow = this.isBrowser ? this.document.defaultView : null;
  private readonly surnameLanguage = inject(SorukluSurnameLanguageService);
  private readonly languageValue = signal<IdentityLanguage>(this.readSavedLanguage());

  readonly language = this.languageValue.asReadonly();

  constructor() {
    this.surnameLanguage.language.set(this.languageValue());
    this.saveLanguage(this.languageValue());

    effect(() => {
      const language = this.surnameLanguage.language();

      if (language !== this.languageValue()) {
        this.languageValue.set(language);
        this.saveLanguage(language);
      }
    });
  }

  setLanguage(language: IdentityLanguage): void {
    if (this.switchRenderedSurnamePage(language)) {
      return;
    }

    this.languageValue.set(language);
    this.surnameLanguage.language.set(language);
    this.saveLanguage(language);
  }

  toggleLanguage(): void {
    this.setLanguage(this.languageValue() === 'en' ? 'tr' : 'en');
  }

  private readSavedLanguage(): IdentityLanguage {
    if (!this.browserWindow) {
      return 'en';
    }

    try {
      const savedIdentityLanguage = this.browserWindow.localStorage.getItem(
        IDENTITY_LANGUAGE_STORAGE_KEY,
      );

      if (savedIdentityLanguage === 'en' || savedIdentityLanguage === 'tr') {
        return savedIdentityLanguage;
      }

      const savedSurnameLanguage = this.browserWindow.sessionStorage.getItem(
        SURNAME_LANGUAGE_STORAGE_KEY,
      );

      return savedSurnameLanguage === 'tr' ? 'tr' : 'en';
    } catch {
      return 'en';
    }
  }

  private saveLanguage(language: IdentityLanguage): void {
    if (!this.browserWindow) {
      return;
    }

    try {
      this.browserWindow.localStorage.setItem(IDENTITY_LANGUAGE_STORAGE_KEY, language);
      this.browserWindow.sessionStorage.setItem(SURNAME_LANGUAGE_STORAGE_KEY, language);
    } catch {
      // The Identity language control remains functional when storage is unavailable.
    }
  }

  private switchRenderedSurnamePage(language: IdentityLanguage): boolean {
    if (!this.browserWindow || this.surnameLanguage.language() === language) {
      return false;
    }

    const pageLanguageSwitch = this.document.querySelector<HTMLButtonElement>(
      '[data-testid="surname-language-switch"]',
    );

    if (!pageLanguageSwitch) {
      return false;
    }

    pageLanguageSwitch.click();
    return true;
  }
}
