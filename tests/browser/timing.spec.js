import { test, expect } from '@playwright/test';

test('20 WPM setting decodes consecutive letters after 180ms instead of merging across the old 600ms wait', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'}); await page.clock.install(); await page.goto('/');
  await page.clock.pauseAt(await page.evaluate(() => Date.now()+1000));
  await page.locator('#sound').click(); await page.locator('#tempo').fill('20');
  await page.getByRole('button',{name:'自由发报',exact:true}).click(); await page.locator('#telegraph-key').focus();
  await page.keyboard.down('Space'); await page.clock.runFor(60); await page.keyboard.up('Space'); await page.clock.runFor(60);
  await page.keyboard.down('Space'); await page.clock.runFor(180); await page.keyboard.up('Space');
  await expect(page.locator('#receiver-label')).toContainText('180ms');
  await page.clock.runFor(179); await expect(page.locator('.free-output')).toHaveText('');
  await page.clock.runFor(1); await expect(page.locator('.free-output')).toHaveText('A');
  await page.keyboard.down('Space'); await page.clock.runFor(60); await page.keyboard.up('Space'); await page.clock.runFor(180);
  await expect(page.locator('.free-output')).toHaveText('AE');
  await expect(page.locator('#speed-value')).toHaveText('0.8');
  await page.reload(); await expect(page.locator('#tempo')).toHaveValue('20');
});

test('manual controls explain the actual cutoff and waiting time; presets restore linked timing', async ({ page }) => {
  await page.goto('/'); await page.locator('#settings-button').click();
  await expect(page.locator('#timing-preview')).toContainText('300ms');
  await expect(page.locator('#letter-gap')).toBeDisabled();
  await page.locator('#manual-timing').check();
  await page.locator('#sensitivity').fill('100'); await page.locator('#letter-gap').fill('120');
  await expect(page.locator('#timing-preview')).toContainText('120ms');
  await expect(page.locator('#sensitivity-value')).toHaveText('手动');
  await page.getByRole('button',{name:'快速 · 25 WPM',exact:true}).click();
  await expect(page.locator('#manual-timing')).not.toBeChecked();
  await expect(page.locator('#timing-preview')).toContainText('144ms');
  await expect(page.locator('#letter-gap')).toBeDisabled();
  await page.locator('#close-settings').click(); await expect(page.locator('#sensitivity-value')).toHaveText('25 WPM');
});
