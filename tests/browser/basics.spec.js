import { test, expect } from '@playwright/test';
import { MORSE } from '../../src/morse.js';
async function send(page, text, unit=150) {
  await page.locator('#telegraph-key').focus();
  for(const char of text) {
    for(const mark of MORSE[char]) {
      await page.keyboard.down('Space'); await page.clock.runFor(mark==='.'?unit:unit*3); await page.keyboard.up('Space'); await page.clock.runFor(unit);
    }
    await page.clock.runFor(unit*3);
  }
}

test('beginner sheet teaches repeated rows, advances through letters and offers the next lesson', async ({ page },info) => {
  await page.emulateMedia({reducedMotion:'reduce'}); await page.clock.install(); await page.goto('/'); await page.locator('#sound').click();
  await page.locator('#tempo').fill('20');
  await page.getByRole('button',{name:'基础学习',exact:true}).click();
  await expect(page.locator('#sensitivity-value')).toHaveText('8 WPM');
  await expect(page.locator('.drill-row')).toHaveCount(4);
  await expect(page.locator('.drill-chars').nth(0)).toHaveText('AAAAAAAA');
  await expect(page.locator('.drill-chars').nth(1)).toHaveText('BBBBBBBB');
  await expect(page.locator('#target-code')).toHaveText('· −');
  await send(page,'A'.repeat(8)); await expect(page.locator('#target-letter')).toHaveText('B');
  await expect(page.locator('#paper-progress')).toHaveText('已完成 8 / 32 字符');
  await send(page,'B'.repeat(8)+'C'.repeat(8)+'D'.repeat(8));
  await expect(page.locator('#target-label')).toHaveText('练习完成');
  await expect(page.locator('#feedback')).toContainText('本课完成');
  await expect(page.locator('#accuracy')).toHaveText('准确率 100%');
  await page.locator('#next-basic').click(); await expect(page.locator('#lesson-title')).toHaveText('E–H · 逐行练习');
  await page.setViewportSize({width:320,height:568});
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('#next-basic')).toBeVisible();
  await page.screenshot({path:`.impeccable/review/basics-${info.project.name}.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight)).toBe(true);
  await page.locator('#tempo').fill('15');
  await page.getByRole('button',{name:'英文练习',exact:true}).click();
  await expect(page.locator('#sensitivity-value')).toHaveText('20 WPM');
  await page.reload(); await page.getByRole('button',{name:'基础学习',exact:true}).click();
  await expect(page.locator('#sensitivity-value')).toHaveText('15 WPM');
});

test('individual characters and mixed reviews are selectable offline and hints stay available', async ({ page,context }) => {
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/');
  await expect(page.locator('#offline-state')).toHaveText('离线已就绪');
  await page.locator('#settings-button').click(); await page.locator('#show-hint').uncheck(); await page.locator('#close-settings').click();
  await page.getByRole('button',{name:'基础学习',exact:true}).click(); await expect(page.locator('#target-code')).toHaveText('· −');
  await page.locator('#settings-button').click(); await expect(page.locator('#show-hint')).toBeChecked(); await expect(page.locator('#show-hint')).toBeDisabled(); await page.locator('#close-settings').click();
  await context.setOffline(true); await page.locator('#choose-lesson').click();
  await expect(page.locator('#lesson-picker-title')).toHaveText('选择基础课程');
  await expect(page.locator('#lesson-count')).toHaveText('53 / 53 课');
  await page.locator('#lesson-search').fill('Z · 单字'); await page.locator('.lesson-option').click();
  await expect(page.locator('#target-letter')).toHaveText('Z'); await expect(page.locator('.drill-row')).toHaveCount(2);
  await page.locator('#choose-lesson').click(); await page.locator('#lesson-category').selectOption('混合复习');
  await expect(page.locator('.lesson-option')).toHaveCount(8); await page.locator('.lesson-option').last().click();
  await expect(page.locator('#next-basic')).toBeDisabled();
  await page.getByRole('button',{name:'英文练习',exact:true}).click(); await expect(page.locator('#target-code')).toHaveText('提示已隐藏');
});
