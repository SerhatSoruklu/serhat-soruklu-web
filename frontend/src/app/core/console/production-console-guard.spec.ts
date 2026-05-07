import { installProductionConsoleGuard } from './production-console-guard';

describe('installProductionConsoleGuard', () => {
  const originalConsole = { ...console };

  afterEach(() => {
    Object.assign(console, originalConsole);
    delete (console as typeof console & { __serhatSorukluConsoleGuardInstalled?: boolean }).__serhatSorukluConsoleGuardInstalled;
  });

  it('prints the intentional message, suppresses normal output, and keeps errors', () => {
    const calls: string[] = [];
    const errors: string[] = [];

    console.log = (...args: unknown[]) => calls.push(String(args[0]));
    console.warn = (...args: unknown[]) => calls.push(String(args[0]));
    console.info = (...args: unknown[]) => calls.push(String(args[0]));
    console.groupCollapsed = (...args: unknown[]) => calls.push(String(args[0]));
    console.groupEnd = () => calls.push('groupEnd');
    console.error = (...args: unknown[]) => errors.push(String(args[0]));

    installProductionConsoleGuard();
    console.log('hidden');
    console.warn('hidden');
    console.info('hidden');
    console.debug('hidden');
    console.error('visible');

    expect(calls.some((message) => message.includes('STOP'))).toBe(true);
    expect(calls.some((message) => message.includes('SerhatSoruklu.com'))).toBe(true);
    expect(calls).not.toContain('hidden');
    expect(errors).toEqual(['visible']);
  });
});
