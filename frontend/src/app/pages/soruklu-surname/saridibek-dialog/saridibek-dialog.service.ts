import { Injectable } from '@angular/core';

import { LazyDialogLauncher } from '../../../shared/dialogs/lazy-dialog-launcher';

@Injectable({ providedIn: 'root' })
export class SaridibekDialogService {
  private readonly launcher = new LazyDialogLauncher({
    ariaLabelledBy: 'saridibek-dialog-title',
    backdropClass: 'serhat-saridibek-dialog-backdrop',
    id: 'saridibek-dialog',
    loadComponent: async () =>
      (await import('./saridibek-dialog.component')).SaridibekDialogComponent,
    maxHeight: 'calc(100dvh - 24px)',
    maxWidth: 'calc(100vw - 24px)',
    panelClass: 'serhat-saridibek-dialog-panel',
    width: 'min(980px, calc(100vw - 40px))',
  });

  open(): Promise<void> {
    return this.launcher.open();
  }
}
