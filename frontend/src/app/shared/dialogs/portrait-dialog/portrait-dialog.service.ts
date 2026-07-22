import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PortraitDialogService {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private opening: Promise<void> | null = null;

  open(): Promise<void> {
    if (!this.isBrowser || !this.document.defaultView) {
      return Promise.resolve();
    }

    this.opening ??= this.openDialog().finally(() => {
      this.opening = null;
    });

    return this.opening;
  }

  private async openDialog(): Promise<void> {
    const [{ MatDialog }, { PortraitDialogComponent }] = await Promise.all([
      import('@angular/material/dialog'),
      import('./portrait-dialog.component'),
    ]);
    const dialog = this.injector.get(MatDialog);

    if (dialog.getDialogById('portrait-dialog')) {
      return;
    }

    dialog.open(PortraitDialogComponent, {
      id: 'portrait-dialog',
      ariaLabelledBy: 'portrait-dialog-title',
      autoFocus: 'dialog',
      backdropClass: 'serhat-portrait-dialog-backdrop',
      closeOnNavigation: true,
      delayFocusTrap: false,
      disableClose: false,
      enterAnimationDuration: 160,
      exitAnimationDuration: 110,
      maxHeight: 'calc(100dvh - 24px)',
      maxWidth: 'calc(100vw - 24px)',
      panelClass: 'serhat-portrait-dialog-panel',
      restoreFocus: true,
      width: 'min(960px, calc(100vw - 40px))',
    });
  }
}
