// SPDX-License-Identifier: MPL-2.0

import assert from 'node:assert/strict'
import test from 'node:test'
import { AutoQuality, percentile95 } from '../src/matrix/quality.ts'

test('auto quality waits for sustained load and sustained recovery', () => {
  const auto = new AutoQuality()
  assert.equal(auto.sample(15, 26), 'high')
  assert.equal(auto.sample(3, 16), 'high')
  assert.equal(auto.sample(15, 26), 'high')
  assert.equal(auto.sample(15, 26), 'eco')
  for (let i = 0; i < 4; i++) assert.equal(auto.sample(3, 16), 'eco')
  assert.equal(auto.sample(3, 16), 'high')
  assert.equal(percentile95([80, ...Array(19).fill(16)]), 16)
})
