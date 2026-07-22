import { Injectable } from '@angular/core';

import { LazyDialogLauncher } from '../lazy-dialog-launcher';

@Injectable({ providedIn: 'root' })
export class LanguageDialogService {
  private readonly launcher = new LazyDialogLauncher({
    ariaLabelledBy: 'language-dialog-title',
    backdropClass: 'serhat-language-dialog-backdrop',
    id: 'language-dialog',
    loadComponent: async () => (await import('./language-dialog.component')).LanguageDialogComponent,
    maxHeight: 'calc(100dvh - 40px)',
    maxWidth: 'calc(100vw - 40px)',
    panelClass: 'serhat-language-dialog-panel',
    width: 'min(760px, calc(100vw - 40px))',
  });

  open(): Promise<void> {
    return this.launcher.open();
  }
}
