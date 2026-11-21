// SPDX-License-Identifier: MPL-2.0

import { useLayoutEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { createGlyphField } from './matrix/glyphField'
import { renderWoman } from './matrix/render'
import './style.css'

function App() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const portrait = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const surface = canvas.current!
    const anchor = portrait.current!
    const fields = new Map<string, ReturnType<typeof createGlyphField>>()

    function draw() {
      const bounds = surface.getBoundingClientRect()
      const frame = anchor.getBoundingClientRect()
      if (!bounds.width || !bounds.height || !frame.width) return

      const columns = Math.round(bounds.width / 9)
      const rows = Math.round(bounds.height / 11)
      const key = `${columns}x${rows}`
      if (fields.size >= 4 && !fields.has(key)) fields.clear()
      if (!fields.has(key)) fields.set(key, createGlyphField(columns, rows, 1973))

      renderWoman(surface, fields.get(key)!, bounds.width, bounds.height, {
        x: frame.left - bounds.left,
        y: frame.top - bounds.top,
        size: frame.width / 240,
      }, window.devicePixelRatio || 1)
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(surface)
    observer.observe(anchor)
    window.addEventListener('resize', draw)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', draw)
    }
  }, [])

  return (
    <main className="showcase">
      <canvas ref={canvas} className="matrix" aria-hidden="true" />
      <header className="masthead">
        <span>BINARY / ALIVE</span>
        <span>Interactive Design Lab</span>
      </header>
      <div className="portrait" ref={portrait} role="img" aria-label="Abstract female profile composed of binary digits" />
      <section className="intro" aria-labelledby="title">
        <h1 id="title">Binary Living Matrix</h1>
        <p>A living interface made entirely of zeros and ones.</p>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
