# Binary Living Matrix

An interactive graphics showcase. A shared field of binary glyphs breathes as WOMAN, flows as OCEAN and pulses as BRAIN.

[Open the live showcase](https://batman-begun.github.io/binary-living-matrix/) · [Watch the demo](https://batman-begun.github.io/binary-living-matrix/demo/matrix-demo.mp4) · [Tiếng Việt](README.vi.md)

## Try it

- Wait for WOMAN to breathe. Press or drag in the uncovered matrix to make it ripple.
- Activate any bento card to morph into OCEAN. The showcase returns to WOMAN after nine seconds without a new interaction.
- Focus the prompt for BRAIN and type to trigger neural pulses. Leave the prompt to return to WOMAN. The prompt runs locally.
- Open Lab to hold a shape, select Auto/Eco/High, set motion intensity and inspect rendering diagnostics.

## Run from source

Node.js 22.12 or later and npm are required. The production site is static.

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
npx playwright install chromium firefox
npm run test:browser
```

Run `npm run record` after the build with Chromium installed and FFmpeg on PATH to capture the demo. GitHub Actions runs checks, records the verified build, publishes GitHub Pages and creates the versioned release.

[Architecture](docs/architecture.md) · [Visual rules](docs/visual-rules.md) · [Performance and device UAT](docs/performance.md) · [MPL 2.0 license](LICENSE)
