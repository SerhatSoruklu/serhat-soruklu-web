import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';

import { routes } from '../../app.routes';
import { SeoTitleStrategy } from './seo-title.strategy';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  beforeEach(async () => {
    globalThis.document.head.innerHTML = '<link rel="canonical" href="https://serhatsoruklu.com/">';
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: TitleStrategy, useClass: SeoTitleStrategy }
      ]
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

  it('applies route metadata from the router title strategy', async () => {
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);

    await router.navigateByUrl('/work');

    expect(title.getTitle()).toBe('Serhat Soruklu | Work');
    expect(globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('Explore projects');
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://serhatsoruklu.com/work');
    expect(JSON.parse(globalThis.document.getElementById('page-json-ld')?.textContent ?? '{}')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': 'https://serhatsoruklu.com/work#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://serhatsoruklu.com/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Work',
          item: 'https://serhatsoruklu.com/work'
        }
      ]
    });
  });
});
