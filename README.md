# Binary Living Matrix

A static visual prototype for an interactive design lab made from binary digits. This checkpoint renders the WOMAN profile as a field of 0s and 1s on ivory.

## Run

With Node.js 22.12 or newer and npm:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

The React shell measures the artwork bounds. The TypeScript modules in `src/matrix/` generate glyphs, sample the portrait and draw to Canvas 2D. The first checkpoint uses a single 8 CSS px monospace font and deterministic glyph positions for each grid size.

Physical Android visual acceptance is pending. Breathing, morphing, touch and Lab controls are scheduled for subsequent checkpoints.

Source code is available under the [Mozilla Public License 2.0](LICENSE).
