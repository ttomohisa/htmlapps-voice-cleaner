# Voice Cleaner — Application Specification

## Phone footer and final Help metadata

- Hide only the informational footer at the existing 600px phone breakpoint; preserve functional tabs/actions and header versions.
- Move existing lower build disclosure intact to the final scrollable Help content. Keep metadata available on phone and desktop; preserve keyboard activation and existing modal scroll behavior.
- Existing equivalent local-processing badges remain `Fully local processing`; privacy text, runtime, versions and dependencies stay unchanged.

Version 1.0.0. Browser Kitty. Primary purpose: locally reduce background noise in spoken recordings with GTCRN WebAssembly, compare with original, then save WAV.

## Workflow and state
- Empty: choose/drop audio/video or record; output unavailable.
- Loading: decode via native browser audio decoder, show metadata/waveform. On failure explain unsupported format.
- Ready: choose playback position; try 10 seconds or process all.
- Loading engine: load embedded pinned GTCRN JS/WASM model without network.
- Processing: work in a module Worker using 256-sample 16 kHz frames with preserved streaming state; show progress and cancellation.
- Result: original / cleaned synchronized A/B playback, interactive waveform seek bar with linked original/cleaned playheads, editable filename and WAV save.
- Error: provide message, clear stale result, allow retry.

## Audio and export
- File types depend on `decodeAudioData` availability.
- Processing converts input to 16 kHz mono.
- Frame process has 256-sample delay, compensated by flush/trim before preview/export.
- Output is 16-bit PCM WAV, 16 kHz, mono.
- Do not claim arbitrary user-facing model strength: one GTCRN processing mode.
- Preview is 10 seconds from the source waveform/playback seek position; full processing is separate.
- Each waveform shows a live progress cursor; click, tap, or drag to seek. Native range controls support arrow keys, Home and End.
- The original and cleaned result waveforms share a playback clock; changing either waveform seeks both, including after Before/After switching.
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
- Waveform seeking with mouse/touch/keyboard, playhead tracking during playback, original/cleaned seek synchronization, and cursor reset when loading a replacement file.
- Both HTML output variants and repository-root copy build with pinned dependency lock; no external runtime connections.
