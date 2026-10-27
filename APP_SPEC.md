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
- Error: provide a persistent localized message and retry guidance; retain the previous result and full WAV for the same source.

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

## Shared UI conventions v1

- Embed the exact BrowserKittyUI 1.0.0 JS/CSS from `components/`, verified against `ui-conventions.lock.json` at build time. No runtime request is added.
- The notice above the work area states that audio, recordings and results exist only in this tab. No project save, autosave or browser audio persistence is provided.
- Audio in the phone bar navigates to the source; Process whole audio and Save WAV execute actions. They have no selected-page state. Desktop and phone actions share native disabled/busy preconditions. Help and language remain available during processing.
- Both save controls export only the last completed full result, snapshotting its identity and edited sanitized filename at invocation. A preview alone is not exportable. After a successful preview, the full result remains saveable and is explicitly labeled Previous result; save scope explains the preview versus full-result distinction.
- Starting a new run marks existing results as previous. Cancel, setup failure and worker failure preserve result bytes, playback and edited filename. A monotonic application run epoch plus source generation and worker identity guards every runtime await, progress, completion, error and cleanup. Stop invalidates ownership immediately; worker termination is synchronous, so no artificial stopping phase is shown while obsolete runtime preparation settles.
- Browser downloads announce Download started with the captured filename. They never claim device-write completion.
- Source replacement stages decoding first, then asks to replace existing audio/results in AppConfirm. Cancel, Escape, backdrop dismissal and decode failure preserve source, result and filename. Confirmation starts on Cancel, describes irreversible tab-only loss and keeps original files/downloaded WAV files. Successful replacement revokes old URLs and invalidates work; no Undo is promised.
- Language startup priority is valid URL lang, shared same-origin preference, legacy `voice-cleaner:language`, first supported browser language, then English. Only explicit language choice writes the shared key and replaces an existing URL lang without adding history. Storage failure still changes the screen and reports session-only language. Translation updates document metadata, progress, errors, confirmation copy and accessible labels without changing audio, filename, seek positions or run ownership.
- Keep @sapphi-red/gtcrn-wasm 0.0.3, embedded JS/WASM bytes, the 256-sample frame/delay compensation, and 16 kHz mono 16-bit PCM WAV unchanged.

### Additional acceptance checks

Run `node --test tests/*.test.cjs` (also included in the repository check). Reproduce cancel during delayed runtime startup, queued old worker progress/done/error, runtime rejection after restart, worker submission failure, current-run inference failure, preview after a full result, edited WAV name/header/sample count, replacement cancel/failure/acceptance, and language selection with denied storage. VM tests exercise real application functions with browser boundary doubles; they do not prove native audio playback, real Worker/WASM inference or browser focus/layout.

Human browser checks remain required for both generated variants: WAV listening/aligned A/B, desktop/phone widths and safe areas, keyboard-only disabled states, confirmation focus/Escape/backdrop restoration, microphone permission/record-stop, decode and size/duration limits, help scrolling and no runtime network requests. Browser access to localhost/file is denied in this rollout session; do not work around that restriction or label these checks as executed.
