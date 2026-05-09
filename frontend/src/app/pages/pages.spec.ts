import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ContactComponent } from './contact/contact.component';
import { GitHubComponent } from './github/github.component';
import { HomeComponent } from './home/home.component';
import { SystemsComponent } from './systems/systems.component';
import { WorkComponent } from './work/work.component';
import { WritingComponent } from './writing/writing.component';

const pages = [
  { component: HomeComponent, heading: 'Serhat Soruklu' },
  { component: WorkComponent, heading: 'Work' },
  { component: SystemsComponent, heading: 'Systems' },
  { component: WritingComponent, heading: 'Writing' },
  { component: GitHubComponent, heading: 'GitHub' },
  { component: ContactComponent, heading: 'Contact' }
];

describe('page components', () => {
  for (const page of pages) {
    it(`renders ${page.heading}`, async () => {
      await TestBed.configureTestingModule({
        imports: [page.component],
        providers: [provideRouter([])]
      }).compileComponents();

      const fixture = TestBed.createComponent(page.component);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(page.heading);
    });
  }
});
