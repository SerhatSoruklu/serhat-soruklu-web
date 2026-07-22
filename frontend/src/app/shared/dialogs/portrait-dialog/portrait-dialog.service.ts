import { Injectable } from '@angular/core';

import { LazyDialogLauncher } from '../lazy-dialog-launcher';

@Injectable({ providedIn: 'root' })
export class PortraitDialogService {
  private readonly launcher = new LazyDialogLauncher({
    ariaLabelledBy: 'portrait-dialog-title',
    backdropClass: 'serhat-portrait-dialog-backdrop',
    id: 'portrait-dialog',
    loadComponent: async () => (await import('./portrait-dialog.component')).PortraitDialogComponent,
    maxHeight: 'calc(100dvh - 24px)',
    maxWidth: 'calc(100vw - 24px)',
    panelClass: 'serhat-portrait-dialog-panel',
    width: 'min(960px, calc(100vw - 40px))',
  });

  open(): Promise<void> {
    return this.launcher.open();
  }
}
