import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  mdiEmailOutline,
  mdiNavigationVariantOutline,
  mdiShieldOutline,
  mdiSitemapOutline,
  mdiTranslate,
} from '@mdi/js';

import { TopNavigationService } from '../../core/navigation/top-navigation.service';
import { LanguageDialogService } from '../../shared/dialogs/language-dialog/language-dialog.service';

interface FooterLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.css',
})
export class SiteFooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly languageDialog = inject(LanguageDialogService);
  readonly languageIconPath = mdiTranslate;
  readonly topNavigation = inject(TopNavigationService);
  readonly groupIconPaths = {
    identity: mdiShieldOutline,
    navigate: mdiNavigationVariantOutline,
    reach: mdiEmailOutline,
    systems: mdiSitemapOutline,
  };

  readonly navLinks: FooterLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Work', path: '/work' },
    { label: 'Systems', path: '/systems' },
    { label: 'Writing', path: '/writing' },
    { label: 'GitHub', path: '/github' },
  ];

  readonly systemLinks: FooterLink[] = [
    { label: 'Coupyn', path: '/systems/coupyn' },
    { label: 'ChatPDM', path: '/systems/chatpdm' },
    { label: 'DBF', path: '/systems/deterministic-boundary-firewall' },
    { label: 'CIM', path: '/systems/continuity-identity-model' },
  ];

  readonly identityLinks: FooterLink[] = [
    { label: 'About', path: '/about' },
    { label: 'Soruklu surname', path: '/soruklu-surname' },
    { label: 'Soruklu Order', path: '/soruklu-order' },
    { label: 'Velari', path: '/velari' },
  ];

  readonly reachLinks: FooterLink[] = [
    { label: 'Contact', path: '/contact' },
    { label: 'Press / Media', path: '/press' },
  ];

  openLanguageDialog(): void {
    void this.languageDialog.open();
  }
}
