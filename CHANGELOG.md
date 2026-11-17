# Changelog

## Unreleased

## 1.0.1 — Audio and mobile reliability

- Simplify Japanese and English intro copy, remove redundant feature cards, and hide the local-processing badge and informational footer on phone widths.
- Improve phone workflow: retain direct whole-file cleanup as the primary visible action, with an optional 10-second preview, comparison, and fixed-bar progress/cancel controls.
- Hide the mobile header on downward scrolling and bring it back on upward scrolling, while retaining keyboard focus accessibility and reduced-motion support.
- Fix clipping of loaded audio cards and native players on narrow screens, including long filenames.
- Keep audio and WAV results intact when replacing an invalid file or canceling replacement. Make the dialog close icon functional.
- Make the 10-second preview work after playback reaches the end; retain the last full WAV even after subsequent previews.
- Guard engine initialization, canceled Workers and late results against stale callbacks; fix progress after transferable buffers and rapid Before/After switching.
- Restore speech level conservatively (maximum approximately +2.6 dB) when noise reduction lowers it, with safeguards against clipping and boosting steady noise.
- Keep microphone recording exclusive and allow recording again after a file or recording has already been loaded; retain the same recording format.
- Preserve audio Blob URLs across back/forward cache restoration and localize loaded audio metadata and accessibility labels.
- Improve waveform navigation, keyboard accessibility, hidden sections, and Help build metadata, with real-voice and synthetic browser regression tests.
- Automatically create new version tags and GitHub Releases after a successful main build, with ZIP and checksum packaging validated on pull requests.

## 1.0.0 — Initial implementation

- GTCRN WebAssembly background noise suppression.
- File import, microphone recording, preview/full processing, cancellation and waveform comparison.
- A/B playback and 16 kHz mono WAV export.
- Japanese and English responsive interface and help dialog.
- Migrated to the current single-HTML template build contract, canonical SVG icon, SHA-256 dependency lock, and Cloudflare PR Preview.
