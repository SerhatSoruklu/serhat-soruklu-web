type ConsoleMethod = 'log' | 'debug' | 'info' | 'warn' | 'trace' | 'table' | 'group' | 'groupCollapsed' | 'groupEnd';

type GuardedConsole = Console & {
  __serhatSorukluConsoleGuardInstalled?: boolean;
};

type BrowserGlobal = typeof globalThis & {
  document?: Document;
  console?: GuardedConsole;
};

const guardedMethods: ConsoleMethod[] = [
  'log',
  'debug',
  'info',
  'warn',
  'trace',
  'table',
  'group',
  'groupCollapsed',
  'groupEnd'
];

export function installProductionConsoleGuard(): void {
  const browserGlobal = globalThis as BrowserGlobal;

  if (!browserGlobal.document) {
    return;
  }

  const guardedConsole = browserGlobal.console;

  if (!guardedConsole || guardedConsole.__serhatSorukluConsoleGuardInstalled) {
    return;
  }

  const originalConsole = {
    log: guardedConsole.log.bind(guardedConsole),
    warn: guardedConsole.warn.bind(guardedConsole),
    info: guardedConsole.info.bind(guardedConsole),
    groupCollapsed: guardedConsole.groupCollapsed.bind(guardedConsole),
    groupEnd: guardedConsole.groupEnd.bind(guardedConsole)
  };

  originalConsole.log('%c     STOP     ', 'color:#07090d;background:#d6a84f;font-size:30px;font-weight:700;padding:10px 48px;border-radius:6px;letter-spacing:0;text-align:center;');
  originalConsole.warn(
    '%cThis console exposes the internals of your browser session. Do not paste code here unless you understand exactly what it does.',
    'color:#f0d58c;background:#10141c;font-size:14px;line-height:1.6;padding:8px 10px;border-left:3px solid #d6a84f;'
  );
  originalConsole.log(
    '%cSerhatSoruklu.com%c Systems are built in layers. This one is no exception.',
    'color:#07090d;background:#d6a84f;font-size:14px;font-weight:700;padding:6px 10px;border-radius:4px;',
    'color:#f5f7fa;background:#10141c;font-size:14px;padding:6px 10px;'
  );
  originalConsole.groupCollapsed('What is this?');
  originalConsole.info('This console is used for debugging browser behavior. If you opened it by accident, close DevTools and continue browsing normally.');
  originalConsole.groupEnd();

  guardedConsole.__serhatSorukluConsoleGuardInstalled = true;

  for (const method of guardedMethods) {
    guardedConsole[method] = () => undefined;
  }
}
