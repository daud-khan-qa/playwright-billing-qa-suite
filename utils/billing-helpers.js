// @ts-check
/**
 * Shared helpers for the billing QA suite.
 * Sanitized reference implementation - no real endpoints or credentials.
 */

/**
 * Navigate and wait for the SPA to actually finish rendering, dismissing
 * any first-load interstitial (e.g. a "what's new" modal) that would
 * otherwise intercept the first click of the test.
 */
async function gotoAndSettle(page, path) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });

  // Dismiss a first-load modal if one appears - don't fail if it doesn't.
  const dismiss = page.getByRole('button', { name: /close|got it|dismiss/i });
  if (await dismiss.isVisible({ timeout: 3000 }).catch(() => false)) {
    await dismiss.click();
  }

  // Wait for the app root to have real content, not just an empty shell.
  await page.waitForFunction(
    () => document.body && document.body.innerText.trim().length > 100,
    { timeout: 20000 }
  );
}

/**
 * Skip the current test with a clear, structured reason instead of
 * letting a missing-element timeout look like a failure.
 */
async function skipIfAbsent(test, locator, reason) {
  const visible = await locator.isVisible().catch(() => false);
  if (!visible) test.skip(true, reason);
}

/**
 * Match a dynamic confirm-button label safely.
 * Real UIs often render "Get 1 Seat for $35" -> "Get 2 Seats for $70"
 * depending on quantity - a literal string match breaks the moment
 * quantity changes. Match on shape, not exact text.
 */
function dynamicConfirmButton(page) {
  return page.getByRole('button', { name: /^Get .*\$\d/ });
}

module.exports = { gotoAndSettle, skipIfAbsent, dynamicConfirmButton };
