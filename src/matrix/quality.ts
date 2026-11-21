// SPDX-License-Identifier: MPL-2.0

export type QualityMode = 'auto' | 'eco' | 'high'
export type QualityTier = Exclude<QualityMode, 'auto'>

export const QUALITY = {
  high: { density: 1, dpr: 2, fps: 60 },
  eco: { density: 0.71, dpr: 1.25, fps: 30 },
} as const

export class AutoQuality {
  tier: QualityTier = 'high'
  private streak = 0

  sample(drawMs: number, refreshMs: number) {
    const qualifying = this.tier === 'high'
      ? drawMs > 11 || refreshMs > 23
      : drawMs < 5 && refreshMs < 19
    this.streak = qualifying ? this.streak + 1 : 0
    if (this.streak >= (this.tier === 'high' ? 2 : 5)) {
      this.tier = this.tier === 'high' ? 'eco' : 'high'
      this.streak = 0
    }
    return this.tier
  }
}

export type Diagnostics = {
  tier: QualityTier
  fps: number
  frameP95: number
  drawMs: number
  touchMs: number | null
  glyphs: number
  dpr: number
  renderer: 'Canvas 2D' | 'Unavailable'
}

export function percentile95(samples: readonly number[]) {
  if (!samples.length) return 0
  const sorted = [...samples].sort((a, b) => a - b)
  return sorted[Math.ceil(sorted.length * 0.95) - 1]
}
