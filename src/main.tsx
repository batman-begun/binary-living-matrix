// SPDX-License-Identifier: MPL-2.0

import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { MatrixEngine } from './matrix/engine'
import { type Shape } from './matrix/motion'
import { frameAbovePrompt } from './matrix/viewport'
import { Lab, type MotionMode } from './Lab'
import { DEFAULT_MOTION } from './matrix/render'
import type { Diagnostics, QualityMode } from './matrix/quality'
import './style.css'

const MOTION_PREFERENCE = '(prefers-reduced-motion: reduce)'
const systemMotion = (): MotionMode => matchMedia(MOTION_PREFERENCE).matches ? 'still' : 'ambient'

function App() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const portrait = useRef<HTMLDivElement>(null)
  const engine = useRef<MatrixEngine>(null)
  const showcase = useRef<HTMLElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const viewportAtFocus = useRef(0)
  const keyboardWasOpen = useRef(false)
  const autoOcean = useRef(false)
  const returnTimer = useRef<number>(0)
  const [shape, setShape] = useState<Shape>('woman')
  const [motion, setMotion] = useState(systemMotion)
  const [quality, setQuality] = useState<QualityMode>('auto')
  const [settings, setSettings] = useState(DEFAULT_MOTION)
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useLayoutEffect(() => {
    const surface = canvas.current!
    const anchor = portrait.current!
    const matrix = new MatrixEngine(surface, setDiagnostics)
    engine.current = matrix

    const viewport = window.visualViewport
    let pendingResize = 0

    function resize() {
      pendingResize = 0
      const bounds = surface.getBoundingClientRect()
      const frame = anchor.getBoundingClientRect()
      if (!bounds.width || !bounds.height || !frame.width) return
      const typing = document.activeElement === input.current
      const shrink = viewportAtFocus.current - (viewport?.height ?? window.innerHeight)
      const wasOpen = keyboardWasOpen.current
      const keyboard = typing && shrink > (wasOpen ? 45 : 96)
      keyboardWasOpen.current = keyboard
      if (typing && wasOpen && !keyboard) input.current?.blur()
      showcase.current?.toggleAttribute('data-keyboard', keyboard)
      const brain = keyboard && viewport && input.current
        ? frameAbovePrompt(bounds, {
            left: viewport.offsetLeft, top: viewport.offsetTop, width: viewport.width, height: viewport.height,
          }, input.current.getBoundingClientRect().top)
        : undefined
      matrix.resize(bounds.width, bounds.height, {
        x: frame.left - bounds.left,
        y: frame.top - bounds.top,
        size: frame.width / 240,
      }, window.devicePixelRatio || 1, brain)
    }

    function requestResize() {
      if (!pendingResize) pendingResize = requestAnimationFrame(resize)
    }

    function visibility() {
      if (document.hidden) matrix.pause()
      else matrix.resume()
    }

    const media = matchMedia(MOTION_PREFERENCE)
    const motionPreference = () => setMotion(media.matches ? 'still' : 'ambient')
    media.addEventListener('change', motionPreference)
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(surface)
    observer.observe(anchor)
    window.addEventListener('resize', requestResize)
    window.addEventListener('scroll', requestResize, { passive: true })
    viewport?.addEventListener('resize', requestResize)
    viewport?.addEventListener('scroll', requestResize)
    input.current?.addEventListener('blur', requestResize)
    const prompt = input.current
    document.addEventListener('visibilitychange', visibility)
    return () => {
      clearTimeout(returnTimer.current)
      matrix.pause()
      cancelAnimationFrame(pendingResize)
      engine.current = null
      media.removeEventListener('change', motionPreference)
      observer.disconnect()
      window.removeEventListener('resize', requestResize)
      window.removeEventListener('scroll', requestResize)
      viewport?.removeEventListener('resize', requestResize)
      viewport?.removeEventListener('scroll', requestResize)
      prompt?.removeEventListener('blur', requestResize)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])

  useLayoutEffect(() => { engine.current?.setStill(motion === 'still') }, [motion])
  useLayoutEffect(() => { engine.current?.setQuality(quality) }, [quality])
  useLayoutEffect(() => {
    const gain = motion === 'alive' ? 1.25 : 1
    engine.current?.setMotion({ breath: settings.breath * gain, wave: settings.wave * gain, touch: settings.touch * gain })
  }, [motion, settings])

  function choose(next: Shape, temporary = false) {
    clearTimeout(returnTimer.current)
    returnTimer.current = 0
    autoOcean.current = next === 'ocean' && temporary
    if (autoOcean.current) scheduleReturn(9000)
    engine.current?.setShape(next)
    setShape(next)
  }

  function scheduleReturn(delay: number) {
    clearTimeout(returnTimer.current)
    returnTimer.current = window.setTimeout(() => choose('woman'), delay)
  }

  function promptFocus() {
    viewportAtFocus.current = window.visualViewport?.height ?? window.innerHeight
    keyboardWasOpen.current = false
    choose('brain')
  }

  function pointer(event: PointerEvent<HTMLCanvasElement>, kind: 'press' | 'move') {
    const bounds = event.currentTarget.getBoundingClientRect()
    engine.current?.[kind](event.pointerId, event.clientX - bounds.left, event.clientY - bounds.top)
    if (kind === 'press') {
      event.currentTarget.setPointerCapture(event.pointerId)
      if (autoOcean.current) scheduleReturn(9000)
    }
  }

  return (
    <main className="showcase" ref={showcase}>
      <canvas ref={canvas} className="matrix" aria-hidden="true"
        onPointerDown={event => pointer(event, 'press')}
        onPointerMove={event => pointer(event, 'move')}
        onPointerUp={event => engine.current?.release(event.pointerId)}
        onPointerCancel={event => engine.current?.release(event.pointerId)}
        onLostPointerCapture={event => engine.current?.release(event.pointerId)} />
      <header className="masthead">
        <span>BINARY / ALIVE</span>
        <a href="https://github.com/batman-begun/binary-living-matrix">Source on GitHub</a>
      </header>
      <div className="portrait" ref={portrait} role="img"
        aria-label={{ woman: 'Abstract woman drawn in binary', ocean: 'Layers of ocean waves drawn in binary', brain: 'A floating brain drawn in binary' }[shape]} />
      {diagnostics?.renderer === 'Unavailable' && <p className="renderer-fallback" role="status">Canvas is unavailable. This browser can still use the prompt and Lab controls.</p>}
      <section className="intro" aria-labelledby="title">
        <h1 id="title">Binary Living Matrix</h1>
        <p>A living interface made entirely of zeros and ones.</p>
      </section>
      <section className="controls" aria-label="Matrix controls">
        <div className="bento">
          {['Surface', 'Swells', 'Depth'].map(label =>
            <button key={label} type="button" onClick={() => choose('ocean', true)} aria-pressed={shape === 'ocean'}>{label}</button>,
          )}
        </div>
        <form className="prompt" onSubmit={event => { event.preventDefault(); setSubmitted(true); engine.current?.pulse() }}>
          <input ref={input} aria-label="Visual prompt" placeholder="Type to wake the matrix"
            onFocus={promptFocus}
            onChange={() => { choose('brain'); engine.current?.pulse(); setSubmitted(false) }}
            onBlur={() => scheduleReturn(550)} />
          <button type="submit" aria-label="Submit visual prompt">↗</button>
        </form>
        {submitted && <p className="response" role="status">This is an interactive visual demo — no message was sent.</p>}
        <Lab shape={shape} motion={motion} diagnostics={diagnostics} quality={quality} settings={settings}
          onShape={choose} onMotion={setMotion} onQuality={setQuality} onSettings={setSettings}
          onReset={() => {
            choose('woman')
            engine.current?.reset()
            setSettings(DEFAULT_MOTION)
            setQuality('auto')
            setMotion(systemMotion())
            if (input.current) input.current.value = ''
            setSubmitted(false)
          }} />
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
