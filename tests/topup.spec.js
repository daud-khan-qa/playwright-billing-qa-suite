// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoAndSettle, skipIfAbsent, dynamicConfirmButton } = require('../utils/billing-helpers');

/**
 * Sanitized example spec. In the real suite, card names, endpoints, and
 * expected quotas are pulled from a live-verified fixture rather than
 * hardcoded - the pattern below is what matters, not the demo strings.
 */

test.describe('Top-up purchases', () => {
  test('top-up card shows correct modal and cancels without charging', async ({ page }) => {
    await gotoAndSettle(page, '/billing?tab=plans-topups');

    const card = page.locator('[data-testid="topup-card-demo-credits"]');
    await skipIfAbsent(test, card, 'demo-credits card not present on this account tier');

    // Record state before the interaction so we can assert nothing changed
    // after clicking Cancel - a real regression check, not a UI-shape check.
    const quotaBefore = await card.getByTestId('quota-total').innerText();

    await card.getByRole('button', { name: 'Top Up' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(/^Top up:/);
    await expect(dialog.getByText('Quantity')).toBeVisible();
    await expect(dynamicConfirmButton(page)).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();

    const quotaAfter = await card.getByTestId('quota-total').innerText();
    expect(quotaAfter).toBe(quotaBefore);
  });

  test('quantity change updates total and confirm-button label', async ({ page }) => {
    await gotoAndSettle(page, '/billing?tab=plans-topups');

    const card = page.locator('[data-testid="topup-card-demo-seats"]');
    await skipIfAbsent(test, card, 'demo-seats card not present on this account tier');

    await card.getByRole('button', { name: 'Top Up' }).click();
    const dialog = page.getByRole('dialog');

    await expect(dialog.getByRole('button', { name: /^Get 1 .*\$35/ })).toBeVisible();

    await dialog.getByRole('button', { name: 'Increase quantity' }).click();

    // Confirm label is dynamic - this is the exact trap a literal
    // string-match test would fall into after a quantity change.
    await expect(dialog.getByRole('button', { name: /^Get 2 .*\$70/ })).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel' }).click();
  });
});
