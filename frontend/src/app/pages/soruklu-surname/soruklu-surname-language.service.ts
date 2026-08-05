import { Injectable, signal } from '@angular/core';

export type SurnameLanguage = 'en' | 'tr';

@Injectable({ providedIn: 'root' })
export class SorukluSurnameLanguageService {
  readonly language = signal<SurnameLanguage>('en');
}
