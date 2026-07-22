import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';

import { PortraitDialogComponent } from './portrait-dialog.component';
import { PortraitDialogService } from './portrait-dialog.service';

describe('PortraitDialogComponent', () => {
  let closeCalled = false;

  beforeEach(async () => {
    closeCalled = false;
    globalThis.localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [PortraitDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {
              closeCalled = true;
            }
          }
        }
      ]
    }).compileComponents();
  });

  it('renders linked current system badges', () => {
    const fixture = TestBed.createComponent(PortraitDialogComponent);
    fixture.detectChanges();

    const links = Array.from(fixture.nativeElement.querySelectorAll('.portrait-dialog__system-chip')) as HTMLAnchorElement[];

    expect(links.length).toBe(2);
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Coupyn.com', 'ChatPDM.com']);
    expect(links.map((link) => link.href)).toEqual(['https://coupyn.com/', 'https://chatpdm.com/']);
    expect(links.every((link) => link.target === '_blank')).toBe(true);
    expect(links.every((link) => link.rel === 'noopener noreferrer')).toBe(true);
  });

  it('tracks the resolved portrait theme', () => {
    const fixture = TestBed.createComponent(PortraitDialogComponent);
    const component = fixture.componentInstance;

    expect(component.isLightPortrait()).toBe(false);

    component.themeService.setTheme('light');
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.isLightPortrait()).toBe(true);
    expect(fixture.nativeElement.querySelector('.portrait-dialog--light-portrait')).not.toBeNull();
  });

  it('registers local icons and closes through the dialog ref', () => {
    const fixture = TestBed.createComponent(PortraitDialogComponent);
    const iconRegistry = TestBed.inject(MatIconRegistry);
    const component = fixture.componentInstance;

    expect(iconRegistry.getNamedSvgIcon('portrait-domain')).toBeTruthy();

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
