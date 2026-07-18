import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { LanguageDialogComponent } from './language-dialog.component';

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
