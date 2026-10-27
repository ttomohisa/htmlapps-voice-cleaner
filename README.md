# Voice Cleaner

[![GitHub Pages](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Single HTML](https://img.shields.io/badge/distribution-single%20HTML-0ea5e9)](https://ttomohisa.github.io/htmlapps-voice-cleaner/)

[日本語版 README](README.ja.md)

Voice Cleaner **reduces background noise in recordings of spoken audio, entirely in your browser**. Open an audio or video recording, or record from your microphone, compare the cleaned audio with the original, and save a WAV file. Your recordings do not need to be uploaded to a server.

## Demo

### [Open Voice Cleaner on GitHub Pages](https://ttomohisa.github.io/htmlapps-voice-cleaner/)

Once published on GitHub Pages, Voice Cleaner needs no installation or registration. Files, microphone recordings, and processing results stay in your browser and are not uploaded to a server.

**Availability:** The link may not be accessible until GitHub Pages is enabled and a deployment from `main` completes. Check [GitHub Pages Actions](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/deploy-pages.yml) for the deployment status.

[![Voice Cleaner with an audio file loaded](assets/screenshot-en.png)](https://ttomohisa.github.io/htmlapps-voice-cleaner/)

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

### Use the web app

When the [GitHub Pages version of Voice Cleaner](https://ttomohisa.github.io/htmlapps-voice-cleaner/) is available, open it and select an audio or video file. No account or installation is needed. Until it is published, you can use the standalone HTML file described below.

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

Your audio, recordings and results stay only in the current tab and are not saved automatically. Save a full WAV result before closing the tab. Starting another run marks retained results as **Previous result**; stopping or a failed run preserves them. A later preview keeps the last full WAV available, and the save scope identifies it separately from the preview on screen. A download notice reports **Download started**, not a completed device write.

Replacing audio decodes the new file before asking for confirmation. Cancel or decode failure keeps your current audio, results and filename. Confirming replaces the tab's audio and results irreversibly; original files and downloaded WAV files remain intact.

The UI uses URL `?lang=ja/en`, a shared same-origin language preference, the legacy tool preference, then supported browser languages (English fallback). Explicit switching remembers only the shared language preference when storage permits; audio and processing are preserved. Language sharing is not guaranteed across different origins or standalone `file://` files.

### Waveform controls

| Control | Action |
| --- | --- |
| Click / tap the waveform | Seek to that position |
| Drag along the waveform | Move the playback position |
| `←` / `→` while focused | Adjust the seek position |
| `Home` / `End` while focused | Seek to the beginning / end |
| Seek either Before / After waveform | Synchronize the two result positions |

On mobile, **Audio** moves to the source, **Process whole audio** runs processing, and **Save WAV** starts a download. These are navigation plus actions, not page tabs. Both save controls use the same editable filename and full result.

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

The planned URL is [https://ttomohisa.github.io/htmlapps-voice-cleaner/](https://ttomohisa.github.io/htmlapps-voice-cleaner/). Changes in a pull request do not appear on GitHub Pages until they are merged into `main`. The URL may remain unavailable until Pages is enabled and a deployment succeeds.

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
- The hosted GitHub Pages version requires an initial request to download the HTML. For disconnected use, open a generated standalone HTML file locally.

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

### Shared UI development checks

BrowserKittyUI 1.0.0 is vendored in `components/` and hash-checked by `scripts/embed-ui-conventions.ps1`; generated HTML embeds it locally. `scripts/check-repository.ps1` now also requires Node.js to run `node --test tests/*.test.cjs` before building. The standalone HTML builder itself still does not require Node.js. See `APP_SPEC.md` for remaining human audio, keyboard and mobile acceptance checks.
