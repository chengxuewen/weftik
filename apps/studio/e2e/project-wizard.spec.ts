/// <reference types="playwright" />
// AUDESYS Studio — New AUDESYS Project without pre-opened workspace (H1 core gate)
// Verifies: no workspace → File menu New AUDESYS Project → create project dir →
// auto-opens workspace → POU tree shows the project.
import { test, expect } from '@playwright/test';

const STUDIO_URL = process.env.THEIA_URL || 'http://127.0.0.1:3100';
const PROJECT_NAME = `e2e_proj_${Date.now()}`;
const POU_TREE = '.audesys-pou-tree';

test.describe('New AUDESYS Project (no workspace)', () => {
  test('G1a: creates project and POU tree appears without pre-opened workspace', async ({ page }) => {
    // Studio must start with NO workspace open (as launched fresh).
    await page.goto(STUDIO_URL);
    await page.waitForSelector('#theia-app-shell', { state: 'visible', timeout: 20_000 });
    await page.waitForTimeout(3000);

    // Trigger the command via command palette (avoids menu DOM, more robust).
    await page.keyboard.press('F1');
    await page.waitForTimeout(1000);
    const input = page.locator('.quick-input-field input, .monaco-inputbox input, .quick-input input');
    await input.fill(`>New AUDESYS Project`);
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // Name prompt appears — type the project name and confirm.
    const nameInput = page.locator('.quick-input-field input, .monaco-inputbox input, .quick-input input');
    await nameInput.fill(PROJECT_NAME);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // Location quick-pick: choose the default (~/AUDESYS-Projects/).
    const defaultOpt = page.locator('.quick-input-list').locator('text=AUDESYS-Projects').first();
    await defaultOpt.click();
    await page.waitForTimeout(3000);

    // After project creation + auto-open, POU tree should appear with the project.
    await expect(page.locator(POU_TREE)).toBeVisible({ timeout: 15_000 });
  });
});