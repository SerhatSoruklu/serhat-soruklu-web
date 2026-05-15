import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TopNavigationService } from './top-navigation.service';

describe('TopNavigationService', () => {
  let matchMedia: ReturnType<typeof vi.fn>;
  let requestAnimationFrame: ReturnType<typeof vi.fn>;
  let scrollTo: ReturnType<typeof vi.fn>;

  function configureService(routerUrl: string, platformId: string = 'browser'): TopNavigationService {
    matchMedia = vi.fn(() => ({ matches: false }));
    requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(0);

      return 1;
    });
    scrollTo = vi.fn();

    const mockDocument = {
      defaultView: {
        matchMedia,
        requestAnimationFrame,
        scrollTo
      }
    };

    TestBed.configureTestingModule({
      providers: [
        TopNavigationService,
        { provide: DOCUMENT, useValue: mockDocument },
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: Router, useValue: { url: routerUrl } }
      ]
    });

    return TestBed.inject(TopNavigationService);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('scrolls to the top when the same normalized route is selected', () => {
    const service = configureService('/work?tab=systems#proof');

    service.handleLinkClick('/work/');

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });
  });

  it('uses automatic scrolling when reduced motion is preferred', () => {
    const service = configureService('/');
    matchMedia.mockReturnValue({ matches: true });

    service.handleBrandClick();

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('does not scroll for a different route', () => {
    const service = configureService('/systems');

    service.handleLinkClick('/work');

    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('does not access browser scrolling when rendered outside the browser', () => {
    const service = configureService('/work', 'server');

    service.handleLinkClick('/work');

    expect(requestAnimationFrame).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
