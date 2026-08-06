import { Injectable } from '@angular/core';

import { LazyDialogLauncher } from '../../../shared/dialogs/lazy-dialog-launcher';
import type { SurnameImageDialogData } from '../surname-image-dialog.types';

@Injectable({ providedIn: 'root' })
export class SaridibekDialogService {
  private readonly launcher = new LazyDialogLauncher({
    ariaLabelledBy: 'surname-image-dialog-title',
    backdropClass: 'serhat-saridibek-dialog-backdrop',
    id: 'saridibek-dialog',
    loadComponent: async () =>
      (await import('./saridibek-dialog.component')).SaridibekDialogComponent,
    maxHeight: 'calc(100dvh - 64px)',
    maxWidth: 'calc(100vw - 80px)',
    panelClass: 'serhat-saridibek-dialog-panel',
    width: 'min(1680px, calc(100vw - 80px))',
  });

  open(data?: SurnameImageDialogData): Promise<void> {
    return this.launcher.open(data);
  }
}
