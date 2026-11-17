# Audio regression fixture

`jfk-public-domain.wav.base64` is an offline, base64-encoded WAV recording of **a real human speaker**, used only by the browser smoke test. It is not packaged into the user-facing single HTML.

- Source: [OpenASR fixtures/jfk.wav](https://github.com/QuintinShaw/openasr/blob/main/fixtures/jfk.wav), originally from ggml-org's whisper.cpp / llama.cpp sample files.
- Subject: excerpt of John F. Kennedy's 1961 inaugural address.
- Status: **public domain**, as documented by OpenASR's [NOTICE](https://github.com/QuintinShaw/openasr/blob/main/NOTICE).
- Original format: 16 kHz, mono, 16-bit PCM WAV, approximately 11 seconds.
- Original SHA-256: `59dfb9a4acb36fe2a2affc14bacbee2920ff435cb13cc314a08c13f66ba7860e`.
- Regression input: generated offline from the original recording by overlaying deterministic fan-like hum and hiss. The source recording is not replaced or modified on disk.

The quality smoke test checks that the WebAssembly speech cleanup handles an actual recorded voice, yields a valid WAV, avoids clipping, and reports simple level statistics. These checks are not a substitute for listening to recordings from real phones or assessing speech intelligibility.
