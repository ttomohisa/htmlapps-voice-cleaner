# Voice Cleaner — Application Specification

## Phone footer and final Help metadata

- Hide only the informational footer at the existing 600px phone breakpoint; preserve functional tabs/actions and header versions.
- Move existing lower build disclosure intact to the final scrollable Help content. Keep metadata available on phone and desktop; preserve keyboard activation and existing modal scroll behavior.
- Existing equivalent local-processing badges remain `Fully local processing`; privacy text, runtime, versions and dependencies stay unchanged.

Version 1.0.1. Browser Kitty. Primary purpose: locally reduce background noise in spoken recordings with GTCRN WebAssembly, compare with original, then save WAV.

## Workflow and state
- Empty: choose/drop audio/video or record; output unavailable.
- Loading: decode via native browser audio decoder, show metadata/waveform. On failure explain unsupported format.
- Ready: choose playback position; try 10 seconds or process all.
- Loading engine: load embedded pinned GTCRN JS/WASM model without network.
- Processing: work in a module Worker using 256-sample 16 kHz frames with preserved streaming state; show progress and cancellation.
- Result: original / cleaned synchronized A/B playback, interactive waveform seek bar with linked original/cleaned playheads, editable filename and WAV save.
- Error: provide a localized error, preserve the current source and last successful results, and allow retry.

## Phone workflow
## Phone header behavior

- At viewport widths of 600px or less, the header is a normal element at the top of the document, not fixed or sticky. It scrolls out with the page and does not reappear until the user returns to the top.
- On desktop (over 600px), the header remains sticky as before. The fixed mobile bottom actions are unaffected.


- The primary phone footer action runs a 10-second preview until there is a result, then offers whole-file processing; full processing is also directly available in the main panel without a prerequisite.
- A fixed phone progress/cancel surface replaces the three footer actions during runtime initialization or processing. It must stay operable without scrolling and clear on cancel, error, or completion.
- Preserve the source/result and last full WAV when canceling or retrying. Labels and progress must work in both Japanese and English.

## Audio and export

- A conservative loudness compensation may run after GTCRN. Compare original/cleaned levels in louder, dynamically varying regions; skip silence and steady noise. Cap at 1.35x (approximately +2.6 dB) and peak at 0.98 to prevent clipping. Apply identically to preview/full playback and WAV export; never modify the original.
- This is a heuristic rather than speech recognition. Residual noise may be amplified, so quality checks must compare real recordings before accepting future changes.
- File types depend on `decodeAudioData` availability.
- Processing converts input to 16 kHz mono.
- Frame process has 256-sample delay, compensated by flush/trim before preview/export.
- Output is 16-bit PCM WAV, 16 kHz, mono.
- Do not claim arbitrary user-facing model strength: one GTCRN processing mode.
- Preview is 10 seconds from the source waveform/playback seek position; full processing is separate.
- Each waveform shows a live progress cursor; click, tap, or drag to seek. Native range controls support arrow keys, Home and End.
- The original and cleaned result waveforms share a playback clock; changing either waveform seeks both, including after Before/After switching.
- Source replacement validates and decodes the candidate before confirmation. Failed decoding or canceling leaves the current audio, WAV result, and filename intact. Confirming replacement revokes old Blob URLs and resets results.
- Long inputs consume memory; no guarantee of unlimited file length.
- A completed full-length WAV remains available after later 10-second previews and failed/canceled runs for the same audio. The save UI identifies the full-length target, never exports a preview in its place.
- Canceling runtime preparation or processing invalidates its run identity; delayed Worker callbacks must never write into a later run. Progress must measure the saved sample count, not a transferred/detached input array.
- Microphone permission requests and active recordings block file selection and noise-reduction runs. The record-stop button remains usable while recording.
- After loading audio, keep a separate visible record-again control. It shares microphone state and recording behavior with the initial record button; stopping it offers replacement confirmation without discarding the previous source on cancel.
- The close icon in replacement confirmation must behave as Cancel. When playback is at its end, preview the final up-to-10 seconds rather than silently doing nothing.
- In back/forward cache transitions, preserve source and result Blob URLs so restored tabs can still play audio. On permanent navigation clean up Blob URLs.
- Localize audio channel names and accessible labels in Japanese and English.
- Every `hidden` section must stay invisible despite author `display` CSS rules; waveform downsampling must include the last sample.

## Privacy / compatibility
- No server API, analytics, telemetry, CDN or network model fetch.
- JS and WASM distributed inside single HTML, CSP blocks connect-src.
- Mic recording requires permission, and may be unavailable in file:// browser contexts.
- Japanese and English UI. Keyboard access, narrow mobile layout, native help dialog scrolling.
- Canonical favicon is assets/favicon.svg and used in app brand image and self-extract loader.

## Acceptance checks
- Empty state; valid/invalid file; supported audio/video decode; microphone permission and recording; 10-second preview; full processing; cancel during first engine startup and during Worker execution; stale callbacks; replacement accept/cancel/decode failure; A/B aligned playback; preserved full WAV after a preview; WAV name and header; language switching.
- Desktop and smartphone, no horizontal overflow, help scroll to bottom, bottom nav doesn't cover content.
- Waveform seeking with mouse/touch/keyboard, playhead tracking during playback, original/cleaned seek synchronization, and cursor reset when loading a replacement file.
- Both HTML output variants and repository-root copy build with pinned dependency lock; no external runtime connections.
