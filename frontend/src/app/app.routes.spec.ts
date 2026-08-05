import { routes } from './app.routes';
import { pageSeoMetadata } from './core/seo/seo.config';
import { ContactComponent } from './pages/contact/contact.component';
import { GitHubComponent } from './pages/github/github.component';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SorukluOrderComponent } from './pages/soruklu-order/soruklu-order.component';
import { SorukluSurnameComponent } from './pages/soruklu-surname/soruklu-surname.component';
import { ChatpdmSystemComponent } from './pages/systems/chatpdm/chatpdm-system.component';
import { ContinuityIdentityModelSystemComponent } from './pages/systems/continuity-identity-model/continuity-identity-model-system.component';
import { CoupynSystemComponent } from './pages/systems/coupyn/coupyn-system.component';
import { DeterministicBoundaryFirewallSystemComponent } from './pages/systems/deterministic-boundary-firewall/deterministic-boundary-firewall-system.component';
import { SystemsComponent } from './pages/systems/systems.component';
import { WorkComponent } from './pages/work/work.component';
import { WritingComponent } from './pages/writing/writing.component';
import { VelariComponent } from './pages/velari/velari.component';

describe('routes', () => {
  it('renders the dedicated noindex not-found page for explicit and unknown routes', async () => {
    const explicitNotFound = routes.find((route) => route.path === '404');
    const wildcard = routes.find((route) => route.path === '**');

    for (const route of [explicitNotFound, wildcard]) {
      expect(route?.redirectTo).toBeUndefined();
      expect(route?.data?.['seo']).toBe(pageSeoMetadata.notFound);
      expect(route?.data?.['statusCode']).toBe(404);
      expect(await route?.loadComponent?.()).toBe(NotFoundComponent);
    }
  });

  it('keeps public route paths and SEO metadata aligned', () => {
    const publicRoutes = routes.filter((route) => route.path !== '404' && route.path !== '**');

    expect(publicRoutes.map((route) => route.path)).toEqual([
      '',
      'work',
      'systems/coupyn',
      'systems/chatpdm',
      'systems/deterministic-boundary-firewall',
      'systems/continuity-identity-model',
      'systems',
      'writing',
      'github',
      'soruklu-surname',
      'soruklu-order',
      'velari',
      'contact',
    ]);
    expect(publicRoutes.map((route) => route.data?.['seo'])).toEqual([
      pageSeoMetadata.home,
      pageSeoMetadata.work,
      pageSeoMetadata.coupynSystem,
      pageSeoMetadata.chatpdmSystem,
      pageSeoMetadata.dbfSystem,
      pageSeoMetadata.cimSystem,
      pageSeoMetadata.systems,
      pageSeoMetadata.writing,
      pageSeoMetadata.github,
      pageSeoMetadata.sorukluSurname,
      pageSeoMetadata.sorukluOrder,
      pageSeoMetadata.velari,
      pageSeoMetadata.contact,
    ]);
  });

  it('loads public components from their lazy routes', async () => {
    const entries: Array<[string, unknown]> = [];

    for (const route of routes.filter((candidate) => candidate.loadComponent)) {
      const loadComponent = route.loadComponent as () => Promise<unknown>;

      entries.push([route.path ?? '', await loadComponent()]);
    }

    const componentByPath = new Map(entries);

    expect(componentByPath.get('')).toBe(HomeComponent);
    expect(componentByPath.get('work')).toBe(WorkComponent);
    expect(componentByPath.get('systems/coupyn')).toBe(CoupynSystemComponent);
    expect(componentByPath.get('systems/chatpdm')).toBe(ChatpdmSystemComponent);
    expect(componentByPath.get('systems/deterministic-boundary-firewall')).toBe(
      DeterministicBoundaryFirewallSystemComponent,
    );
    expect(componentByPath.get('systems/continuity-identity-model')).toBe(
      ContinuityIdentityModelSystemComponent,
    );
    expect(componentByPath.get('systems')).toBe(SystemsComponent);
    expect(componentByPath.get('writing')).toBe(WritingComponent);
    expect(componentByPath.get('github')).toBe(GitHubComponent);
    expect(componentByPath.get('soruklu-surname')).toBe(SorukluSurnameComponent);
    expect(componentByPath.get('soruklu-order')).toBe(SorukluOrderComponent);
    expect(componentByPath.get('velari')).toBe(VelariComponent);
    expect(componentByPath.get('contact')).toBe(ContactComponent);
    expect(componentByPath.get('404')).toBe(NotFoundComponent);
    expect(componentByPath.get('**')).toBe(NotFoundComponent);
  });
});
