import { TestBed } from '@angular/core/testing';

import { ContactComponent } from './contact/contact.component';
import { GitHubComponent } from './github/github.component';
import { HomeComponent } from './home/home.component';
import { SystemsComponent } from './systems/systems.component';
import { WorkComponent } from './work/work.component';
import { WritingComponent } from './writing/writing.component';

const pages = [
  { component: HomeComponent, heading: 'Hero working' },
  { component: WorkComponent, heading: 'Work page working' },
  { component: SystemsComponent, heading: 'Systems page working' },
  { component: WritingComponent, heading: 'Writing page working' },
  { component: GitHubComponent, heading: 'GitHub page working' },
  { component: ContactComponent, heading: 'Contact page working' }
];

describe('page components', () => {
  for (const page of pages) {
    it(`renders ${page.heading}`, async () => {
      await TestBed.configureTestingModule({
        imports: [page.component]
      }).compileComponents();

      const fixture = TestBed.createComponent(page.component);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(page.heading);
    });
  }
});
