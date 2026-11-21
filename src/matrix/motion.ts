// SPDX-License-Identifier: MPL-2.0

export const SHAPES = ['woman', 'ocean', 'brain'] as const
export type Shape = typeof SHAPES[number]
export type Weights = readonly [number, number, number]
const MORPH_MS = 1650

export class Morph {
  target: Shape = 'woman'
  private from: Weights = [1, 0, 0]
  private start = -MORPH_MS

  at(now: number): Weights {
    const t = Math.max(0, Math.min(1, (now - this.start) / MORPH_MS))
    const eased = t * t * (3 - 2 * t)
    return SHAPES.map((shape, index) =>
      this.from[index] * (1 - eased) + (shape === this.target ? eased : 0),
    ) as unknown as Weights
  }

  set(shape: Shape, now: number) {
    if (shape === this.target) return
    this.from = this.at(now)
    this.target = shape
    this.start = now
  }

  settle() {
    this.start = -MORPH_MS
  }
}

export type Impression = { x: number; y: number; started: number; released?: number }
export const RELEASE_MS = 1150

export function touchStrength(touch: Impression, now: number): number {
  const end = touch.released ?? now
  const pressed = 1 - Math.exp(-Math.max(0, end - touch.started) / 55)
  if (touch.released === undefined) return pressed
  const age = now - touch.released
  if (age >= RELEASE_MS) return 0
  return pressed * Math.exp(-age / 260) * Math.cos(age / 72) * (1 - age / RELEASE_MS)
}
