// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoAndSettle } = require('../utils/billing-helpers');

test.describe('Plan pricing and billing frequency', () => {
  test('monthly pricing table shows correct values per plan', async ({ page }) => {
    await gotoAndSettle(page, '/pricing');

    await page.getByRole('button', { name: 'Monthly' }).click();

    // Assert against a specific card's price, not a bare text search on the
    // whole page - two plans can share digits ($99 vs $199) and a loose
    // page.getByText('$99') would silently pass either way.
    const starterCard = page.locator('[data-testid="plan-card-starter"]');
    await expect(starterCard.getByText('$99')).toBeVisible();

    const growthCard = page.locator('[data-testid="plan-card-growth"]');
    await expect(growthCard.getByText('$199')).toBeVisible();
    await expect(growthCard.getByText('MOST POPULAR')).toBeVisible();
  });

  test('annual toggle updates prices to discounted rate', async ({ page }) => {
    await gotoAndSettle(page, '/pricing');

    const growthCard = page.locator('[data-testid="plan-card-growth"]');

    await page.getByRole('button', { name: 'Monthly' }).click();
    await expect(growthCard.getByText('$199')).toBeVisible();

    await page.getByRole('button', { name: /Annual/ }).click();
    await expect(growthCard.getByText('$159')).toBeVisible();

    // Round-trip check - catches a toggle that only updates one direction.
    await page.getByRole('button', { name: 'Monthly' }).click();
    await expect(growthCard.getByText('$199')).toBeVisible();
  });

  test('current plan is not offered an Upgrade action', async ({ page }) => {
    await gotoAndSettle(page, '/pricing');

    // Whatever plan the test account is currently on should not present
    // an "Upgrade" CTA for itself - loosely asserted since the current
    // plan varies by fixture account rather than being hardcoded.
    const currentPlanCard = page.locator('[data-testid$="-card"][data-current="true"]');
    await expect(currentPlanCard.getByRole('button', { name: 'Upgrade' })).not.toBeVisible();
  });
});
