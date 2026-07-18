import { Routes } from '@angular/router';

import { pageSeoMetadata } from './core/seo/seo.config';

const loadNotFoundComponent = () =>
  import('./pages/not-found/not-found.component').then((component) => component.NotFoundComponent);

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((component) => component.HomeComponent),
    pathMatch: 'full',
    data: {
      seo: pageSeoMetadata.home,
    },
  },
  {
    path: 'work',
    loadComponent: () =>
      import('./pages/work/work.component').then((component) => component.WorkComponent),
    data: {
      seo: pageSeoMetadata.work,
    },
  },
  {
    path: 'systems/coupyn',
    loadComponent: () =>
      import('./pages/systems/coupyn/coupyn-system.component').then(
        (component) => component.CoupynSystemComponent,
      ),
    data: {
      seo: pageSeoMetadata.coupynSystem,
    },
  },
  {
    path: 'systems/chatpdm',
    loadComponent: () =>
      import('./pages/systems/chatpdm/chatpdm-system.component').then(
        (component) => component.ChatpdmSystemComponent,
      ),
    data: {
      seo: pageSeoMetadata.chatpdmSystem,
    },
  },
  {
    path: 'systems/deterministic-boundary-firewall',
    loadComponent: () =>
      import('./pages/systems/deterministic-boundary-firewall/deterministic-boundary-firewall-system.component').then(
        (component) => component.DeterministicBoundaryFirewallSystemComponent,
      ),
    data: {
      seo: pageSeoMetadata.dbfSystem,
    },
  },
  {
    path: 'systems/continuity-identity-model',
    loadComponent: () =>
      import('./pages/systems/continuity-identity-model/continuity-identity-model-system.component').then(
        (component) => component.ContinuityIdentityModelSystemComponent,
      ),
    data: {
      seo: pageSeoMetadata.cimSystem,
    },
  },
  {
    path: 'systems',
    loadComponent: () =>
      import('./pages/systems/systems.component').then((component) => component.SystemsComponent),
    data: {
      seo: pageSeoMetadata.systems,
    },
  },
  {
    path: 'writing',
    loadComponent: () =>
      import('./pages/writing/writing.component').then((component) => component.WritingComponent),
    data: {
      seo: pageSeoMetadata.writing,
    },
  },
  {
    path: 'github',
    loadComponent: () =>
      import('./pages/github/github.component').then((component) => component.GitHubComponent),
    data: {
      seo: pageSeoMetadata.github,
    },
  },
  {
    path: 'soruklu-order',
    loadComponent: () =>
      import('./pages/soruklu-order/soruklu-order.component').then(
        (component) => component.SorukluOrderComponent,
      ),
    data: {
      seo: pageSeoMetadata.sorukluOrder,
    },
  },
  {
    path: 'velari',
    loadComponent: () =>
      import('./pages/velari/velari.component').then((component) => component.VelariComponent),
    data: {
      seo: pageSeoMetadata.velari,
    },
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then((component) => component.ContactComponent),
    data: {
      seo: pageSeoMetadata.contact,
    },
  },
  {
    path: '404',
    loadComponent: loadNotFoundComponent,
    data: {
      seo: pageSeoMetadata.notFound,
      statusCode: 404,
    },
  },
  {
    path: '**',
    loadComponent: loadNotFoundComponent,
    data: {
      seo: pageSeoMetadata.notFound,
      statusCode: 404,
    },
  },
];
