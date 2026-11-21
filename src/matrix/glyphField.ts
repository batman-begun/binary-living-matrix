// SPDX-License-Identifier: MPL-2.0

export type Glyph = Readonly<{
  id: number
  bit: 0 | 1
  x: number
  y: number
  tone: number
}>

export function createGlyphField(columns: number, rows: number, seed: number): Glyph[] {
  let state = seed >>> 0
  function next() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 0x100000000
  }

  return Array.from({ length: columns * rows }, (_, id) => ({
    id,
    bit: next() < 0.5 ? 0 : 1,
    x: (id % columns + 0.5 + (next() - 0.5) * 0.32) / columns,
    y: (Math.floor(id / columns) + 0.5 + (next() - 0.5) * 0.32) / rows,
    tone: next(),
  }))
}
