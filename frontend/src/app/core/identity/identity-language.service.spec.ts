import { TestBed } from '@angular/core/testing';

import { SorukluSurnameLanguageService } from '../../pages/soruklu-surname/soruklu-surname-language.service';
import { IdentityLanguageService } from './identity-language.service';

describe('IdentityLanguageService', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
  });

  it('defaults to English and saves one language for all Identity routes', () => {
    const service = TestBed.inject(IdentityLanguageService);
    const surnameLanguage = TestBed.inject(SorukluSurnameLanguageService);

    expect(service.language()).toBe('en');
    expect(surnameLanguage.language()).toBe('en');

    service.setLanguage('tr');

    expect(service.language()).toBe('tr');
    expect(surnameLanguage.language()).toBe('tr');
    expect(globalThis.localStorage.getItem('serhatsoruklu-identity-language')).toBe('tr');
    expect(globalThis.sessionStorage.getItem('serhatsoruklu-surname-language')).toBe('tr');
  });

  it('restores a saved Identity language and prepares the surname route before navigation', () => {
    globalThis.localStorage.setItem('serhatsoruklu-identity-language', 'tr');

    const service = TestBed.inject(IdentityLanguageService);
    const surnameLanguage = TestBed.inject(SorukluSurnameLanguageService);

    expect(service.language()).toBe('tr');
    expect(surnameLanguage.language()).toBe('tr');
    expect(globalThis.sessionStorage.getItem('serhatsoruklu-surname-language')).toBe('tr');
  });
});
