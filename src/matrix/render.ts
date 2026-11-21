// SPDX-License-Identifier: MPL-2.0

import type { Glyph } from './glyphField'
import { sampleWoman, type Portrait } from './woman.ts'
import { touchStrength, type Impression, type Weights } from './motion.ts'

export const BACKGROUND = '#F7F7F4'
export const GLYPH_FONT = '400 8px ui-monospace, monospace'
const TAU = 2 * Math.PI
const clamp = (n: number) => Math.max(0, Math.min(1, n))

export function makeScene(glyphs: readonly Glyph[], width: number, height: number, portrait: Portrait) {
  const scale = Math.min(width * 0.37, height * 0.25)
  const cx = portrait.x + 120 * portrait.size
  const cy = portrait.y + 185 * portrait.size
  return glyphs.map(glyph => {
    const x = glyph.x * width
    const y = glyph.y * height
    const u = (x - cx) / scale
    const v = (y - cy) / scale
    const lobe = ((Math.abs(u) - 0.34) / 0.68) ** 2 + ((v + 0.08 * Math.cos(u * 3)) / 0.64) ** 2
    const folds = (1 + Math.cos(u * 18 + v * 9 + 2.4 * Math.sin(v * 8))) / 2
    return {
      bit: glyph.bit === 0 ? '0' : '1',
      x, y, nx: glyph.x, ny: glyph.y, v,
      ambient: 0.13 + glyph.tone * 0.12,
      woman: sampleWoman(glyph, x, y, portrait),
      brain: clamp((1.18 - lobe) * 2.4) * (0.28 + 0.52 * folds) * (0.55 + 0.45 * clamp(Math.abs(u) * 15)),
      phase: u * 3 + v * 5,
    }
  })
}

export function bindCanvas(canvas: HTMLCanvasElement, width: number, height: number, devicePixelRatio = 1) {
  const ratio = Math.min(devicePixelRatio, 2)
  canvas.width = Math.ceil(width * ratio)
  canvas.height = Math.ceil(height * ratio)
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) return null

  context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0)
  context.font = GLYPH_FONT
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  return context
}

export function drawScene(
  context: CanvasRenderingContext2D, scene: ReturnType<typeof makeScene>, width: number, height: number,
  weights: Weights, now: number, touches: readonly Impression[] = [], pulseAt = -Infinity, still = false,
) {
  const [woman, ocean, brain] = weights
  const time = still ? 0 : now / 1000
  const forces = touches.map(touch => ({ ...touch, strength: touchStrength(touch, now) }))
  const radius = Math.min(100, width * 0.22)
  context.globalAlpha = 1
  context.fillStyle = BACKGROUND
  context.fillRect(0, 0, width, height)

  for (const glyph of scene) {
    let { x, y } = glyph
    let red = 0
    let green = 0
    let ink = 0
    if (woman > 0) {
      const breath = still ? 0 : Math.sin(time * TAU / 6.1 + glyph.ny * 2.4 + glyph.nx * 0.7)
      const influence = Math.min(1, glyph.woman.ink * 1.8)
      x += (glyph.nx - 0.5) * breath * influence * woman * 17
      y += breath * influence * woman * -2.8
      const tone = glyph.woman.ink * woman * (0.9 + breath * 0.1)
      ink += tone
      red += glyph.woman.red * tone
      green += glyph.woman.green * tone
    }
    if (ocean > 0) {
      const depth = clamp((glyph.ny - 0.25) / 0.68)
      const sweep = Math.sin(glyph.nx * 7.5 + glyph.ny * 12 - time * 0.9)
      const cross = Math.sin(glyph.nx * 14 - glyph.ny * 14 + time * 1.29)
      const band = Math.cos(glyph.nx * 2.5 + Math.sqrt(depth) * 32 + sweep * 1.3 + cross * 0.45 - time * 1.15)
      const presence = Math.min(1, depth * 7) * (1 - clamp((glyph.ny - 0.9) * 8) * 0.6)
      const tide = (sweep * 0.72 + cross * 0.28) * (3 + 12 * depth)
      x += cross * depth * 5 * ocean
      y += tide * ocean * presence
      const tone = presence * ((band + 1) / 2) ** 2.25 * (0.3 + 0.42 * depth) * ocean
      ink += tone
      red += 178 * tone
      green += (72 - 30 * depth) * tone
    }
    if (brain > 0) {
      const drift = Math.sin(time * 1.34)
      const neuralAge = now - pulseAt
      const pulse = still || neuralAge >= 900 ? 0 : Math.max(0, 1 - neuralAge / 900) * Math.max(0, Math.cos(glyph.phase - neuralAge / 62))
      x += Math.sin(time * 0.76 + glyph.v) * glyph.brain * brain * 7
      y += drift * glyph.brain * brain * 11
      const tone = glyph.brain * brain * (0.87 + 0.09 * Math.sin(time * 1.9 + glyph.phase) + pulse * 0.27)
      ink += tone
      red += (177 + pulse * 42) * tone
      green += (46 - pulse * 14) * tone
    }

    for (const force of forces) {
      const dx = x - force.x
      const dy = y - force.y
      const distance = (dx * dx + dy * dy) / (radius * radius)
      if (distance >= 1) continue
      const falloff = (1 - distance) ** 2 * force.strength
      x += dx * falloff * 0.52
      y += (dy * 0.30 + radius * 0.14) * falloff
    }

    context.globalAlpha = Math.min(0.95, glyph.ambient + ink * 0.83)
    context.fillStyle = ink > 0.023
      ? `rgb(${Math.round(red / ink)}, ${Math.round(green / ink)}, ${Math.round(green / ink) + 12})`
      : '#625c56'
    context.fillText(glyph.bit, x, y)
  }
}
