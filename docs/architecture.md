# Architecture

React owns controls, focus, shape selection, and the delayed return to WOMAN. On mobile, VisualViewport resize and scroll events reframe BRAIN above the prompt while the keyboard is open.

MatrixEngine manages one seeded glyph field for the active grid, the canvas backing store, animation lifecycle, bounded pointer input and diagnostics. The renderer samples shape-specific fields at glyph coordinates and then applies touch displacement. Each glyph keeps its digit and coordinates throughout shape transitions. Resize may rebuild the grid to match the viewport. Eco samples a deterministic subset of the same grid.

Morph blends the current shape weights into the requested shape. A change requested during a transition starts from its current mixture. Shapes use elapsed time for breathing, waves and pulses. Touch generates a depression at the contact point and a traveling wave that fades after release.

The browser builds and runs everything locally. Prompt text and diagnostics stay in memory. The repository builds to a static directory with relative asset URLs for deployment at a path prefix.
