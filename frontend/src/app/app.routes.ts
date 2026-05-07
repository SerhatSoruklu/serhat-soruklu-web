import { Routes } from '@angular/router';

import { pageSeoMetadata } from './core/seo/seo.config';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((component) => component.HomeComponent),
    pathMatch: 'full',
    data: {
      seo: pageSeoMetadata.home
    }
  },
  {
    path: 'work',
    loadComponent: () => import('./pages/work/work.component').then((component) => component.WorkComponent),
    data: {
      seo: pageSeoMetadata.work
    }
  },
  {
    path: 'systems',
    loadComponent: () => import('./pages/systems/systems.component').then((component) => component.SystemsComponent),
    data: {
      seo: pageSeoMetadata.systems
    }
  },
  {
    path: 'writing',
    loadComponent: () => import('./pages/writing/writing.component').then((component) => component.WritingComponent),
    data: {
      seo: pageSeoMetadata.writing
    }
  },
  {
    path: 'github',
    loadComponent: () => import('./pages/github/github.component').then((component) => component.GitHubComponent),
    data: {
      seo: pageSeoMetadata.github
    }
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then((component) => component.ContactComponent),
    data: {
      seo: pageSeoMetadata.contact
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
