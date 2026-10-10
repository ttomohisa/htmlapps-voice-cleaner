# Voice Cleaner — Application Specification

Version 1.0.0. Browser Kitty. Primary purpose: locally reduce background noise in spoken recordings with GTCRN WebAssembly, compare with original, then save WAV.

## Workflow and state
- Empty: choose/drop audio/video or record; output unavailable.
- Loading: decode via native browser audio decoder, show metadata/waveform. On failure explain unsupported format.
- Ready: choose playback position; try 10 seconds or process all.
- Loading engine: load embedded pinned GTCRN JS/WASM model without network.
- Processing: work in a module Worker using 256-sample 16 kHz frames with preserved streaming state; show progress and cancellation.
- Result: original / cleaned synchronized A/B playback, waveform, editable filename and WAV save.
- Error: provide message, clear stale result, allow retry.

## Audio and export
- File types depend on `decodeAudioData` availability.
- Processing converts input to 16 kHz mono.
- Frame process has 256-sample delay, compensated by flush/trim before preview/export.
- Output is 16-bit PCM WAV, 16 kHz, mono.
- Do not claim arbitrary user-facing model strength: one GTCRN processing mode.
- Preview is 10 seconds from current playback time; full processing is separate.
- Source changes revoke old Blob URLs, abort processing and invalidate stale results.
- Long inputs consume memory; no guarantee of unlimited file length.

## Privacy / compatibility
- No server API, analytics, telemetry, CDN or network model fetch.
- JS and WASM distributed inside single HTML, CSP blocks connect-src.
- Mic recording requires permission, and may be unavailable in file:// browser contexts.
- Japanese and English UI. Keyboard access, narrow mobile layout, native help dialog scrolling.
- Canonical favicon is assets/favicon.svg and used in app brand image and self-extract loader.

## Acceptance checks
- Empty state; valid/invalid file; supported audio/video decode; recording consent; 10-second preview; full processing; cancel; A/B aligned playback; WAV name and header; language switching.
- Desktop and smartphone, no horizontal overflow, help scroll to bottom, bottom nav doesn't cover content.
- Both HTML output variants and repository-root copy build with pinned dependency lock; no external runtime connections.
