# Changelog

## Unreleased

- Embed hash-pinned BrowserKittyUI 1.0.0 with tab-session retention, shared language preferences and native busy/disabled action states.
- Clarify mobile Audio navigation, Process whole audio and Save WAV actions, current/previous output scope, editable filename snapshots and truthful download-started notices.
- Preserve the last full WAV through previews, cancellation and processing errors; validate replacement audio before irreversible tab-state confirmation.
- Fix canceled runtime startup and stale worker callbacks with application run ownership; preserve progress duration across PCM transfer and clean failed worker submissions.
- Add application and shared UI regressions to repository checks. GTCRN 0.0.3, embedded runtime bytes, frame processing and WAV format remain unchanged.


- Hide the phone informational footer and place existing build metadata at the end of Help, preserving functional controls and keyboard access.
 (PR #1)

- Added draggable, tappable, keyboard-accessible seek bars over source and comparison waveforms.
- Waveform playheads track playback and both Before/After waveforms stay synchronized.


## 1.0.0 — Initial implementation

- GTCRN WebAssembly background noise suppression.
- File import, microphone recording, preview/full processing, cancellation and waveform comparison.
- A/B playback and 16 kHz mono WAV export.
- Japanese and English responsive interface and help dialog.
- Migrated to the current single-HTML template build contract, canonical SVG icon, SHA-256 dependency lock, and Cloudflare PR Preview.
