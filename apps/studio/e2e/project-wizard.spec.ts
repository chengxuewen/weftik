/// <reference types="playwright" />
// Weftik Studio — New Weftik Project without pre-opened workspace (H1 core gate)
// Verifies: no workspace → New Weftik Project → create project dir → auto-opens
// workspace (URL points at the new project dir).
import { test, expect, Page } from '@playwright/test';

const STUDIO_URL = process.env.THEIA_URL || 'http://127.0.0.1:3100';
const PROJECT_NAME = `e2e_proj_${Date.now()}`;
const QUICK_ROW = '.quick-input-list .monaco-list-row, .quick-input-list-row';

/** Close any open workspace so the test starts with none. */
async function closeWorkspace(page: Page): Promise<void> {
  await page.getByRole('menuitem', { name: 'File' }).click();
  await page.waitForTimeout(400);
  const closeWs = page.getByRole('menuitem', { name: 'Close Workspace' });
  // fresh server may have no workspace open — the item exists but is
  // disabled; clicking it would hang. Only act when enabled.
  if (await closeWs.count() && await closeWs.first().isEnabled()) {
    await closeWs.click();
    await page.waitForTimeout(2000);
  } else {
    await page.keyboard.press('Escape');
  }
}
test.describe('New Weftik Project (no workspace)', () => {
  test('G1a: creates project and auto-opens workspace when none is open', async ({ page }) => {
    await page.goto(STUDIO_URL);
    await page.waitForSelector('#theia-app-shell', { state: 'visible', timeout: 20_000 });
    await page.waitForTimeout(3000);
    await closeWorkspace(page);

    await page.keyboard.press('F1');
    await page.waitForTimeout(800);
    const input = page.locator('.quick-input-field input, .monaco-inputbox input, .quick-input input');
    await input.fill('>New Weftik Project');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    await input.fill(PROJECT_NAME);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    const defaultRow = page.locator(QUICK_ROW, { hasText: 'Weftik-Projects' }).first();
    await defaultRow.click();
    await page.waitForTimeout(3000);

    const trust = page.getByRole('button', { name: /Yes, I trust the authors/i });
    if (await trust.count().catch(() => 0)) {
      await trust.click();
      await page.waitForTimeout(2000);
    }

    expect(page.url()).toContain(`Weftik-Projects/${PROJECT_NAME}`);
  });
});