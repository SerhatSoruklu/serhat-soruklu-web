import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { mdiWeb } from '@mdi/js';

import { ResolvedTheme, ThemeService } from '../../../core/theme/theme.service';
import { PortraitDialogComponent } from './portrait-dialog.component';
import { PortraitDialogService } from './portrait-dialog.service';

describe('PortraitDialogComponent', () => {
  let closeCalled = false;

  beforeEach(async () => {
    closeCalled = false;
    globalThis.localStorage.clear();
    const resolvedTheme = signal<ResolvedTheme>('dark');

    await TestBed.configureTestingModule({
      imports: [PortraitDialogComponent],
      providers: [
        {
          provide: ThemeService,
          useValue: {
            resolvedTheme: resolvedTheme.asReadonly(),
            setTheme: (theme: ResolvedTheme) => resolvedTheme.set(theme),
          },
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {
              closeCalled = true;
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('renders linked current system badges', () => {
    const fixture = TestBed.createComponent(PortraitDialogComponent);
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.portrait-dialog__system-chip'),
    ) as HTMLAnchorElement[];

    expect(links.length).toBe(2);
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Coupyn.com', 'ChatPDM.com']);
    expect(links.map((link) => link.href)).toEqual(['https://coupyn.com/', 'https://chatpdm.com/']);
    expect(links.every((link) => link.target === '_blank')).toBe(true);
    expect(links.every((link) => link.rel === 'noopener noreferrer')).toBe(true);
  });

  it('renders one intrinsic portrait and updates the same image for the resolved theme', () => {
    const fixture = TestBed.createComponent(PortraitDialogComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    const darkImage = fixture.nativeElement.querySelector(
      '[data-testid="portrait-dialog-portrait-image"]',
    ) as HTMLImageElement;

    expect(component.isLightPortrait()).toBe(false);
    expect(
      fixture.nativeElement.querySelectorAll('[data-testid="portrait-dialog-portrait-image"]'),
    ).toHaveLength(1);
    expect(darkImage.getAttribute('src')).toBe('/assets/home/serhat-soruklu-founder-dark.png');
    expect(darkImage.getAttribute('data-portrait-theme')).toBe('dark');
    expect(darkImage.getAttribute('width')).toBe('1448');
    expect(darkImage.getAttribute('height')).toBe('1086');
    expect(darkImage.getAttribute('decoding')).toBe('async');
    expect(darkImage.getAttribute('loading')).toBe('eager');
    expect(darkImage.alt).toBe('Serhat Soruklu seated at his workstation in a dark office.');
    expect(
      fixture.nativeElement.querySelector('.portrait-dialog__summary')?.textContent?.trim(),
    ).toBe('Founder and solo operator building production web systems with a focus on:');

    component.themeService.setTheme('light');
    TestBed.flushEffects();
    fixture.detectChanges();

    const lightImage = fixture.nativeElement.querySelector(
      '[data-testid="portrait-dialog-portrait-image"]',
    ) as HTMLImageElement;

    expect(component.isLightPortrait()).toBe(true);
    expect(fixture.nativeElement.querySelector('.portrait-dialog--light-portrait')).not.toBeNull();
    expect(lightImage).toBe(darkImage);
    expect(lightImage.getAttribute('src')).toBe('/assets/home/serhat-soruklu-founder-light.png');
    expect(lightImage.getAttribute('data-portrait-theme')).toBe('light');
    expect(lightImage.alt).toBe('Serhat Soruklu seated at his workstation in a bright office.');
  });

  it('renders compile-time icon paths and closes through the dialog ref', () => {
    const fixture = TestBed.createComponent(PortraitDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const domainIcons = Array.from(
      fixture.nativeElement.querySelectorAll('[data-mat-icon-name="portrait-domain"]'),
    ) as HTMLElement[];

    expect(domainIcons).toHaveLength(2);
    expect(
      domainIcons.every((icon) => icon.querySelector('path')?.getAttribute('d') === mdiWeb),
    ).toBe(true);

    component.close();

    expect(closeCalled).toBe(true);
  });
});

describe('PortraitDialogService', () => {
  let existingDialog: object | undefined;
  let openCalls: Array<{ component: unknown; config: Record<string, unknown> }>;

  beforeEach(() => {
    existingDialog = undefined;
    openCalls = [];

    TestBed.configureTestingModule({
      providers: [
        PortraitDialogService,
        {
          provide: MatDialog,
          useValue: {
            getDialogById: () => existingDialog,
            open: (component: unknown, config: Record<string, unknown>) => {
              openCalls.push({ component, config });

              return {};
            },
          },
        },
      ],
    });
  });

  it('lazy-loads and opens one accessible dialog for concurrent requests', async () => {
    const service = TestBed.inject(PortraitDialogService);
    const firstOpen = service.open();
    const concurrentOpen = service.open();

    expect(concurrentOpen).toBe(firstOpen);

    await Promise.all([firstOpen, concurrentOpen]);

    expect(openCalls.length).toBe(1);
    expect(openCalls[0]?.component).toBe(PortraitDialogComponent);
    expect(openCalls[0]?.config['id']).toBe('portrait-dialog');
    expect(openCalls[0]?.config['ariaLabelledBy']).toBe('portrait-dialog-title');
    expect(openCalls[0]?.config['restoreFocus']).toBe(true);
  });

  it('allows a fresh dialog request after the previous open resolves', async () => {
    const service = TestBed.inject(PortraitDialogService);

    await service.open();
    await service.open();

    expect(openCalls.length).toBe(2);
  });

  it('does not open a duplicate dialog when one already exists', async () => {
    existingDialog = {};

    await TestBed.inject(PortraitDialogService).open();

    expect(openCalls.length).toBe(0);
  });
});
