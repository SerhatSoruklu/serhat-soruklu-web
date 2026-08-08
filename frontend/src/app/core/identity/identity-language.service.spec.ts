import { PLATFORM_ID, REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SorukluSurnameLanguageService } from '../../pages/soruklu-surname/soruklu-surname-language.service';
import { IdentityLanguageService } from './identity-language.service';

describe('IdentityLanguageService', () => {
  const identityLanguageCookie = 'serhatsoruklu-identity-language';

  beforeEach(() => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    globalThis.document.cookie = `${identityLanguageCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    globalThis.document.cookie = `${identityLanguageCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
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
    expect(globalThis.document.cookie).toContain(`${identityLanguageCookie}=tr`);
  });

  it('restores a saved Identity language and prepares the surname route before navigation', () => {
    globalThis.localStorage.setItem('serhatsoruklu-identity-language', 'tr');

    const service = TestBed.inject(IdentityLanguageService);
    const surnameLanguage = TestBed.inject(SorukluSurnameLanguageService);

    expect(service.language()).toBe('tr');
    expect(surnameLanguage.language()).toBe('tr');
    expect(globalThis.sessionStorage.getItem('serhatsoruklu-surname-language')).toBe('tr');
  });

  it('restores the saved Identity language during server rendering', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: REQUEST,
          useValue: new Request('https://serhatsoruklu.com/velari', {
            headers: { cookie: `${identityLanguageCookie}=tr` },
          }),
        },
      ],
    });

    const service = TestBed.inject(IdentityLanguageService);
    const surnameLanguage = TestBed.inject(SorukluSurnameLanguageService);

    expect(service.language()).toBe('tr');
    expect(surnameLanguage.language()).toBe('tr');
  });
});
