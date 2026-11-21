// SPDX-License-Identifier: MPL-2.0

import { useState } from 'react'
import { SHAPES, type Shape } from './matrix/motion'
import type { Diagnostics, QualityMode } from './matrix/quality'
import type { DEFAULT_MOTION } from './matrix/render'

export type MotionMode = 'still' | 'ambient' | 'alive'
export type MotionSettings = typeof DEFAULT_MOTION

type LabProps = {
  shape: Shape
  motion: MotionMode
  quality: QualityMode
  settings: MotionSettings
  diagnostics: Diagnostics | null
  onShape: (shape: Shape) => void
  onMotion: (motion: MotionMode) => void
  onQuality: (quality: QualityMode) => void
  onSettings: (settings: MotionSettings) => void
  onReset: () => void
}

export function Lab(props: LabProps) {
  const [copyStatus, setCopyStatus] = useState('')
  const [manualCopy, setManualCopy] = useState('')
  const data = props.diagnostics

  async function copyConfiguration() {
    const value = JSON.stringify({
      shape: props.shape, motion: props.motion, quality: props.quality, ...props.settings,
    }, null, 2)
    try {
      await navigator.clipboard.writeText(value)
      setManualCopy('')
      setCopyStatus('Configuration copied.')
    } catch {
      setManualCopy(value)
      setCopyStatus('Select and copy the configuration below.')
    }
  }

  return (
    <details className="lab">
      <summary>Open Lab</summary>
      <div className="lab-controls">
        <div className="lab-shapes" role="group" aria-label="Shape">
          {SHAPES.map(shape => <button key={shape} aria-pressed={props.shape === shape} onClick={() => props.onShape(shape)}>{shape}</button>)}
        </div>
        <label>Motion
          <select value={props.motion} onChange={event => props.onMotion(event.target.value as MotionMode)}>
            <option value="still">Still</option>
            <option value="ambient">Ambient</option>
            <option value="alive">Alive</option>
          </select>
        </label>
        <label>Quality
          <select value={props.quality} onChange={event => props.onQuality(event.target.value as QualityMode)}>
            <option value="auto">Auto</option>
            <option value="eco">Eco</option>
            <option value="high">High</option>
          </select>
        </label>
        {([['breath', 'Breath depth'], ['wave', 'Wave energy'], ['touch', 'Touch elasticity']] as const).map(([key, label]) => (
          <label key={key}>{label}
            <input type="range" min="0" max="1.5" step="0.1" value={props.settings[key]}
              onChange={event => props.onSettings({ ...props.settings, [key]: event.target.valueAsNumber })} />
          </label>
        ))}
        {data && <dl className="diagnostics" aria-label="Rendering diagnostics">
          <div><dt>Renderer</dt><dd>{data.renderer}</dd></div>
          <div><dt>Active tier</dt><dd>{data.tier}</dd></div>
          <div><dt>FPS</dt><dd>{data.fps ? data.fps.toFixed(1) : '—'}</dd></div>
          <div><dt>Frame p95</dt><dd>{data.frameP95 ? `${data.frameP95.toFixed(1)} ms` : '—'}</dd></div>
          <div><dt>Draw average</dt><dd>{data.drawMs ? `${data.drawMs.toFixed(1)} ms` : '—'}</dd></div>
          <div><dt>Touch to draw</dt><dd>{data.touchMs === null ? '—' : `${data.touchMs.toFixed(1)} ms`}</dd></div>
          <div><dt>Glyphs</dt><dd>{data.glyphs}</dd></div>
          <div><dt>Canvas DPR</dt><dd>{data.dpr.toFixed(2)}</dd></div>
        </dl>}
        <div className="lab-actions">
          <button onClick={copyConfiguration}>Copy configuration</button>
          <button onClick={() => { setCopyStatus(''); setManualCopy(''); props.onReset() }}>Reset</button>
        </div>
        {copyStatus && <div className="lab-feedback" role="status">{copyStatus}</div>}
        {manualCopy && <textarea className="lab-feedback" readOnly aria-label="Configuration JSON" value={manualCopy} />}
      </div>
    </details>
  )
}
