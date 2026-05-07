import { expect, Page, TestInfo } from '@playwright/test';

const ignoredConsoleErrors: RegExp[] = [];

export function installConsoleErrorGuard(page: Page, testInfo: TestInfo): () => void {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      const text = message.text();

      if (!ignoredConsoleErrors.some((pattern) => pattern.test(text))) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  testInfo.annotations.push({
    type: 'console-error-guard',
    description: 'Fails on unexpected console errors and page errors.'
  });

  return () => {
    expect([...consoleErrors, ...pageErrors]).toEqual([]);
  };
}
