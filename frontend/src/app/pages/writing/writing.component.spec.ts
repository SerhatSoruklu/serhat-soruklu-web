import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { mdiReddit } from '@mdi/js';

import { WritingComponent } from './writing.component';

describe('WritingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WritingComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('renders a curated collection of real published writing', () => {
    const fixture = TestBed.createComponent(WritingComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const featuredLink = compiled.querySelector<HTMLAnchorElement>('.featured-article');
    const communityLink = compiled.querySelector<HTMLAnchorElement>('.community-thread');
    const redditIconPath = communityLink?.querySelector('svg path')?.getAttribute('d');
    const sectionIcons = compiled.querySelectorAll('mat-icon');
    const writingCards = compiled.querySelectorAll<HTMLAnchorElement>('.writing-card');

    expect(compiled.querySelector('h1')?.textContent).toContain('systems that have to stay standing');
    expect(featuredLink?.href).toContain('medium.com/@coupyn/permaflow');
    expect(featuredLink?.target).toBe('_blank');
    expect(communityLink?.href).toContain('reddit.com/r/node/comments/1oeba1r');
    expect(communityLink?.target).toBe('_blank');
    expect(redditIconPath).toBe(mdiReddit);
    expect(sectionIcons.length).toBe(3);
    expect(writingCards.length).toBe(4);
    expect(Array.from(writingCards).every((link) => link.rel.includes('noopener'))).toBe(true);
    const containsRemovedArticle = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('a'))
      .some((link) => link.href.includes('i-built-coupyn-alone'));

    expect(containsRemovedArticle).toBe(false);
  });

  it('filters selected notes without hiding the featured essay', () => {
    const fixture = TestBed.createComponent(WritingComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const architectureButton = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.writing-filter'))
      .find((button) => button.textContent?.trim() === 'Architecture');

    architectureButton?.click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.writing-card').length).toBe(2);
    expect(compiled.querySelector('.writing-filter-count')?.textContent).toContain('2 selected notes');
    expect(compiled.querySelector('.featured-article')).not.toBeNull();
    expect(architectureButton?.getAttribute('aria-pressed')).toBe('true');
  });

  it('does not repeat article titles or URLs across the page', () => {
    const fixture = TestBed.createComponent(WritingComponent);
    const component = fixture.componentInstance;
    const allArticles = [
      component.featuredArticle,
      component.communityThread,
      ...component.articles,
      ...component.archiveArticles
    ];
    const titles = allArticles.map((article) => article.title);
    const urls = allArticles.map((article) => article.url);

    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
