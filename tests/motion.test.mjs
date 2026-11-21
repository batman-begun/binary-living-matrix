// SPDX-License-Identifier: MPL-2.0

import assert from 'node:assert/strict'
import test from 'node:test'
import { Morph, touchStrength } from '../src/matrix/motion.ts'

test('retargeting during a morph preserves the current blend', () => {
  const morph = new Morph()
  morph.set('ocean', 100)
  const interrupted = morph.at(900)
  assert.ok(interrupted[0] > 0 && interrupted[1] > 0)
  morph.set('brain', 900)
  assert.deepEqual(morph.at(900), interrupted)
  assert.deepEqual(morph.at(3000), [0, 0, 1])
})

test('release starts continuously, rebounds and settles', () => {
  const press = { x: 20, y: 50, started: 100 }
  const released = { ...press, released: 240 }
  assert.equal(touchStrength(press, 240), touchStrength(released, 240))
  assert.ok(touchStrength(released, 460) < 0)
  assert.equal(touchStrength(released, 1500), 0)
})
