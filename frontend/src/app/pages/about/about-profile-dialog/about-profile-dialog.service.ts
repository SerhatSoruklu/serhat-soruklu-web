import { Injectable } from '@angular/core';

import { LazyDialogLauncher } from '../../../shared/dialogs/lazy-dialog-launcher';

@Injectable({ providedIn: 'root' })
export class AboutProfileDialogService {
  private readonly launcher = new LazyDialogLauncher({
    ariaLabelledBy: 'about-profile-dialog-title',
    backdropClass: 'serhat-about-profile-dialog-backdrop',
    id: 'about-profile-dialog',
    loadComponent: async () =>
      (await import('./about-profile-dialog.component')).AboutProfileDialogComponent,
    maxHeight: 'calc(100dvh - 40px)',
    maxWidth: 'calc(100vw - 40px)',
    panelClass: 'serhat-about-profile-dialog-panel',
    width: 'min(1240px, calc(100vw - 40px))',
  });

  open(): Promise<void> {
    return this.launcher.open();
  }
}
