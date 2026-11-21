// SPDX-License-Identifier: MPL-2.0

import type { Glyph } from './glyphField'
import { sampleWoman, type Portrait } from './woman.ts'

export const BACKGROUND = '#F7F7F4'
export const GLYPH_FONT = '400 8px ui-monospace, monospace'

export function renderWoman(
  canvas: HTMLCanvasElement,
  glyphs: readonly Glyph[],
  width: number,
  height: number,
  portrait: Portrait,
  devicePixelRatio = 1,
): void {
  const ratio = Math.min(devicePixelRatio, 2)
  canvas.width = Math.ceil(width * ratio)
  canvas.height = Math.ceil(height * ratio)
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) return

  context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0)
  context.fillStyle = BACKGROUND
  context.fillRect(0, 0, width, height)

  context.font = GLYPH_FONT
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  for (const glyph of glyphs) {
    const x = glyph.x * width
    const y = glyph.y * height
    const ink = sampleWoman(glyph, x, y, portrait)
    context.globalAlpha = ink.alpha
    context.fillStyle = ink.color
    context.fillText(glyph.bit === 0 ? '0' : '1', x, y)
  }
}
