import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { routes } from '../../app.routes';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  beforeEach(async () => {
    globalThis.document.head.innerHTML = '<link rel="canonical" href="https://serhatsoruklu.com/">';
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('sets title, description, canonical, and social metadata', () => {
    const service = TestBed.inject(SeoService);
    const title = TestBed.inject(Title);

    service.setMetadata({
      title: 'Example Title',
      description: 'Example description.',
      canonicalUrl: '/example',
      ogImage: '/example.svg',
      robots: 'noindex, follow'
    });

    expect(title.getTitle()).toBe('Example Title');
    expect(globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Example description.');
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://serhatsoruklu.com/example');
    expect(globalThis.document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Example Title');
    expect(globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://serhatsoruklu.com/example.svg');
    expect(globalThis.document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
  });

  it('manages page JSON-LD script', () => {
    const service = TestBed.inject(SeoService);

    service.setJsonLd({ '@type': 'Person', name: 'Serhat Soruklu' });
    const script = globalThis.document.getElementById('page-json-ld');

    expect(script?.getAttribute('type')).toBe('application/ld+json');
    expect(script?.textContent).toBe('{"@type":"Person","name":"Serhat Soruklu"}');

    service.removeJsonLd();
    expect(globalThis.document.getElementById('page-json-ld')).toBeNull();
  });

  it('applies route metadata after navigation', async () => {
    const service = TestBed.inject(SeoService);
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);

    service.initializeRouteMetadata();
    await router.navigateByUrl('/work');

    expect(title.getTitle()).toBe('Serhat Soruklu | Work');
    expect(globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('Explore projects');
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://serhatsoruklu.com/work');
  });
});
