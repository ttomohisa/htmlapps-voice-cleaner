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
    const sourceSeek = page.locator('#sourceWaveSeek');
    assert.ok(await sourceSeek.isEnabled(), 'Source waveform seek bar must be enabled');
    await sourceSeek.evaluate(el => {
      el.value=String(Number(el.max)/2);
      el.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.waitForFunction(()=>Math.abs(document.querySelector('#sourceAudio').currentTime - 1)<0.12,null,{timeout:10000});
    assert.match(await page.locator('#sourceWaveDuration').textContent(),/0:01 \/ 0:02/);
    await sourceSeek.focus();
    await page.keyboard.press('Home');
    await page.waitForFunction(()=>document.querySelector('#sourceAudio').currentTime<0.10,null,{timeout:10000});
    await page.keyboard.press('End');
    await page.waitForFunction(()=>document.querySelector('#sourceAudio').currentTime>1.8,null,{timeout:10000});
    await page.keyboard.press('Home');
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
    const beforeSeek=page.locator('#beforeWaveSeek');
    const afterSeek=page.locator('#afterWaveSeek');
    assert.ok(await beforeSeek.isEnabled() && await afterSeek.isEnabled(), 'Comparison waveforms must be seekable');
    await afterSeek.evaluate(el=>{
      el.value=String(Number(el.max)/2);
      el.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.waitForFunction(()=>Math.abs(document.querySelector('#resultAudio').currentTime - 1)<0.12,null,{timeout:10000});
    assert.ok(Math.abs(Number(await beforeSeek.inputValue())-Number(await afterSeek.inputValue()))<0.12,'Both waveform positions should agree');
    await page.locator('#cleanedToggle').click();
    await page.waitForFunction(()=>document.querySelector('#cleanedToggle').classList.contains('is-active') && Math.abs(document.querySelector('#resultAudio').currentTime - 1)<0.15,null,{timeout:10000});
    await page.setViewportSize({width:390,height:844});
    await beforeSeek.scrollIntoViewIfNeeded();
    await beforeSeek.click(); // Native touch-sized slider interaction at the center.
    await page.waitForFunction(()=>Math.abs(document.querySelector('#resultAudio').currentTime - 1)<0.2,null,{timeout:10000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Unexpected horizontal scroll on mobile');
    const waveform = await page.locator('#afterWaveCanvas').evaluate(el => !!el.width && !!el.height);
    assert.ok(waveform, 'Cleaned waveform missing');
    await page.locator('#outputFilename').fill('reviewed-session.wav');
    const downloadStarted = page.waitForEvent('download', { timeout: 10000 });
    await page.locator('#mobileSaveButton').click(); // Mobile fixed save action remains usable while the seek bar is on screen.
    const download = await downloadStarted;
    assert.equal(download.suggestedFilename(), 'reviewed-session.wav', 'Edited filename must be used');
    const wavData = fs.readFileSync(await download.path());
    assert.equal(wavData.toString('ascii', 0, 4), 'RIFF', 'WAV RIFF header missing');
    assert.equal(wavData.toString('ascii', 8, 12), 'WAVE', 'WAV format header missing');
    assert.equal(wavData.readUInt32LE(24), 16000, 'Incorrect WAV sample rate');
    assert.ok(wavData.length > 32000, 'Exported WAV contains too little audio');
    assert.equal(wavData.readUInt16LE(22), 1, 'WAV must be mono');
    assert.equal(wavData.readUInt16LE(34), 16, 'WAV must be 16-bit PCM');
    await page.locator('#previewButton').click();
    await page.waitForFunction(() => !document.querySelector('#previewButton').disabled, null, { timeout: 45000 });
    assert.equal(await page.locator('#processError').textContent(), '', 'Preview failed');
    assert.ok(await page.locator('#mobileSaveButton').isEnabled(), 'Previous full WAV must survive a preview');
    assert.match(await page.locator('#saveScope').textContent(), /Previous result|前回の結果/);
    const previousDownload = page.waitForEvent('download', { timeout: 10000 });
    await page.locator('#mobileSaveButton').click();
    const previous = await previousDownload;
    assert.equal(previous.suggestedFilename(), 'reviewed-session.wav');
    assert.deepEqual(fs.readFileSync(await previous.path()), wavData, 'Preview must not replace the saved full WAV');
    assert.equal(logs.length, 0, 'Unexpected console error or runtime network request: ' + logs.join('\n'));
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
