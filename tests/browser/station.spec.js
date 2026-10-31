import { test, expect } from '@playwright/test';
async function tap(page, duration) {
  const key = page.locator('#telegraph-key');
  await key.scrollIntoViewIfNeeded();
  const box = await key.boundingBox();
  const client = await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2, id: 1 }] });
  await page.waitForTimeout(duration);
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}
test('English exercise: incorrect character stays, A advances, restart resets', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await page.locator('#sound').click();
  // Keyboard also works without focus on the telegraph button.
  await page.locator('h1').click();
  await page.keyboard.down('Space'); await page.waitForTimeout(70); await page.keyboard.up('Space');
  await expect(page.locator('#feedback')).toContainText('目标是 A');
  await expect(page.locator('#target-letter')).toHaveText('A');
  await tap(page, 70); await page.waitForTimeout(90); await tap(page, 260);
  await expect(page.locator('#target-letter')).toHaveText('L');
  await expect(page.locator('#accuracy')).toHaveText('准确率 50%');
  await page.locator('#restart').click(); await expect(page.locator('#target-letter')).toHaveText('A');
  expect(errors).toEqual([]);
});
test('modes, picker, free text, settings persist and interruption cancels input', async ({ page }) => {
  await page.goto('/'); await page.locator('#sound').click();
  await page.getByRole('button', { name: '模拟通联', exact: true }).click(); await expect(page.locator('#target-letter')).toHaveText('C');
  await page.locator('#choose-lesson').click(); await page.getByRole('button', { name: /交换信号报告/ }).click(); await expect(page.locator('#lesson-title')).toHaveText('交换信号报告');
  await page.getByRole('button', { name: '自由发报', exact: true }).click(); await tap(page, 60); await expect(page.locator('.free-output')).toHaveText('E');
  await page.locator('#telegraph-key').hover(); await page.mouse.down();
  await page.locator('#telegraph-key').dispatchEvent('pointercancel', { pointerId: 1 }); await page.mouse.up();
  await expect(page.locator('#telegraph-key')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#settings-button').click(); await page.locator('#delete-letter').click();
  await expect(page.locator('.free-output')).toHaveText('');
  await page.locator('#sensitivity').fill('250'); await page.locator('#letter-gap').fill('900');
  await page.reload(); await expect(page.locator('#sensitivity')).toHaveValue('250');
  await expect(page.locator('#sound')).toHaveAttribute('aria-checked', 'false');
  await page.locator('#settings-button').click(); await expect(page.locator('#letter-gap')).toHaveValue('900');
});
test('offline app shell reloads, fonts load, layout fits and reference opens', async ({ page, context }, info) => {
  await page.goto('/'); await expect(page.locator('#offline-state')).toHaveText('离线已就绪');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.impeccable/review/${info.project.name}.png`, fullPage: true });
  await page.locator('#reference-button').click(); await expect(page.locator('#reference-grid > div')).toHaveCount(46);
  await context.setOffline(true); await page.reload(); await expect(page.locator('#target-letter')).toHaveText('A');
  await page.locator('#sound').click(); await page.getByRole('button', { name: '自由发报', exact: true }).click(); await tap(page, 240); await expect(page.locator('.free-output')).toHaveText('T');
});

test('narrow screens remain usable and every paper character can be completed', async ({ page }) => {
  await page.goto('/'); await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#sound').click();
  await page.clock.install();
  const text = 'A LITTLE PRACTICE EVERY DAY GOES A LONG WAY. TAKE YOUR TIME AND FIND YOUR RHYTHM.';
  const { MORSE } = await import('../../src/morse.js');
  await page.locator('#telegraph-key').focus();
  for (const letter of text.replaceAll(' ', '')) {
    for (const mark of MORSE[letter]) {
      await page.keyboard.down('Space'); await page.clock.runFor(mark === '.' ? 70 : 250); await page.keyboard.up('Space'); await page.clock.runFor(80);
    }
    await page.clock.runFor(600);
  }
  await expect(page.locator('#target-label')).toHaveText('练习完成');
  await expect(page.locator('#accuracy')).toHaveText('准确率 100%');
  await expect(page.locator('#progress-fill')).toHaveAttribute('style', 'width: 100%;');
});
