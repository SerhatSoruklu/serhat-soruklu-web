import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LanguageDialogService {
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
    const [{ MatDialog }, { LanguageDialogComponent }] = await Promise.all([
      import('@angular/material/dialog'),
      import('./language-dialog.component'),
    ]);
    const dialog = this.injector.get(MatDialog);

    if (dialog.getDialogById('language-dialog')) {
      return;
    }

    dialog.open(LanguageDialogComponent, {
      id: 'language-dialog',
      ariaLabelledBy: 'language-dialog-title',
      autoFocus: 'dialog',
      backdropClass: 'serhat-language-dialog-backdrop',
      closeOnNavigation: true,
      delayFocusTrap: false,
      disableClose: false,
      enterAnimationDuration: 160,
      exitAnimationDuration: 110,
      maxHeight: 'calc(100dvh - 40px)',
      maxWidth: 'calc(100vw - 40px)',
      panelClass: 'serhat-language-dialog-panel',
      restoreFocus: true,
      width: 'min(760px, calc(100vw - 40px))',
    });
  }
}
