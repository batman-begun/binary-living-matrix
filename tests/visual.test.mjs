// SPDX-License-Identifier: MPL-2.0

import assert from 'node:assert/strict'
import test from 'node:test'
import { createGlyphField } from '../src/matrix/glyphField.ts'
import { renderWoman } from '../src/matrix/render.ts'

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

  renderWoman(canvas, field, width, height, { x: 29, y: 84, size: 1.38 })

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
