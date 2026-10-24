import { Injectable } from '@angular/core';

import { LazyDialogLauncher } from '../lazy-dialog-launcher';

@Injectable({ providedIn: 'root' })
export class PortraitDialogService {
  private readonly launcher = new LazyDialogLauncher({
    ariaLabelledBy: 'portrait-dialog-title',
    backdropClass: 'serhat-portrait-dialog-backdrop',
    id: 'portrait-dialog',
    loadComponent: async () => (await import('./portrait-dialog.component')).PortraitDialogComponent,
    maxHeight: 'calc(100dvh - 40px)',
    maxWidth: 'calc(100vw - 40px)',
    panelClass: 'serhat-portrait-dialog-panel',
    width: 'min(1280px, calc(100vw - 40px))',
  });

  open(): Promise<void> {
    return this.launcher.open();
  }
}
