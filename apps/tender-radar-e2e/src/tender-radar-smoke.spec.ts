import { expect, test } from '@playwright/test';

test.describe('TenderRadar Smoke', () => {
  test('loads the tender radar homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/tenders');

    await expect(page.getByRole('heading', { level: 1, name: 'TenderRadar MK' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Saved Searches' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Radar Filters' })).toBeVisible();
  });
});
