import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TooltipDirective } from './tooltip.directive';

@Component({
  imports: [TooltipDirective],
  template: '<button appTooltip="Tooltip copy" appTooltipPlacement="bottom">Trigger</button>'
})
class TooltipHostComponent {}

describe('TooltipDirective', () => {
  beforeEach(async () => {
    globalThis.document.body.innerHTML = '';
    await TestBed.configureTestingModule({
      imports: [TooltipHostComponent]
    }).compileComponents();
  });

  it('shows, positions, hides, and destroys the tooltip', async () => {
    const fixture = TestBed.createComponent(TooltipHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    button.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    const tooltip = globalThis.document.querySelector('[role="tooltip"]') as HTMLElement;
    expect(tooltip).not.toBeNull();
    expect(tooltip.textContent).toBe('Tooltip copy');
    expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);
    expect(tooltip.classList.contains('app-tooltip--visible')).toBe(true);
    expect(tooltip.style.left).toContain('px');
    expect(tooltip.style.top).toContain('px');
    expect(tooltip.style.getPropertyValue('--tooltip-arrow-left')).toContain('px');

    button.dispatchEvent(new Event('mouseleave'));
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(globalThis.document.querySelector('[role="tooltip"]')).toBeNull();

    button.dispatchEvent(new Event('focusin'));
    fixture.detectChanges();
    expect(globalThis.document.querySelector('[role="tooltip"]')).not.toBeNull();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(globalThis.document.querySelector('[role="tooltip"]')).toBeNull();

    fixture.destroy();
    expect(globalThis.document.querySelector('[role="tooltip"]')).toBeNull();
  });
});
