# Binary Living Matrix

An interactive design lab made from binary digits. The WOMAN profile extends to the upper thighs. Select a bento card for OCEAN, focus the prompt for BRAIN, and press or drag on exposed digits for elastic touch. Open Lab to select a shape, pause motion, or reset.

## Run

With Node.js 22.12 or newer and npm:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

The React shell measures the artwork bounds. The TypeScript modules in `src/matrix/` generate glyphs, sample the portrait and draw to Canvas 2D. The canvas uses a single 8 CSS px monospace font and deterministic glyph positions for each grid size.

Physical Android motion testing, profiling and the full Lab diagnostics are pending. Run the motion and rendering regression tests with `npm test`.

Source code is available under the [Mozilla Public License 2.0](LICENSE).
