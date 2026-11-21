// SPDX-License-Identifier: MPL-2.0

import { createGlyphField } from './glyphField.ts'
import { Morph, RELEASE_MS, type Shape, type Impression } from './motion.ts'
import { bindCanvas, drawScene, makeScene } from './render.ts'
import type { BrainFrame } from './viewport.ts'
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

  constructor(private canvas: HTMLCanvasElement) {}

  resize(width: number, height: number, portrait: Portrait, ratio: number, brainFrame?: BrainFrame) {
    const columns = Math.max(1, Math.round(width / 9))
    const rows = Math.max(1, Math.round(height / 11))
    const grid = `${columns}x${rows}`
    if (grid !== this.grid) {
      this.glyphs = createGlyphField(columns, rows, 1973)
      this.grid = grid
    }
    const backingRatio = Math.min(ratio, 2)
    if (!this.context || width !== this.width || height !== this.height ||
        this.canvas.width !== Math.ceil(width * backingRatio) || this.canvas.height !== Math.ceil(height * backingRatio)) {
      this.context = bindCanvas(this.canvas, width, height, ratio)
    }
    this.width = width
    this.height = height
    this.scene = makeScene(this.glyphs, width, height, portrait, brainFrame)
    this.paint(performance.now())
  }

  setShape(shape: Shape) {
    this.morph.set(shape, performance.now())
    if (this.still) this.morph.settle()
    this.resume()
  }

  setStill(still: boolean) {
    this.still = still
    if (still) {
      this.morph.settle()
      this.active.clear()
      this.released = []
    }
    this.resume()
  }

  pulse() { this.pulseAt = performance.now() }

  press(id: number, x: number, y: number) {
    if (this.still || this.active.size >= 4) return
    this.active.set(id, { x, y, started: performance.now() })
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
    this.setShape('woman')
  }

  pause() {
    cancelAnimationFrame(this.frame)
    this.frame = 0
  }

  resume() {
    if (document.hidden || this.frame) return
    this.frame = requestAnimationFrame(this.tick)
  }

  private tick = (now: number) => {
    this.frame = 0
    this.paint(now)
    if (!this.still) this.resume()
  }

  private paint(now: number) {
    if (!this.context) return
    this.released = this.released.filter(touch => now - touch.released! < RELEASE_MS)
    drawScene(this.context, this.scene, this.width, this.height, this.morph.at(now), now,
      [...this.active.values(), ...this.released], this.pulseAt, this.still)
  }
}
