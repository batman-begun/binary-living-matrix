// SPDX-License-Identifier: MPL-2.0

import assert from 'node:assert/strict'
import test from 'node:test'
import { createGlyphField } from '../src/matrix/glyphField.ts'
import { bindCanvas, makeScene, drawScene } from '../src/matrix/render.ts'

test('the same seed and grid preserve glyph IDs, bits and positions', () => {
  const field = createGlyphField(43, 77, 1973)
  assert.deepEqual(field, createGlyphField(43, 77, 1973))
  assert.equal(new Set(field.map(glyph => glyph.id)).size, field.length)
  assert.equal(field.length, 3311)
})

test('the renderer draws one ivory fill and uniform binary text to all four edges', () => {
  const glyphs = []
  const fills = []
  const context = {
    setTransform() {},
    fillRect(...bounds) { fills.push([this.fillStyle, ...bounds]) },
    fillText(bit, x, y) { glyphs.push({ bit, x, y, font: this.font, color: this.fillStyle }) },
  }
  const canvas = { getContext: () => context }
  const width = 390
  const height = 844
  const field = createGlyphField(43, 77, 1973)

  bindCanvas(canvas, width, height)
  const scene = makeScene(field, width, height, { x: 29, y: 84, size: 1.16 })
  drawScene(context, scene, width, height, [1, 0, 0], 0)

  assert.deepEqual(fills, [['#F7F7F4', 0, 0, width, height]])
  assert.equal(glyphs.length, field.length)
  assert.deepEqual(new Set(glyphs.map(glyph => glyph.bit)), new Set(['0', '1']))
  assert.deepEqual(new Set(glyphs.map(glyph => glyph.font)), new Set(['400 8px ui-monospace, monospace']))
  assert.ok(glyphs.some(glyph => glyph.color.startsWith('rgb(')))
  assert.ok(glyphs.some(glyph => glyph.x < 8))
  assert.ok(glyphs.some(glyph => glyph.y < 8))
  assert.ok(glyphs.some(glyph => glyph.x > width - 8))
  assert.ok(glyphs.some(glyph => glyph.y > height - 8))
})

test('all three shapes use the same digits, respond locally, and recover', () => {
  const width = 390
  const height = 844
  const scene = makeScene(createGlyphField(43, 77, 1973), width, height, { x: 65, y: 65, size: 1.1 })
  let drawn
  const context = {
    fillRect() {},
    fillText(bit, x, y) { drawn.push({ bit, x, y, alpha: this.globalAlpha }) },
  }

  for (const shape of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) {
    const touch = { x: 195, y: 360, started: 100 }
    const render = (touches = []) => {
      drawn = []
      drawScene(context, scene, width, height, shape, 1800, touches)
      return drawn
    }
    const baseline = render()
    const pressed = render([touch])
    assert.ok(baseline.every((g, i) => g.bit === scene[i].bit && Number.isFinite(g.alpha)))
    assert.ok(pressed.some((g, i) => Math.hypot(g.x - baseline[i].x, g.y - baseline[i].y) > 1))
    assert.deepEqual(pressed[0], baseline[0])
    assert.deepEqual(render([{ ...touch, released: 400 }]), baseline)
  }
})
