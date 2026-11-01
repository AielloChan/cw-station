import { test, expect } from '@playwright/test';
async function typeMorse(page, text) {
  const { MORSE } = await import('../../src/morse.js');
  await page.locator('#telegraph-key').focus();
  for (const letter of text.replaceAll(' ', '')) {
    for (const mark of MORSE[letter]) {
      await page.keyboard.down('Space'); await page.clock.runFor(mark === '.' ? 70 : 250); await page.keyboard.up('Space'); await page.clock.runFor(80);
    }
    await page.clock.runFor(600);
  }
}

test('received A is clearly previous input while C is the next target', async ({ page }) => {
  await page.goto('/'); await page.locator('#sound').click(); await page.clock.install();
  await typeMorse(page, 'A LITTLE PRA');
  await expect(page.locator('#paper-text .current')).toHaveText('C');
  await expect(page.locator('#paper-progress')).toHaveText('已完成 10 / 66 字符');
  await expect(page.locator('#decoded')).toHaveText('A');
  await expect(page.locator('.signal-block .panel-label')).toHaveText('上一字 · 正确');
  await expect(page.locator('#feedback')).toHaveText('A 已完成，请输入 C。');
  await page.setViewportSize({ width: 615, height: 897 });
  await page.screenshot({ path: '.impeccable/review/receiver-615.png', fullPage: true });
  await page.locator('#telegraph-key').focus(); await page.keyboard.down('Space');
  await expect(page.locator('.signal-block .panel-label')).toHaveText('正在输入');
  await expect(page.locator('#decoded')).toHaveText('');
  await expect(page.locator('#feedback')).toHaveText('正在输入 C；松开并停顿后自动识别。');
  await page.clock.runFor(70); await page.keyboard.up('Space');
  await expect(page.locator('.signal-block .panel-label')).toHaveText('等待识别');
  await page.clock.runFor(600);
  await expect(page.locator('#target-letter')).toHaveText('C');
  await expect(page.locator('.signal-block .panel-label')).toHaveText('上一字 · 未匹配');
  await expect(page.locator('#feedback')).toContainText('目标是 C');
  await typeMorse(page, 'C');
  await expect(page.locator('#decoded')).toHaveText('C');
  await expect(page.locator('#target-letter')).toHaveText('T');
  await expect(page.locator('#feedback')).toHaveText('C 已完成，请输入 T。');
});
async function tap(page, duration, selector = '#telegraph-key') {
  const key = page.locator(selector);
  await key.scrollIntoViewIfNeeded();
  const box = await key.boundingBox();
  const client = await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2, id: 1 }] });
  await page.waitForTimeout(duration);
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}
test('long touches do not select practice text or open a context menu', async ({ page }) => {
  await page.goto('/'); await page.locator('#sound').click();
  await page.getByRole('button', { name: '自由发报', exact: true }).click();
  await tap(page, 700, '#paper-text');
  expect(await page.evaluate(() => window.getSelection().toString())).toBe('');
  expect(await page.locator('#paper-text').evaluate(element => getComputedStyle(element).userSelect)).toBe('none');
  expect(await page.locator('#feedback').evaluate(element => getComputedStyle(element).userSelect)).toBe('none');
  expect(await page.locator('#paper-text').evaluate(element => {
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    element.dispatchEvent(event); return event.defaultPrevented;
  })).toBe(true);
  await tap(page, 700);
  await expect(page.locator('.free-output')).toHaveText('T');
  await expect(page.locator('#telegraph-key')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#receiver-label')).toHaveText('上一字 · 已识别');
  await page.getByRole('button', { name: '英文练习', exact: true }).click();
  await expect(page.locator('#decoded')).toHaveText('');
  await expect(page.locator('#receiver-label')).toHaveText('输入状态');
});
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

test('speed meter follows a rolling window and handbook is accessible offline', async ({ page, context }, info) => {
  await page.clock.install();
  await page.goto('/'); await expect(page.locator('#offline-state')).toHaveText('离线已就绪');
  await page.locator('#sound').click();
  await typeMorse(page, 'AE'); // A correct, E incorrect: both physically sent.
  await expect(page.locator('#speed-value')).toHaveText('0.8');
  await page.locator('#speed-button').click();
  await expect(page.getByRole('dialog', { name: '快慢之间，自有节奏。' })).toBeVisible();
  await expect(page.locator('#speed-detail-cpm')).toHaveText('4');
  await expect(page.locator('#speed-detail-accuracy')).toHaveText('50%');
  await expect(page.locator('#speed-window-summary')).toContainText('正确输出 0.4 WPM');
  await page.locator('#speed-dialog').focus();
  await page.keyboard.press('Space'); await page.clock.runFor(1000);
  await expect(page.locator('#telegraph-key')).toHaveAttribute('aria-pressed', 'false');
  await page.screenshot({ path: `.impeccable/review/speed-guide-${info.project.name}.png` });
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.locator('#speed-dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.locator('.speed-method summary').click();
  await expect(page.locator('.speed-method')).toHaveAttribute('open', '');
  await page.clock.runFor(30000);
  await expect(page.locator('#speed-detail-wpm')).toHaveText('0.0');
  await page.keyboard.press('Escape'); await expect(page.locator('#speed-dialog')).not.toBeVisible();
  await page.getByRole('button', { name: '自由发报', exact: true }).click();
  await expect(page.locator('#speed-sampling')).toHaveText('敲击后开始计速');
  await typeMorse(page, 'E'); await page.locator('#settings-button').click();
  await page.locator('#delete-letter').click(); await page.locator('#insert-space').click();
  await expect(page.locator('#speed-value')).toHaveText('0.4');
  await page.locator('#speed-button').click();
  await expect(page.locator('#speed-detail-accuracy')).toHaveText('—');
  await page.locator('#close-speed').click();
  await context.setOffline(true); await page.reload();
  await page.locator('#speed-button').click(); await expect(page.locator('#speed-title')).toBeVisible();
  await expect(page.locator('.record-note')).toContainText('283');
});

test('audition and cancelled input do not increase sending speed', async ({ page }) => {
  await page.clock.install(); await page.goto('/');
  await page.locator('#listen').click(); await page.clock.runFor(2000);
  await expect(page.locator('#speed-value')).toHaveText('0.0');
  await expect(page.locator('#speed-sampling')).toHaveText('敲击后开始计速');
  await page.locator('#sound').click(); await typeMorse(page, 'A');
  await page.locator('#telegraph-key').focus();
  await page.keyboard.down('Space'); await page.clock.runFor(70); await page.keyboard.up('Space');
  await page.locator('#speed-button').click(); // cancels the pending letter
  await page.clock.runFor(1000); await expect(page.locator('#speed-value')).toHaveText('0.4');
  await page.locator('#close-speed').click(); await page.locator('#restart').click();
  await expect(page.locator('#speed-value')).toHaveText('0.0');
});
