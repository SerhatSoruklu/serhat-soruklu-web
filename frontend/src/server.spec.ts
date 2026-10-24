import express from 'express';
import { createServer, type Server } from 'node:http';
import process from 'node:process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const clock = vi.hoisted(() => ({
  callback: undefined as (() => void) | undefined,
  timer: { unref: vi.fn() },
  clear: vi.fn(),
}));

vi.mock('@angular/ssr/node', () => ({
  AngularNodeAppEngine: class {
    handle = vi.fn();
  },
  createNodeRequestHandler: (app: unknown) => app,
  isMainModule: () => false,
  writeResponseToNodeResponse: vi.fn(),
}));

vi.mock('node:timers', () => {
  const timers = {
    setTimeout: (callback: () => void) => {
      clock.callback = callback;
      return clock.timer;
    },
    clearTimeout: clock.clear,
  };
  return { ...timers, default: timers };
});

describe('SSR HTTP server lifecycle', () => {
  const spyOnSignals = () => vi.spyOn(process, 'once');
  let server: Server;
  let exitCode: typeof process.exitCode;
  let registered: ReturnType<typeof spyOnSignals>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    exitCode = process.exitCode;
    clock.callback = undefined;
    server = createServer();
    vi.spyOn(express.application, 'listen').mockReturnValue(server);
    registered = spyOnSignals();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('SSR_START', 'true');
    vi.stubEnv('pm_id', '');
  });

  afterEach(() => {
    for (const [event, listener] of registered.mock.calls) {
      if (event === 'SIGTERM' || event === 'SIGINT') process.removeListener(event, listener);
    }
    process.exitCode = exitCode;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const signalHandler = (event: 'SIGTERM' | 'SIGINT') => {
    const handler = registered.mock.calls.find(([name]) => name === event)?.[1];
    expect(handler).toBeTypeOf('function');
    return handler as () => void;
  };

  it('exports the development request handler without opening a second listener', async () => {
    vi.stubEnv('SSR_START', '');
    const module = await import('./server');
    expect(module.reqHandler).toBeDefined();
    expect(express.application.listen).not.toHaveBeenCalled();
  });

  it('handles SIGTERM and SIGINT once, with an unreferenced Node timer and a clean close', async () => {
    const close = vi.spyOn(server, 'close').mockImplementation((callback) => {
      callback?.();
      return server;
    });
    await import('./server');
    signalHandler('SIGTERM')();
    signalHandler('SIGINT')();
    expect(close).toHaveBeenCalledTimes(1);
    expect(clock.timer.unref).toHaveBeenCalledOnce();
    expect(clock.clear).toHaveBeenCalledWith(clock.timer);
  });

  it('closes stuck connections and exits if the graceful shutdown deadline expires', async () => {
    vi.spyOn(server, 'close').mockReturnValue(server);
    const closeConnections = vi.spyOn(server, 'closeAllConnections').mockImplementation(() => {});
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit intercepted');
    });
    await import('./server');
    signalHandler('SIGINT')();
    expect(() => clock.callback?.()).toThrow('exit intercepted');
    expect(closeConnections).toHaveBeenCalledOnce();
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('reports an HTTP close error through the process exit status', async () => {
    vi.spyOn(server, 'close').mockImplementation((callback) => {
      callback?.(new Error('close failed'));
      return server;
    });
    await import('./server');
    signalHandler('SIGTERM')();
    expect(process.exitCode).toBe(1);
    expect(clock.clear).toHaveBeenCalledWith(clock.timer);
  });
});
