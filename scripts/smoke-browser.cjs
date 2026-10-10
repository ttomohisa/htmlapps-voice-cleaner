/* End-to-end proof of GTCRN audio processing in a real Chromium-family browser.
 * Install playwright-core as a CI-only tool; no runtime package is downloaded.
 */
'use strict';
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(path.resolve('.browser-smoke/node_modules/playwright-core'));
const root = path.resolve('dist');
const candidates = [
  process.env.CHROME_PATH,
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
  process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'),
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Microsoft/Edge/Application/msedge.exe'),
  '/usr/bin/chromium'
].filter(Boolean);
function pcmWav(seconds = 2, rate = 16000) {
  const count = Math.ceil(seconds * rate);
  const wav = Buffer.alloc(44 + count * 2);
  wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22); wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34); wav.write('data', 36);
  wav.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) {
    const t = i / rate;
    const voice = Math.sin(2 * Math.PI * 225 * t) * 0.24;
    const noise = Math.sin(2 * Math.PI * 1100 * t) * 0.05;
    wav.writeInt16LE(Math.round((voice + noise) * 32767), 44 + i * 2);
  }
  return wav;
}
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    fs.createReadStream(path.join(root, 'index.html')).pipe(res);
  } else {
    res.writeHead(404); res.end();
  }
});
(async () => {
  let browser;
  const logs = [];
  try {
    assert.ok(fs.existsSync(path.join(root, 'index.html')), 'Standalone HTML missing');
    const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
    assert.ok(executablePath, 'Chrome/Edge executable was not found on this runner');
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const origin = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 980, height: 800 }, acceptDownloads: true });
    page.on('pageerror', (error) => logs.push('JS: ' + String(error)));
    page.on('console', (message) => {
      if (message.type() === 'error') logs.push('console: ' + message.text());
    });
    page.on('request', (request) => {
      const url = request.url();
      if (url.startsWith('http') && !url.startsWith(origin)) logs.push('unexpected external request: ' + url);
    });
    await page.goto(origin + '/index.html', { waitUntil: 'load', timeout: 20000 });
    await page.locator('#fileInput').setInputFiles({
      name: 'test-speech-with-noise.wav',
      mimeType: 'audio/wav',
      buffer: pcmWav()
    });
    await page.waitForFunction(() => {
      const b = document.querySelector('#processButton');
      const e = document.querySelector('#sourceError');
      return (b && !b.disabled) || (e && e.textContent.trim().length > 0);
    }, null, { timeout: 20000 });
    const decodeError = await page.locator('#sourceError').textContent();
    assert.equal(decodeError, '', 'Input decode failed: ' + decodeError);
    await page.locator('#processButton').click();
    await page.waitForFunction(() => {
      const result = document.querySelector('#resultSection');
      const error = document.querySelector('#processError');
      // The error container is hidden by CSS when empty; its 'hidden' property is always false.
      // Wait for actual content or a completed result instead of returning immediately.
      return (result && !result.hidden) || (error && error.textContent.trim().length > 0);
    }, null, { timeout: 45000 });
    const processError = await page.locator('#processError').textContent();
    assert.equal(processError, '', 'GTCRN failed: ' + processError);
    assert.ok(await page.locator('#resultSection').isVisible(), 'Cleaned result is not visible');
    const waveform = await page.locator('#afterWaveCanvas').evaluate(el => !!el.width && !!el.height);
    assert.ok(waveform, 'Cleaned waveform missing');
    const downloadStarted = page.waitForEvent('download', { timeout: 10000 });
    await page.locator('#saveButton').click();
    const download = await downloadStarted;
    const wavData = fs.readFileSync(await download.path());
    assert.equal(wavData.toString('ascii', 0, 4), 'RIFF', 'WAV RIFF header missing');
    assert.equal(wavData.toString('ascii', 8, 12), 'WAVE', 'WAV format header missing');
    assert.equal(wavData.readUInt32LE(24), 16000, 'Incorrect WAV sample rate');
    assert.ok(wavData.length > 32000, 'Exported WAV contains too little audio');
    assert.ok(logs.every(line => !line.startsWith('unexpected external request:')), 'Runtime requested external network');
    console.log('[PASS] 2-second speech/noise WAV -> GTCRN WASM -> playback result -> WAV download; no external network.');
  } catch (error) {
    console.error('[FAIL] Browser audio smoke test:', error.stack || error);
    for (const line of logs) console.error('  ' + line);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})();
