import { Component, inject } from '@angular/core';

import {
  IdentityLanguage,
  IdentityLanguageService,
} from '../../core/identity/identity-language.service';

@Component({
  selector: 'app-identity-language-selector',
  templateUrl: './identity-language-selector.component.html',
  styleUrl: './identity-language-selector.component.css',
})
export class IdentityLanguageSelectorComponent {
  readonly identityLanguage = inject(IdentityLanguageService);

  selectLanguage(language: IdentityLanguage, event: MouseEvent): void {
    event.stopPropagation();
    this.identityLanguage.setLanguage(language);
  }
}
