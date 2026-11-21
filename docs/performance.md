# Performance and device UAT

| Mode | Draw target | Glyphs | Canvas DPR cap |
| --- | --- | --- | --- |
| High | Up to 60 fps | Full grid | 2 |
| Eco | Up to 30 fps | Approximately 71% of full grid | 1.25 |
| Auto | Starts in High, adapts after sustained load | Active tier | Active tier |

The full grid is capped at roughly 9,000 glyphs. Auto evaluates one-second windows and uses two slow windows to drop a tier and five comfortable windows to recover. A new touch requests a draw on the next animation frame even when Eco would otherwise skip that frame. Rendering pauses in background tabs. Reduced motion defaults to Still, which redraws for state changes.

Lab reports cadence, p95 time between draws, average CPU time spent issuing canvas draws, glyph count, device pixel ratio and touch event to draw completion. This last figure is a software proxy. Physical input-to-display latency requires a device trace or high-speed recording.

[Browser baseline JSON](https://batman-begun.github.io/binary-living-matrix/demo/benchmark.json)

The recording script captures Auto, Eco and High in Chromium with a 430 × 880 mobile viewport. Playwright verifies desktop Chromium, desktop Firefox and touch-emulated Chromium. Physical Android UAT approved the Gate B interaction polish. Release-build measurements, native keyboard behavior across devices and thermal throttling still require hardware access.

For a device run, open Lab and sample each quality mode after five seconds. Record FPS, p95 frame time and touch-to-draw during a morph and after two minutes of repeated contact. Check native keyboard open and dismissal, touch-and-scroll, rotation and reduced motion. Initial targets are at least 30 FPS on a midrange Android, 55 FPS on a 60 Hz desktop and at most 100 ms for touch response.
