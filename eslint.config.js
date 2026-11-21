// SPDX-License-Identifier: MPL-2.0

import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'] },
  ...tseslint.configs.recommended,
]
