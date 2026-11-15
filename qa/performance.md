# Web performance changes — 2026-11-15

Baseline: commit `fc0c12e`, production deploy `6af93d11c37be491f94f1e43`.

| Build measurement | Before | After |
|---|---:|---:|
| HTML entry + module-preload JavaScript, minified | 1,605 KiB | 494 KiB |
| Same JavaScript, gzip estimate | 428 KiB | 134 KiB |
| HDR download requested at scene startup | 38.67 MiB | Deferred |

These are payload measurements, **not** a measured page-load-time or FPS gain. The 3D code still downloads when needed; it no longer blocks the first UI render. Figures are rounded; run `npm run build` and `node eval/performance.check.mjs` to reproduce the new build measurements.

## Changes

- Lazy-load the 3D world separately from the welcome screen, controls and global chatbot.
- Preserve a Mars/Moon iframe while changing missions in the same world and mode. Navigation uses a same-origin parent message rather than replacing `src`, allowing the existing GLB promises, GPU context, textures and terrain to be reused.
- Keep the photographic sky at startup. On larger, capable devices, load the original HDR only after a 12-second delay and an idle callback. Skip that optional enhancement on narrow screens, devices reporting limited memory/cores, data-saving mode and slow connections. No NASA assets were replaced or modified.
- Limit render pixel ratio to 1.5 on larger devices and 1.25 on narrow or memory-constrained devices. This reduces Retina rendering cost; original geometry and texture files remain available.
- Stop drawing hidden tabs in the React canvas and native mission pages. Release the temporary WebGL detection context.
- Cache versioned JS/CSS in the browser for one year and original scientific assets for one week. HTML keeps its normal revalidation behavior; chat responses remain `no-store`.

## Verification

- Build and `eval/performance.check.mjs`: UI payload budget, device/network policies, parent-message origin/source validation, valid mission switching and duplicate-message handling.
- `eval/mars-route.check.mjs`: eight Mars entries and routes remain consistent.
- `eval/mars-models.check.mjs`: actual GLB/Draco parsing, Sojourner wheels, InSight deployment and Viking sampler remain valid.
- `eval/global-chat.check.mjs`: topic history, concurrent requests and retry behavior remain valid.

Actual visual sharpness, browser-to-iframe interaction and FPS on a physical phone have not been measured in this turn. A first visit to a mission still needs its original model download, including InSight's 21 MiB deployed model. Fast repeat visits within the retained frame benefit from its existing model cache.
