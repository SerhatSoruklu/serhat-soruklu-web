import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ContactComponent } from './contact/contact.component';
import { GitHubComponent } from './github/github.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SorukluOrderComponent } from './soruklu-order/soruklu-order.component';
import { ChatpdmSystemComponent } from './systems/chatpdm/chatpdm-system.component';
import { ContinuityIdentityModelSystemComponent } from './systems/continuity-identity-model/continuity-identity-model-system.component';
import { CoupynSystemComponent } from './systems/coupyn/coupyn-system.component';
import { DeterministicBoundaryFirewallSystemComponent } from './systems/deterministic-boundary-firewall/deterministic-boundary-firewall-system.component';
import { SystemsComponent } from './systems/systems.component';
import { WorkComponent } from './work/work.component';
import { WritingComponent } from './writing/writing.component';
import { VelariComponent } from './velari/velari.component';

const pages: readonly { component: Type<unknown>; heading: string }[] = [
  { component: HomeComponent, heading: 'Serhat Soruklu' },
  { component: WorkComponent, heading: 'Work' },
  { component: SystemsComponent, heading: 'Systems' },
  { component: CoupynSystemComponent, heading: 'Coupyn' },
  { component: ChatpdmSystemComponent, heading: 'ChatPDM' },
  {
    component: DeterministicBoundaryFirewallSystemComponent,
    heading: 'Deterministic Boundary Firewall',
  },
  { component: ContinuityIdentityModelSystemComponent, heading: 'Continuity Identity Model' },
  { component: WritingComponent, heading: 'Writing' },
  { component: GitHubComponent, heading: 'GitHub' },
  { component: SorukluOrderComponent, heading: 'The Soruklu Order' },
  { component: VelariComponent, heading: 'Velari' },
  { component: ContactComponent, heading: 'Start With a Clear Message' },
  { component: NotFoundComponent, heading: 'Page not found' },
];

describe('page components', () => {
  for (const page of pages) {
    it(`renders ${page.heading}`, async () => {
      await TestBed.configureTestingModule({
        imports: [page.component],
        providers: [provideRouter([])],
      }).compileComponents();

      const fixture = TestBed.createComponent(page.component);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(page.heading);
      expect((fixture.nativeElement as HTMLElement).querySelectorAll('main')).toHaveLength(0);
    });
  }

  it('links the ChatPDM systems card to the live product', async () => {
    await TestBed.configureTestingModule({
      imports: [SystemsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(SystemsComponent);
    fixture.detectChanges();

    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('a'),
    );
    const chatpdmLink = links.find((link) => link.textContent?.trim() === 'Open ChatPDM');

    expect(chatpdmLink?.href).toBe('https://chatpdm.com/');
    expect(chatpdmLink?.target).toBe('_blank');
    expect(chatpdmLink?.rel).toContain('noopener');
  });
});
