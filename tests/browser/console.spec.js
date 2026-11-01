import { test, expect } from '@playwright/test';

async function assertConsoleFits(page) {
  await expect(page.locator('body')).toHaveClass(/console-mode/);
  await expect.poll(() => page.evaluate(() => ({
    x: document.documentElement.scrollWidth > innerWidth,
    y: document.documentElement.scrollHeight > innerHeight,
  }))).toEqual({ x: false, y: false });
  for (const selector of ['.paper-window','#paper-text','#telegraph-key','.controls','#speed-button']) {
    const rect = await page.locator(selector).boundingBox();
    expect(rect.y, selector).toBeGreaterThanOrEqual(0);
    expect(rect.y + rect.height, selector).toBeLessThanOrEqual((await page.viewportSize()).height + 1);
    expect(rect.height, selector).toBeGreaterThan(20);
  }
}

test('console fits short phones, portrait, landscape and resized browser height', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/');
  for (const [width,height] of [[320,568],[390,844],[390,660],[844,390]]) {
    await page.setViewportSize({ width,height }); await assertConsoleFits(page);
    await page.screenshot({ path: `.impeccable/review/console-${width}x${height}-${info.project.name}.png` });
  }
  await page.addStyleTag({ content: '.console-mode main{padding:0 44px 21px!important}' });
  await assertConsoleFits(page); // Simulate the available space around a landscape notch/home indicator.
  await page.locator('#settings-button').click(); await expect(page.locator('#settings-title')).toBeVisible();
  await page.locator('#manual-timing').check(); await page.locator('#letter-gap').fill('900'); await page.locator('#show-hint').uncheck();
  await page.locator('#close-settings').click(); await assertConsoleFits(page);
  await page.locator('#reference-button').click(); await expect(page.locator('#reference-grid > div')).toHaveCount(46);
  await page.locator('#close-reference').click();
  await page.locator('#choose-lesson').click(); await page.locator('#lesson-search').fill('wonderland');
  await page.locator('.lesson-option').first().click(); await assertConsoleFits(page);
  await page.locator('#settings-button').click(); await expect(page.locator('#settings-source')).toContainText('Lewis Carroll');
  await page.locator('#install-from-settings').click(); await expect(page.locator('#install-dialog')).toBeVisible();
});

test('desktop immersion enters, exits, and preserves the current exercise', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.setViewportSize({ width:1440,height:1000 }); await page.goto('/');
  await expect(page.locator('body')).not.toHaveClass(/console-mode/);
  await page.locator('#sound').click(); await page.clock.install(); await page.locator('#telegraph-key').focus();
  await page.keyboard.down('Enter'); await page.clock.runFor(70); await page.keyboard.up('Enter'); await page.clock.runFor(100);
  await page.keyboard.down('Enter'); await page.clock.runFor(250); await page.keyboard.up('Enter'); await page.clock.runFor(700);
  await expect(page.locator('#target-letter')).toHaveText('L');
  await page.locator('#immersive-toggle').click(); await assertConsoleFits(page);
  await expect(page.locator('#target-letter')).toHaveText('L');
  await page.locator('#immersive-toggle').click(); await expect(page.locator('body')).not.toHaveClass(/console-mode/);
  await expect(page.locator('#target-letter')).toHaveText('L');
});

test('touch slider remains draggable while the console and key remain stationary', async ({ page }) => {
  await page.setViewportSize({width:390,height:660}); await page.goto('/');
  const keyBefore=await page.locator('#telegraph-key').boundingBox();
  const slider=await page.locator('#tempo').boundingBox();
  const client=await page.context().newCDPSession(page);
  const point=f=>({x:slider.x+slider.width*f,y:slider.y+slider.height/2,id:1});
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(.5)]});
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(.9)]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await client.detach();
  expect(Number(await page.locator('#tempo').inputValue())).toBeGreaterThan(30);
  await expect(page.locator('#telegraph-key')).toHaveAttribute('aria-pressed','false');
  expect(await page.locator('#telegraph-key').boundingBox()).toEqual(keyBefore);
});
