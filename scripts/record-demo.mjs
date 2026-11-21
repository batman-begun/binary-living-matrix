// SPDX-License-Identifier: MPL-2.0

import { spawn, spawnSync } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const url = 'http://127.0.0.1:4176'
const viewport = { width: 430, height: 880 }
const out = 'dist/demo'
const temp = await mkdtemp(join(tmpdir(), 'matrix-demo-'))
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview',
  '--host', '127.0.0.1', '--port', '4176', '--strictPort'], { stdio: 'inherit' })
let browser
try {
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error('Preview server stopped')
    if (await fetch(url).then(response => response.ok).catch(() => false)) break
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  await mkdir(out, { recursive: true })
  browser = await chromium.launch()
  const settings = { viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true }
  const bench = await browser.newPage(settings)
  await bench.goto(url)
  await bench.getByText('Open Lab', { exact: true }).click()
  const samples = {}
  for (const mode of ['auto', 'eco', 'high']) {
    await bench.getByLabel('Quality').selectOption(mode)
    await bench.waitForTimeout(3200)
    await bench.touchscreen.tap(180, 200)
    await bench.waitForTimeout(1050)
    samples[mode] = await bench.locator('.diagnostics div').evaluateAll(nodes =>
      Object.fromEntries(nodes.map(node => [node.querySelector('dt').textContent, node.querySelector('dd').textContent])))
  }
  await writeFile(join(out, 'benchmark.json'), JSON.stringify({
    environment: 'Playwright Chromium, emulated mobile viewport', viewport,
    browser: browser.version(), revision: process.env.GITHUB_SHA ?? null, samples,
  }, null, 2) + '\n')
  await bench.close()

  const context = await browser.newContext({ ...settings, recordVideo: { dir: temp, size: viewport } })
  const page = await context.newPage()
  const video = page.video()
  const hold = ms => page.waitForTimeout(ms)
  await page.goto(url)
  await page.getByRole('heading', { name: 'Binary Living Matrix' }).waitFor()
  await hold(1400)
  await page.screenshot({ path: join(out, 'woman.png') })
  await page.touchscreen.tap(198, 300)
  await hold(1700)
  await page.getByRole('button', { name: 'Surface' }).tap()
  await hold(2400)
  await page.screenshot({ path: join(out, 'ocean.png') })
  const prompt = page.getByRole('textbox', { name: 'Visual prompt' })
  await prompt.tap()
  await hold(1900)
  await prompt.pressSequentially('hello matrix', { delay: 130 })
  await page.screenshot({ path: join(out, 'brain.png') })
  await hold(650)
  await prompt.blur()
  await hold(2350)
  await context.close()

  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', await video.path(),
    '-c:v', 'libx264', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(out, 'matrix-demo.mp4')],
  { stdio: 'inherit' })
  if (result.status !== 0) throw result.error ?? new Error('Demo video encoding failed')
} finally {
  await browser?.close()
  server.kill()
  await rm(temp, { recursive: true, force: true })
}
