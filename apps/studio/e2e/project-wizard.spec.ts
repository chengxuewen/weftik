/// <reference types="playwright" />
// AUDESYS Studio — New AUDESYS Project without pre-opened workspace (H1 core gate)
// Verifies: no workspace → New AUDESYS Project → create project dir →
// auto-opens workspace → POU tree shows the project.
import { test, expect, Page } from '@playwright/test';

const STUDIO_URL = process.env.THEIA_URL || 'http://127.0.0.1:3100';
const PROJECT_NAME = `e2e_proj_${Date.now()}`;
const QUICK_ROW = '.quick-input-list .monaco-list-row, .quick-input-list-row';

/** Accept the Theia workspace-trust dialog if it appears (new workspace). */
async function acceptWorkspaceTrust(page: Page): Promise<void> {
  const trustBtn = page.getByRole('button', { name: /Yes, I trust the authors/i });
  try {
    await trustBtn.click({ timeout: 3000 });
  } catch {
    // no trust dialog — fine
  }
}

test.describe('New AUDESYS Project (no workspace)', () => {
  test('G1a: creates project and auto-opens workspace when none is open', async ({ page }) => {
    await page.goto(STUDIO_URL);
    await page.waitForSelector('#theia-app-shell', { state: 'visible', timeout: 20_000 });
    await page.waitForTimeout(3000);

    // Open command palette and run the command.
    await page.keyboard.press('F1');
    await page.waitForTimeout(800);
    const input = page.locator('.quick-input-field input, .monaco-inputbox input, .quick-input input');
    await input.fill('>New AUDESYS Project');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    // Name prompt.
    await input.fill(PROJECT_NAME);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    // Location quick-pick — choose the default projects folder (resolved home path).
    const defaultRow = page.locator(QUICK_ROW, { hasText: 'AUDESYS-Projects' }).first();
    await defaultRow.click();
    await page.waitForTimeout(3000);

    // New workspace triggers the trust dialog — accept it.
    await acceptWorkspaceTrust(page);
    await page.waitForTimeout(2000);

    // After creation + auto-open, the workspace URL points at the new project dir
    // and the POU tree appears.
    await expect(page.locator('.audesys-pou-tree')).toBeVisible({ timeout: 15_000 });
    expect(page.url()).toContain(`AUDESYS-Projects/${PROJECT_NAME}`);
  });
});