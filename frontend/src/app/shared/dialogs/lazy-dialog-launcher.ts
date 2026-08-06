import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injector, PLATFORM_ID, Type } from '@angular/core';

interface LazyDialogOptions {
  readonly ariaLabelledBy: string;
  readonly backdropClass: string;
  readonly id: string;
  readonly loadComponent: () => Promise<Type<unknown>>;
  readonly maxHeight: string;
  readonly maxWidth: string;
  readonly panelClass: string;
  readonly width: string;
}

export class LazyDialogLauncher {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private opening: Promise<void> | null = null;

  constructor(private readonly options: LazyDialogOptions) {}

  open(data?: unknown): Promise<void> {
    if (!this.isBrowser || !this.document.defaultView) {
      return Promise.resolve();
    }

    this.opening ??= this.openDialog(data).finally(() => {
      this.opening = null;
    });

    return this.opening;
  }

  private async openDialog(data?: unknown): Promise<void> {
    const [{ MatDialog }, component] = await Promise.all([
      import('@angular/material/dialog'),
      this.options.loadComponent(),
    ]);
    const dialog = this.injector.get(MatDialog);

    if (dialog.getDialogById(this.options.id)) {
      return;
    }

    dialog.open(component, {
      ariaLabelledBy: this.options.ariaLabelledBy,
      autoFocus: 'dialog',
      backdropClass: this.options.backdropClass,
      closeOnNavigation: true,
      delayFocusTrap: false,
      data,
      disableClose: false,
      enterAnimationDuration: 160,
      exitAnimationDuration: 110,
      id: this.options.id,
      maxHeight: this.options.maxHeight,
      maxWidth: this.options.maxWidth,
      panelClass: this.options.panelClass,
      restoreFocus: true,
      width: this.options.width,
    });
  }
}
