# Changelog

## Unreleased

## 1.0.1 — Bug fixes and streamlined interface

- Simplify the hero, remove duplicate feature cards and hide the local-processing badge on phone layouts.
- Prepare automated tags and GitHub Releases when a new app version is merged into main.


- Prevent canceled engine startup and late Worker callbacks from restarting or overwriting noise-reduction results; fix transferred-buffer progress timing.
- Decode replacement audio before confirming, keeping prior audio, WAV results, and filename when canceled or invalid.
- Preserve the last whole-file WAV through previews, and identify the result used by Save.
- Keep microphone recording exclusive, ensure HTML hidden sections stay hidden, cover waveform tails, and guard rapid Before/After playback switches.
- Expand Chromium browser regression coverage for these transitions.


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
