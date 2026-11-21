// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict'
import test from 'node:test'
import { frameAbovePrompt } from '../src/matrix/viewport.ts'

test('brain stays above the prompt in the scrolled keyboard viewport', () => {
  const canvas = { left: 0, top: -340, right: 390, bottom: 504 }
  const viewport = { left: 0, top: 22, width: 390, height: 408 }
  const promptTop = 346
  const brain = frameAbovePrompt(canvas, viewport, promptTop)
  const screenY = brain.y + canvas.top
  assert.equal(brain.x, 195)
  assert.ok(screenY - brain.scale * 0.75 >= viewport.top)
  assert.ok(screenY + brain.scale * 0.75 <= promptTop)
})
