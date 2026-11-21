// SPDX-License-Identifier: MPL-2.0

import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { MatrixEngine } from './matrix/engine'
import { SHAPES, type Shape } from './matrix/motion'
import './style.css'

function App() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const portrait = useRef<HTMLDivElement>(null)
  const engine = useRef<MatrixEngine>(null)
  const previous = useRef<Shape>('woman')
  const returnTimer = useRef<number>(0)
  const [shape, setShape] = useState<Shape>('woman')
  const [still, setStill] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [submitted, setSubmitted] = useState(false)

  useLayoutEffect(() => {
    const surface = canvas.current!
    const anchor = portrait.current!
    const matrix = new MatrixEngine(surface)
    engine.current = matrix

    function resize() {
      const bounds = surface.getBoundingClientRect()
      const frame = anchor.getBoundingClientRect()
      if (!bounds.width || !bounds.height || !frame.width) return
      matrix.resize(bounds.width, bounds.height, {
        x: frame.left - bounds.left,
        y: frame.top - bounds.top,
        size: frame.width / 240,
      }, window.devicePixelRatio || 1)
    }

    function visibility() {
      if (document.hidden) matrix.pause()
      else matrix.resume()
    }

    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const motionPreference = () => setStill(media.matches)
    media.addEventListener('change', motionPreference)
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(surface)
    observer.observe(anchor)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      clearTimeout(returnTimer.current)
      matrix.pause()
      engine.current = null
      media.removeEventListener('change', motionPreference)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])

  useLayoutEffect(() => { engine.current?.setStill(still) }, [still])

  function choose(next: Shape) {
    clearTimeout(returnTimer.current)
    returnTimer.current = 0
    engine.current?.setShape(next)
    setShape(next)
  }

  function promptFocus() {
    if (!returnTimer.current) previous.current = shape
    choose('brain')
  }

  function pointer(event: PointerEvent<HTMLCanvasElement>, kind: 'press' | 'move') {
    const bounds = event.currentTarget.getBoundingClientRect()
    engine.current?.[kind](event.pointerId, event.clientX - bounds.left, event.clientY - bounds.top)
    if (kind === 'press') event.currentTarget.setPointerCapture(event.pointerId)
  }

  return (
    <main className="showcase">
      <canvas ref={canvas} className="matrix" aria-hidden="true"
        onPointerDown={event => pointer(event, 'press')}
        onPointerMove={event => pointer(event, 'move')}
        onPointerUp={event => engine.current?.release(event.pointerId)}
        onPointerCancel={event => engine.current?.release(event.pointerId)}
        onLostPointerCapture={event => engine.current?.release(event.pointerId)} />
      <header className="masthead">
        <span>BINARY / ALIVE</span>
        <span>Interactive Design Lab</span>
      </header>
      <div className="portrait" ref={portrait} role="img"
        aria-label={{ woman: 'Abstract woman drawn in binary', ocean: 'Layers of ocean waves drawn in binary', brain: 'A floating brain drawn in binary' }[shape]} />
      <section className="intro" aria-labelledby="title">
        <h1 id="title">Binary Living Matrix</h1>
        <p>A living interface made entirely of zeros and ones.</p>
      </section>
      <section className="controls" aria-label="Matrix controls">
        <div className="bento">
          {['Surface', 'Swells', 'Depth'].map(label =>
            <button key={label} type="button" onClick={() => choose('ocean')} aria-pressed={shape === 'ocean'}>{label}</button>,
          )}
        </div>
        <form className="prompt" onSubmit={event => { event.preventDefault(); setSubmitted(true); engine.current?.pulse() }}>
          <input aria-label="Visual prompt" placeholder="Type to wake the matrix"
            onFocus={promptFocus}
            onChange={() => { choose('brain'); engine.current?.pulse(); setSubmitted(false) }}
            onBlur={() => { returnTimer.current = window.setTimeout(() => choose(previous.current), 220) }} />
          <button type="submit" aria-label="Submit visual prompt">↗</button>
        </form>
        {submitted && <p className="response" role="status">This is an interactive visual demo — no message was sent.</p>}
        <details className="lab">
          <summary>Open Lab</summary>
          <div className="lab-controls">
            {SHAPES.map(mode => <button key={mode} aria-pressed={shape === mode} onClick={() => choose(mode)}>{mode}</button>)}
            <button aria-pressed={still} onClick={() => setStill(!still)}>Still</button>
            <button onClick={() => { choose('woman'); engine.current?.reset(); previous.current = 'woman'; setStill(matchMedia('(prefers-reduced-motion: reduce)').matches) }}>Reset</button>
          </div>
        </details>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
