import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ContinuityIdentityModelSystemComponent } from './continuity-identity-model/continuity-identity-model-system.component';
import { DeterministicBoundaryFirewallSystemComponent } from './deterministic-boundary-firewall/deterministic-boundary-firewall-system.component';
import { SystemsComponent } from './systems.component';

describe('GitHub gateway policy', () => {
  const cases: ReadonlyArray<{ component: Type<unknown>; expectedLinks: number }> = [
    { component: SystemsComponent, expectedLinks: 3 },
    { component: DeterministicBoundaryFirewallSystemComponent, expectedLinks: 2 },
    { component: ContinuityIdentityModelSystemComponent, expectedLinks: 2 },
  ];

  for (const testCase of cases) {
    it(`${testCase.component.name} routes every GitHub action through /github`, async () => {
      await TestBed.configureTestingModule({
        imports: [testCase.component],
        providers: [provideRouter([])],
      }).compileComponents();

      const fixture = TestBed.createComponent(testCase.component);
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const githubActions = Array.from(nativeElement.querySelectorAll<HTMLAnchorElement>('a')).filter(
        (link) => link.textContent?.trim().includes('GitHub'),
      );

      expect(githubActions).toHaveLength(testCase.expectedLinks);
      expect(githubActions.every((link) => link.getAttribute('href') === '/github')).toBe(true);
      expect(githubActions.every((link) => !link.hasAttribute('target'))).toBe(true);
      expect(nativeElement.querySelectorAll('a[href^="https://github.com/"]')).toHaveLength(0);
    });
  }
});
