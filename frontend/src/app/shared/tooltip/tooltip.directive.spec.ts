import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { TooltipDirective } from './tooltip.directive';

@Component({
  imports: [TooltipDirective],
  template: `
    <button id="bottom" appTooltip="Tooltip copy" appTooltipPlacement="bottom">Trigger</button>
    <button id="right" appTooltip="Right copy" appTooltipPlacement="right">Right trigger</button>
    <button id="fallback-top" appTooltip="Fallback top copy" appTooltipPlacement="right">Fallback top</button>
    <button id="fallback-bottom" appTooltip="Fallback bottom copy" appTooltipPlacement="right">Fallback bottom</button>
  `
})
class TooltipHostComponent {}

describe('TooltipDirective', () => {
  beforeEach(async () => {
    globalThis.document.body.innerHTML = '';
    await TestBed.configureTestingModule({
      imports: [TooltipHostComponent]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows, positions, hides, and destroys the tooltip', async () => {
    const fixture = TestBed.createComponent(TooltipHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('#bottom') as HTMLButtonElement;

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

  it('uses right placement when there is room beside the trigger', () => {
    const fixture = TestBed.createComponent(TooltipHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('#right') as HTMLButtonElement;
    mockViewport(420, 320);
    mockRects({
      right: createRect(80, 110, 48, 24),
      tooltip: createRect(0, 0, 120, 32)
    });

    button.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    const tooltip = globalThis.document.querySelector('[role="tooltip"]') as HTMLElement;
    expect(tooltip.classList.contains('app-tooltip--right')).toBe(true);
    expect(tooltip.style.left).toBe('138px');
    expect(tooltip.style.getPropertyValue('--tooltip-arrow-top')).toContain('px');
  });

  it('falls back from right placement to top or bottom when right would overflow', () => {
    const fixture = TestBed.createComponent(TooltipHostComponent);
    fixture.detectChanges();
    const topButton = fixture.nativeElement.querySelector('#fallback-top') as HTMLButtonElement;
    const bottomButton = fixture.nativeElement.querySelector('#fallback-bottom') as HTMLButtonElement;
    mockViewport(180, 260);
    const rects = mockRects({
      'fallback-top': createRect(135, 100, 36, 24),
      'fallback-bottom': createRect(135, 8, 36, 24),
      tooltip: createRect(0, 0, 110, 34)
    });

    topButton.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    let tooltip = globalThis.document.querySelector('[role="tooltip"]') as HTMLElement;
    expect(tooltip.classList.contains('app-tooltip--top')).toBe(true);
    expect(tooltip.classList.contains('app-tooltip--right')).toBe(false);

    topButton.dispatchEvent(new Event('mouseleave'));
    topButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    rects['fallback-top'] = createRect(0, 0, 0, 0);
    bottomButton.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    tooltip = globalThis.document.querySelector('[role="tooltip"]') as HTMLElement;
    expect(tooltip.classList.contains('app-tooltip--bottom')).toBe(true);
    expect(tooltip.classList.contains('app-tooltip--right')).toBe(false);
  });
});

function createRect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
    x: left,
    y: top,
    toJSON: () => ({})
  } as DOMRect;
}

function mockViewport(width: number, height: number): void {
  Object.defineProperty(globalThis.document.documentElement, 'clientWidth', { configurable: true, value: width });
  Object.defineProperty(globalThis.document.documentElement, 'clientHeight', { configurable: true, value: height });
}

function mockRects(rects: Record<string, DOMRect>): Record<string, DOMRect> {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getBoundingClientRect(this: HTMLElement) {
    if (this.getAttribute('role') === 'tooltip') {
      return rects['tooltip'];
    }

    return rects[this.id] ?? createRect(0, 0, 0, 0);
  });

  return rects;
}
