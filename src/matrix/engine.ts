// SPDX-License-Identifier: MPL-2.0

import { createGlyphField } from './glyphField.ts'
import { Morph, RELEASE_MS, type Shape, type Impression } from './motion.ts'
import { bindCanvas, DEFAULT_MOTION, drawScene, makeScene } from './render.ts'
import type { BrainFrame } from './viewport.ts'
import { AutoQuality, percentile95, QUALITY, type Diagnostics, type QualityMode, type QualityTier } from './quality.ts'
import type { Portrait } from './woman.ts'

export class MatrixEngine {
  private morph = new Morph()
  private active = new Map<number, Impression>()
  private released: Impression[] = []
  private context: CanvasRenderingContext2D | null = null
  private scene: ReturnType<typeof makeScene> = []
  private glyphs: ReturnType<typeof createGlyphField> = []
  private grid = ''
  private width = 0
  private height = 0
  private frame = 0
  private still = false
  private pulseAt = -Infinity

  private motion = DEFAULT_MOTION
  private availableScene: typeof this.scene = []
  private ecoScene: typeof this.scene = []
  private requestedQuality: QualityMode = 'auto'
  private auto = new AutoQuality()
  private tier: QualityTier = 'high'
  private ratio = 1
  private dpr = 1
  private lastFrame = 0
  private lastPaint = 0
  private nextPaint = 0
  private lastSample = 0
  private refresh: number[] = []
  private cadence: number[] = []
  private drawings: number[] = []
  private touchStarted: number | null = null
  private touchMs: number | null = null

  constructor(private canvas: HTMLCanvasElement, private report: (value: Diagnostics) => void) {}

  resize(width: number, height: number, portrait: Portrait, ratio: number, brainFrame?: BrainFrame) {
    const spacing = Math.max(1, Math.sqrt(width * height / (9000 * 99)))
    const columns = Math.max(1, Math.floor(width / (9 * spacing)))
    const rows = Math.max(1, Math.floor(height / (11 * spacing)))
    const grid = `${columns}x${rows}`
    if (grid !== this.grid) {
      this.glyphs = createGlyphField(columns, rows, 1973)
      this.grid = grid
    }
    this.width = width
    this.height = height
    this.ratio = ratio
    this.availableScene = makeScene(this.glyphs, width, height, portrait, brainFrame)
    this.ecoScene = this.availableScene.filter(glyph =>
      (Math.imul(glyph.id ^ 0x92e3, 0x9e3779b1) >>> 0) / 0x100000000 < QUALITY.eco.density,
    )
    this.applyTier(this.tier)
    if (!this.context || this.still) this.publish()
    this.resume()
  }

  setMotion(motion: typeof DEFAULT_MOTION) {
    this.motion = motion
    this.resume()
  }

  setQuality(mode: QualityMode) {
    if (this.requestedQuality === mode) return
    this.requestedQuality = mode
    this.auto = new AutoQuality()
    this.applyTier(mode === 'eco' ? 'eco' : 'high')
    this.resetSamples()
    this.publish()
    this.resume()
  }

  private applyTier(tier: QualityTier) {
    if (this.tier !== tier) this.nextPaint = 0
    this.tier = tier
    this.scene = tier === 'eco' ? this.ecoScene : this.availableScene
    if (!this.width || !this.height) return
    this.dpr = Math.min(this.ratio, QUALITY[tier].dpr)
    if (!this.context || this.canvas.width !== Math.ceil(this.width * this.dpr) ||
        this.canvas.height !== Math.ceil(this.height * this.dpr)) {
      this.context = bindCanvas(this.canvas, this.width, this.height, this.dpr)
    }
  }

  setShape(shape: Shape) {
    this.morph.set(shape, performance.now())
    if (this.still) this.morph.settle()
    this.resume()
  }

  setStill(still: boolean) {
    this.still = still
    this.resetSamples()
    if (still) {
      this.morph.settle()
      this.active.clear()
      this.released = []
      this.touchStarted = null
    }
    this.resume()
  }

  pulse() { this.pulseAt = performance.now() }

  press(id: number, x: number, y: number) {
    if (this.still || this.active.size >= 4) return
    const started = performance.now()
    this.touchStarted ??= started
    this.active.set(id, { x, y, started })
  }

  move(id: number, x: number, y: number) {
    const touch = this.active.get(id)
    if (touch) Object.assign(touch, { x, y })
  }

  release(id: number) {
    const touch = this.active.get(id)
    if (!touch) return
    this.active.delete(id)
    this.released = [...this.released.slice(-7), { ...touch, released: performance.now() }]
  }

  reset() {
    this.active.clear()
    this.released = []
    this.pulseAt = -Infinity
    this.touchStarted = null
    this.touchMs = null
    this.setShape('woman')
  }

  pause() {
    cancelAnimationFrame(this.frame)
    this.frame = 0
    this.touchStarted = null
    this.resetSamples()
  }

  resume() {
    if (document.hidden || this.frame || !this.context) return
    this.frame = requestAnimationFrame(this.tick)
  }

  private resetSamples() {
    this.lastFrame = 0
    this.lastPaint = 0
    this.nextPaint = 0
    this.lastSample = 0
    this.refresh = []
    this.cadence = []
    this.drawings = []
  }

  private tick = (now: number) => {
    this.frame = 0
    if (this.lastFrame) this.refresh.push(now - this.lastFrame)
    this.lastFrame = now
    this.lastSample ||= now
    const interval = now - this.lastPaint
    const frameBudget = 1000 / QUALITY[this.tier].fps
    if (this.still || this.touchStarted !== null || now >= this.nextPaint - 0.8) {
      this.nextPaint = Math.max(now - frameBudget / 2, this.nextPaint) + frameBudget
      if (this.lastPaint) this.cadence.push(interval)
      this.lastPaint = now
      const started = performance.now()
      this.paint(now)
      const finished = performance.now()
      this.drawings.push(finished - started)
      if (this.touchStarted !== null) {
        this.touchMs = Math.max(0, finished - this.touchStarted)
        this.touchStarted = null
      }
    }
    if (this.still || now - this.lastSample >= 1000) {
      this.publish()
      if (!this.still && this.requestedQuality === 'auto') {
        const tier = this.auto.sample(this.mean(this.drawings), this.mean(this.refresh))
        if (tier !== this.tier) this.applyTier(tier)
      }
      this.refresh = []
      this.cadence = []
      this.drawings = []
      this.lastSample = now
    }
    if (!this.still) this.resume()
  }

  private mean(values: readonly number[]) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
  }

  private publish() {
    const interval = this.mean(this.cadence)
    this.report({
      tier: this.tier,
      fps: interval ? 1000 / interval : 0,
      frameP95: percentile95(this.cadence),
      drawMs: this.mean(this.drawings),
      touchMs: this.touchMs,
      glyphs: this.scene.length,
      dpr: this.dpr,
      renderer: this.context ? 'Canvas 2D' : 'Unavailable',
    })
  }

  private paint(now: number) {
    if (!this.context) return
    this.released = this.released.filter(touch => now - (touch.released ?? now) < RELEASE_MS)
    drawScene(this.context, this.scene, this.width, this.height, this.morph.at(now), now,
      [...this.active.values(), ...this.released], this.pulseAt, this.still, this.motion)
  }
}
