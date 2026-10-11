# Voice Cleaner

[![Standalone HTML build](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/build-standalone.yml/badge.svg)](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/build-standalone.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-%2316624F)](LICENSE)
[![Single HTML](https://img.shields.io/badge/distribution-single%20HTML-%2316624F)](#single-html-and-offline-use)

[日本語版 README](README.ja.md)

Voice Cleaner **reduces background noise in recordings of spoken audio, entirely in your browser**. Open an audio or video recording, or record from your microphone, compare the cleaned audio with the original, and save a WAV file. Your recordings do not need to be uploaded to a server.

## Demo

### [Open Voice Cleaner (Cloudflare PR Preview)](https://r1412273626-pr-1-bk-previews.ttomohisa.workers.dev)

No installation or registration is required. Cloudflare serves the initial HTML; the audio and video you load, microphone recordings, and processing results remain on your device.

**Note:** This is a temporary preview for [PR #1](https://github.com/ttomohisa/htmlapps-voice-cleaner/pull/1). The preview is deleted when the PR is closed. See [Publishing with GitHub Pages](#publish-with-github-pages) for the repository's persistent deployment workflow.

![Voice Cleaner with an audio file loaded](assets/screenshot-en.png)

[Mobile screenshot](assets/screenshot-mobile.png)

## Features

- **Reduce background noise** — GTCRN runs in WebAssembly to improve the intelligibility of speech mixed with steady noises such as fans, air conditioning, or hiss. Results vary with the recording.
- **Open audio or video** — Choose or drag and drop WAV, MP3, M4A, AAC, OGG, WebM, MP4 and other browser-decodable files. Actual support varies by browser.
- **Record from a microphone** — Grant permission and make a new recording in the browser. This does not process live calls in real time.
- **Try just 10 seconds** — Choose a start point on the waveform and listen to a short cleaned sample before processing the whole file.
- **Compare Before / After** — Switch original and cleaned audio at the same playback position. Interactive waveform seek bars support clicking, tapping, dragging, and synchronized seeking across both result waveforms.
- **Export WAV** — After processing the whole recording, choose a filename and save a 16 kHz mono 16-bit PCM WAV file.
- **Work on-device** — The model and runtime are embedded in a single HTML file, with Japanese and English UI for desktop and mobile.

## Quick start

### Use the web preview

Open the [Cloudflare PR Preview](https://r1412273626-pr-1-bk-previews.ttomohisa.workers.dev), then choose an audio or video file. No account or installation is needed.

### Use a standalone HTML file

Open a previously built `voice-cleaner.html` or `dist/index.html` in a browser. The HTML contains the JavaScript, WebAssembly, and model assets required for processing, so the file can work offline.

Successful builds in [GitHub Actions](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/build-standalone.yml) include the distribution HTML in their artifacts (GitHub sign-in may be required for artifact downloads). Open the generated HTML, not the editable `src/index.template.html` source.

### Build your own copy (Windows)

1. Clone or download this repository.
2. Run `build-standalone.bat`.
3. The first build downloads the exact dependency version declared in `dependencies.json`.
4. Copy the generated `voice-cleaner.html` or `dist/index.html` wherever you want.
5. Open the standalone HTML later without an internet connection.

The normal HTML build does not require Python or Node.js. It uses Windows PowerShell and `tar.exe`. Microphone access may be restricted for `file://` pages by the browser.

## How to use

1. **Choose a recording** — Drag an audio or video file into the app, choose a file, or use the microphone recorder if available.
2. **Choose a position** — Click, tap, or drag along the source waveform to seek. You can also use the audio player's controls.
3. **Preview 10 seconds** — Select “Try 10 seconds from here” to compare a short portion.
4. **Process the entire recording** — If the result sounds useful, run “Clean the whole file.” Progress is displayed, and the operation can be cancelled.
5. **Compare and save** — Switch between Original and Cleaned, seeking either result waveform to move both playheads. Edit the output filename, then save the WAV.

The 10-second preview is for listening. **WAV export becomes available after processing the whole recording.** GTCRN uses a fixed processing mode; there is no noise-reduction strength slider.

### Waveform controls

| Control | Action |
| --- | --- |
| Click / tap the waveform | Seek to that position |
| Drag along the waveform | Move the playback position |
| `←` / `→` while focused | Adjust the seek position |
| `Home` / `End` while focused | Seek to the beginning / end |
| Seek either Before / After waveform | Synchronize the two result positions |

On mobile, the bottom navigation provides Audio, Clean, and Save actions. Save stays disabled until there is a complete processed result.

## Single HTML and offline use

At build time, the exact pinned `@sapphi-red/gtcrn-wasm` JavaScript and WASM assets (including the GTCRN model) are embedded in the HTML. GTCRN inference runs in a Web Worker.

| Generated file | Purpose |
| --- | --- |
| `voice-cleaner.html` | Readable standalone HTML copy at repository root |
| `dist/index.html` | Distribution-ready standalone HTML (identical to the root copy) |
| `dist/index.self-extract.html` | Compact single-HTML variant that expands its gzip payload when opened |
| `dist/dependency-manifest.json` | Embedded-asset metadata |
| `dist/build-size-report.json` | Build-size report |

The self-extracting version requires browser support for `DecompressionStream`. Browser permissions, including microphone restrictions, still apply to standalone files.

## Publish with GitHub Pages

This repository includes a workflow that builds, verifies, and deploys the app on pushes to `main` when GitHub Pages is enabled.

1. Open **Settings → Pages → Build and deployment → Source**, and choose **GitHub Actions**.
2. Push to `main` or manually trigger [Deploy standalone app to GitHub Pages](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/deploy-pages.yml).
3. Find the published URL in the GitHub Actions deployment output.

Pull requests use a separate Cloudflare Preview. Its temporary URL is posted as a PR comment and deleted when the PR closes. The GitHub Pages URL should not be considered active until deployment is configured and succeeds.

## Development and build layout

```text
.
├─ assets/favicon.svg              # Canonical header icon and favicon
├─ src/index.template.html         # Editable application source
├─ app.config.json                 # Application metadata and build settings
├─ dependencies.json               # Pinned dependency and embedded assets
├─ dependencies.lock.json          # Locked npm tarball SHA-256
├─ build-standalone.bat            # Windows build entry point
├─ build-standalone.ps1            # Standalone HTML builder
├─ scripts/check-repository.ps1    # Repository and artifact validation
├─ scripts/smoke-browser.cjs       # Browser GTCRN inference / WAV export smoke test
├─ .github/workflows/             # Build, deploy and PR preview
└─ dist/                           # Generated outputs (after building)
```

Run the PowerShell syntax preflight before the full repository check:

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
pwsh -NoProfile -File .\scripts\check-repository.ps1
```

Use `scripts/update-dependency.ps1` for reviewed dependency updates. Versions are pinned, and `dependencies.lock.json` is checked against the downloaded npm tarball SHA-256 during builds. Automated update discovery does not automatically install or commit new dependency versions.

CI validates both standalone HTML formats, matching brand/favicon images, CSP, dependency locks, unresolved placeholders, and actual GTCRN inference plus WAV export in a browser.

## Privacy and runtime network protection

- **Recordings are not uploaded.** Selected files, microphone data, and cleaned audio stay in the browser.
- **No external AI API is called.** The model and runtime are embedded in the distributed HTML.
- **CSP includes `connect-src 'none'`.** The app blocks ordinary runtime connections to outside servers.
- The hosted preview still requires a request to download its initial HTML. For disconnected use, open a generated standalone HTML file locally.

## Limitations

- Designed for **background-noise reduction in speech**, not guaranteed removal of other speakers, music, heavy reverberation, or sudden sounds.
- Output is always **16 kHz mono 16-bit PCM WAV**. Original stereo channels, sample rate, and encoding are not preserved.
- Video input does **not** mean video export. The app saves only the processed audio as WAV.
- Support for MP3, M4A, MP4, and other formats depends on the browser's audio decoder.
- Files are limited to **250 MB**, and recordings to **60 minutes**. Even within these limits, large inputs may exceed available device memory or take substantial time.
- Microphone recording requires permission and may not work on `file://` pages; use HTTPS or localhost if necessary.
- Real-time microphone effects, speaker separation, and MP3/M4A export are not supported.

## Dependencies

| Library / model | Version | License | Purpose |
| --- | --- | --- | --- |
| [@sapphi-red/gtcrn-wasm](https://github.com/sapphi-red/gtcrn-wasm) | 0.0.3 | MIT | Run GTCRN in WebAssembly |
| [GTCRN](https://github.com/Xiaobin-Rong/gtcrn) | Embedded in the WASM package | MIT | Speech enhancement and noise reduction |
| [PFFFT](https://github.com/marton78/pffft) | Included in the WASM implementation | Separate redistribution terms | Fast Fourier transforms for audio |

The app does not need to download ONNX Runtime during execution. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for license information.

## Contributing

Bug reports and feature suggestions are welcome in [GitHub Issues](https://github.com/ttomohisa/htmlapps-voice-cleaner/issues). See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

Copyright © 2026 ttomohisa

This application is licensed under the [MIT License](LICENSE). Embedded third-party components retain their own license conditions.
