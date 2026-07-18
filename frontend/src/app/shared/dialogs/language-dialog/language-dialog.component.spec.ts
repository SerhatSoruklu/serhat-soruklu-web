import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { LanguageDialogComponent } from './language-dialog.component';
import { LanguageDialogService } from './language-dialog.service';

describe('LanguageDialogComponent', () => {
  let closeCalled = false;

  beforeEach(async () => {
    closeCalled = false;

    await TestBed.configureTestingModule({
      imports: [LanguageDialogComponent],
      providers: [
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

  it('renders the rollout message and language preview', () => {
    const fixture = TestBed.createComponent(LanguageDialogComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const codes = Array.from(element.querySelectorAll('.language-dialog__language-ring span')).map(
      (code) => code.textContent?.trim(),
    );

    expect(element.querySelector('.language-dialog__title')?.textContent).toContain(
      'Coming in 40+ languages',
    );
    expect(element.querySelector('.language-dialog__summary')?.textContent).toContain(
      'serhatsoruklu.com',
    );
    expect(codes).toEqual(['EN', 'TR', 'ES', 'DE', 'FR', 'JA']);
  });

  it('closes from the component action', () => {
    const fixture = TestBed.createComponent(LanguageDialogComponent);

    fixture.componentInstance.close();

    expect(closeCalled).toBe(true);
  });
});

describe('LanguageDialogService', () => {
  let existingDialog: object | undefined;
  let openCalls: Array<{ component: unknown; config: Record<string, unknown> }>;

  beforeEach(() => {
    existingDialog = undefined;
    openCalls = [];

    TestBed.configureTestingModule({
      providers: [
        LanguageDialogService,
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
    const service = TestBed.inject(LanguageDialogService);
    const firstOpen = service.open();
    const concurrentOpen = service.open();

    expect(concurrentOpen).toBe(firstOpen);

    await Promise.all([firstOpen, concurrentOpen]);

    expect(openCalls.length).toBe(1);
    expect(openCalls[0]?.component).toBe(LanguageDialogComponent);
    expect(openCalls[0]?.config['id']).toBe('language-dialog');
    expect(openCalls[0]?.config['ariaLabelledBy']).toBe('language-dialog-title');
    expect(openCalls[0]?.config['restoreFocus']).toBe(true);
  });

  it('allows a fresh dialog request after the previous open resolves', async () => {
    const service = TestBed.inject(LanguageDialogService);

    await service.open();
    await service.open();

    expect(openCalls.length).toBe(2);
  });

  it('does not open a duplicate dialog when one already exists', async () => {
    existingDialog = {};

    await TestBed.inject(LanguageDialogService).open();

    expect(openCalls.length).toBe(0);
  });
});
