import { expect, test } from '@playwright/test';

test.describe('TenderRadar Smoke', () => {
  test('loads the tender radar homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/tenders');

    await expect(page.locator('h1').first()).toContainText('TenderRadar MK');
    await expect(page.locator('text=Saved Searches')).toBeVisible();
    await expect(page.locator('text=Radar Filters')).toBeVisible();
  });
});
