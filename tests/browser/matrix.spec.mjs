// SPDX-License-Identifier: MPL-2.0

import { expect, test } from '@playwright/test'

test('showcase triggers, automatic return, keyboard controls and reset', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('img', { name: /woman/i })).toBeAttached()
  const surface = page.getByRole('button', { name: 'Surface' })
  await surface.press('Enter')
  await expect(surface).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('img', { name: /woman/i })).toBeAttached({ timeout: 12000 })

  const prompt = page.getByRole('textbox', { name: 'Visual prompt' })
  await prompt.fill('hello matrix')
  await expect(page.getByRole('img', { name: /brain/i })).toBeAttached()
  await prompt.press('Enter')
  await expect(page.getByRole('status')).toContainText('no message was sent')
  await surface.focus()
  await expect(page.getByRole('img', { name: /woman/i })).toBeAttached()

  await page.getByText('Open Lab', { exact: true }).click()
  await page.getByLabel('Quality').selectOption('high')
  const count = () => page.locator('.diagnostics div').filter({ has: page.getByText('Glyphs', { exact: true }) }).locator('dd')
  await expect.poll(async () => Number(await count().textContent())).toBeGreaterThan(100)
  const highCount = Number(await count().textContent())
  await page.getByLabel('Quality').selectOption('eco')
  await expect.poll(async () => Number(await count().textContent())).toBeLessThan(highCount)
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.getByLabel('Quality')).toHaveValue('auto')
  await expect(prompt).toHaveValue('')
  expect(errors).toEqual([])
})

test('reduced motion is stable across a narrow portrait and a resize', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 340, height: 730 })
  await page.goto('/')
  const canvas = page.locator('canvas')
  const image = () => canvas.evaluate(node => node.toDataURL())
  await expect.poll(async () => (await image()).length).toBeGreaterThan(10000)
  const still = await image()
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  expect(await image()).toEqual(still)
  await page.getByRole('textbox', { name: 'Visual prompt' }).focus()
  await expect.poll(image).not.toEqual(still)
  await page.setViewportSize({ width: 730, height: 390 })
  await expect.poll(() => canvas.evaluate(node => node.getBoundingClientRect().width)).toBe(730)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(730)
  await page.getByText('Open Lab', { exact: true }).click()
  await expect(page.getByLabel('Motion')).toHaveValue('still')
})

test('pointer interaction renders a touch sample on the running canvas', async ({ page, isMobile }) => {
  await page.goto('/')
  const canvas = page.locator('canvas')
  await expect.poll(() => canvas.evaluate(node => node.width)).toBeGreaterThan(300)
  if (isMobile) await page.touchscreen.tap(180, 230)
  else {
    await page.mouse.move(180, 230)
    await page.mouse.down()
    await page.mouse.move(220, 250, { steps: 4 })
    await page.mouse.up()
  }
  await page.getByText('Open Lab', { exact: true }).click()
  await expect(page.locator('.diagnostics div').filter({ hasText: 'Touch to draw' })).toContainText(/\d+(\.\d+)? ms/)
})
