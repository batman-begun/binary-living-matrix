// SPDX-License-Identifier: MPL-2.0

import type { Glyph } from './glyphField'

export type Portrait = Readonly<{ x: number; y: number; size: number }>

// Original portrait contours in a 240 × 320 coordinate space.
// The mask is sampled only at glyph positions.
const outline = [
  [81, 182], [72, 151], [72, 120], [81, 89], [94, 62], [112, 43], [132, 33],
  [157, 30], [176, 36], [192, 49], [201, 64], [204, 78], [203, 93], [207, 105],
  [212, 113], [222, 124], [222, 129], [210, 133], [210, 141], [214, 147],
  [208, 152], [210, 157], [205, 162], [207, 171], [201, 179], [190, 182],
  [179, 183], [171, 191], [168, 205], [170, 220], [179, 232], [195, 241],
  [211, 254], [223, 275], [229, 299], [228, 318], [25, 318], [29, 291],
  [40, 270], [57, 254], [76, 241], [86, 226], [91, 210],
] as const

function signedDistance(x: number, y: number): number {
  let inside = false
  let nearest = Infinity
  for (let i = 0; i < outline.length; i++) {
    const [ax, ay] = outline[i]
    const [bx, by] = outline[(i + 1) % outline.length]
    if ((ay > y) !== (by > y) && x < ax + (bx - ax) * (y - ay) / (by - ay)) {
      inside = !inside
    }
    const dx = bx - ax
    const dy = by - ay
    const fraction = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
    nearest = Math.min(nearest, (x - ax - fraction * dx) ** 2 + (y - ay - fraction * dy) ** 2)
  }
  return Math.sqrt(nearest) * (inside ? 1 : -1)
}

function smoothstep(low: number, high: number, value: number): number {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)))
  return t * t * (3 - 2 * t)
}

export function sampleWoman(glyph: Glyph, x: number, y: number, portrait: Portrait) {
  const u = (x - portrait.x) / portrait.size
  const v = (y - portrait.y) / portrait.size
  const hairline = 165 - 0.0026 * (v - 97) ** 2
  const hair = (1 - smoothstep(hairline - 17, hairline + 23, u)) * (1 - smoothstep(195, 270, v))
  const cheek = Math.exp(-((u - 192) ** 2 / 340 + (v - 137) ** 2 / 1100))
  const edge = smoothstep(-10, 12, signedDistance(u, v) + (glyph.tone - 0.5) * 7)
  const fade = 1 - smoothstep(250, 315, v)
  const ink = edge * fade * (0.43 + hair * 0.36 - cheek * 0.24 + glyph.tone * 0.16)
  const red = Math.round(157 + 55 * (1 - hair))
  const green = Math.round(35 + 40 * (1 - hair))
  return {
    color: ink > 0.023 ? `rgb(${red}, ${green}, ${green + 12})` : '#625c56',
    alpha: Math.min(0.95, 0.13 + glyph.tone * 0.12 + ink * 0.83),
  }
}
