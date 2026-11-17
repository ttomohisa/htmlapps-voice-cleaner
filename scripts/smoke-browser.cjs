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
    const downloadStarted = page.waitForEvent('download', { timeout: 10000 });
    await page.locator('#mobileSaveButton').click(); // Mobile fixed save action remains usable while the seek bar is on screen.
    const download = await downloadStarted;
    const wavData = fs.readFileSync(await download.path());
    assert.equal(wavData.toString('ascii', 0, 4), 'RIFF', 'WAV RIFF header missing');
    assert.equal(wavData.toString('ascii', 8, 12), 'WAVE', 'WAV format header missing');
    assert.equal(wavData.readUInt32LE(24), 16000, 'Incorrect WAV sample rate');
    assert.ok(wavData.length > 32000, 'Exported WAV contains too little audio');

    // A preview made after a full result must not silently replace its saved WAV.
    await page.locator('#outputFilename').fill('review-copy');
    await sourceSeek.evaluate(el=>{
      el.value='1.1';
      el.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.waitForFunction(()=>document.querySelector('#sourceAudio').currentTime>1.0);
    await page.locator('#previewButton').click();
    await page.waitForFunction(()=>{
      const text=document.querySelector('#saveScope')?.textContent||'';
      return text.includes('previous')||text.includes('前回');
    },null,{timeout:45000});
    assert.ok(await page.locator('#mobileSaveButton').isEnabled(),'Preview must retain the last full WAV');
    const saveAfterPreview=page.waitForEvent('download',{timeout:10000});
    await page.locator('#mobileSaveButton').click();
    const retained=await saveAfterPreview;
    assert.equal(retained.suggestedFilename(),'review-copy.wav','Edited filename must be respected');
    assert.equal(fs.readFileSync(await retained.path()).length,wavData.length,'A preview must not truncate the full WAV');

    // Invalid replacement and canceled valid replacement leave the existing result intact.
    await page.locator('#fileInput').setInputFiles({
      name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('not audio')
    });
    await page.waitForFunction(()=>document.querySelector('#sourceError').textContent.trim().length>0);
    assert.equal(await page.locator('#sourceName').textContent(),'test-speech-with-noise.wav');
    assert.ok(await page.locator('#mobileSaveButton').isEnabled(),'Decode failure must retain full result');
    assert.equal(await page.locator('#outputFilename').inputValue(),'review-copy');
    const alternate={name:'replacement.wav',mimeType:'audio/wav',buffer:pcmWav(3)};
    await page.locator('#fileInput').setInputFiles(alternate);
    await page.locator('#appConfirmDialog').waitFor({state:'visible'});
    await page.locator('#appConfirmCancel').click();
    assert.equal(await page.locator('#sourceName').textContent(),'test-speech-with-noise.wav');
    assert.ok(await page.locator('#mobileSaveButton').isEnabled(),'Cancel replacement must retain full result');
    assert.equal(await page.locator('#outputFilename').inputValue(),'review-copy');
    await page.locator('#fileInput').setInputFiles(alternate);
    await page.locator('#appConfirmDialog').waitFor({state:'visible'});
    await page.locator('#appConfirmOk').click();
    await page.waitForFunction(()=>document.querySelector('#sourceName').textContent==='replacement.wav'
      && document.querySelector('#resultSection').hidden);
    assert.ok(await page.locator('#mobileSaveButton').isDisabled(),'Accepted replacement must clear the old WAV');

    // Simulate a Worker delivering a queued completion after termination. Only the new run owns the result.
    await page.evaluate(()=>{
      window.__fakeWorkers=[];
      window.Worker=class {
        constructor(){this.id=window.__fakeWorkers.length+1;window.__fakeWorkers.push(this);}
        postMessage(msg){
          const count=this.id===1?16000:msg.pcmBuffer.byteLength/4;
          const output=new Float32Array(count);
          setTimeout(()=>this.onmessage?.({data:{type:'done',buffer:output.buffer}}),this.id===1?180:30);
        }
        terminate(){this.terminated=true;}
      };
    });
    assert.match(await page.locator('#mobileProcessLabel').textContent(),/Try 10 sec|10秒試す/);
    assert.ok(await page.locator('#processButton').isVisible(),'Direct full-file action remains available on phones');
    await page.locator('#mobileProcessButton').click();
    await page.waitForFunction(()=>window.__fakeWorkers.length===1);
    assert.ok(await page.locator('#mobileProcessing').isVisible(),'Processing progress is visible in fixed phone bar');
    assert.ok(await page.locator('#mobileCancelButton').isVisible(),'Phone cancellation is reachable without scrolling');
    assert.ok(await page.locator('#mobileProcessButton').isHidden(),'Processing replaces the phone action bar');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Phone progress does not overflow horizontally');
    await page.locator('#mobileCancelButton').click();
    assert.ok(await page.locator('#mobileProcessing').isHidden(),'Phone cancel returns to normal actions');
    assert.ok(await page.locator('#resultSection').isHidden(),'Cancel should keep the new source without results');
    assert.match(await page.locator('#mobileProcessLabel').textContent(),/Try 10 sec|10秒試す/);
    await page.locator('#mobileProcessButton').click();
    await page.waitForFunction(()=>!document.querySelector('#resultSection').hidden && document.querySelector('#resultSubtitle').textContent.match(/10.second preview|10秒プレビュー/) && document.querySelector('#mobileProcessing').hidden,null,{timeout:10000});
    assert.ok(await page.locator('#mobileSaveButton').isDisabled(),'Preview does not permit saving a partial WAV');
    assert.match(await page.locator('#mobileProcessLabel').textContent(),/Clean all|全体を処理/);
    await page.locator('#mobileProcessButton').click();
    await page.waitForFunction(()=>document.querySelector('#resultContext').textContent.includes('0:03') && !document.querySelector('#mobileSaveButton').disabled);
    await page.waitForTimeout(220);
    assert.ok((await page.locator('#resultContext').textContent()).includes('0:03'),'Late canceled Worker overwrote the current run');
    assert.ok(await page.locator('#mobileSaveButton').isEnabled());
    assert.deepEqual(logs.filter(line=>line.startsWith('JS:')),[],'Unexpected page errors');
    assert.ok(logs.every(line => !line.startsWith('unexpected external request:')), 'Runtime requested external network');
    console.log('[PASS] GTCRN/WAV, preview retention, replacement protection, stale Worker and offline checks.');

    // Delay first-time engine setup, then cancel before the Worker could begin.
    const slowPage=await browser.newPage({viewport:{width:980,height:800}});
    try{
      await slowPage.addInitScript(()=>{
        window.__startedWorkers=0;
        window.Worker=class{
          constructor(){window.__startedWorkers++;}
          postMessage(){} terminate(){}
        };
      });
      await slowPage.goto(origin+'/index.html',{waitUntil:'load'});
      await slowPage.locator('#fileInput').setInputFiles({
        name:'engine-cancel.wav',mimeType:'audio/wav',buffer:pcmWav(1)
      });
      await slowPage.waitForFunction(()=>!document.querySelector('#processButton').disabled);
      // Dispatch both actions within one browser task, before the first runtime await can settle.
      await slowPage.evaluate(()=>{
        const run=document.querySelector('#processButton');
        const cancel=document.querySelector('#cancelButton');
        run.click();
        if(cancel.disabled)throw new Error('Engine startup did not enable cancellation');
        cancel.click();
        if(run.disabled)throw new Error('Cancellation did not restore the action');
        if(!document.querySelector('#resultSection').hidden)throw new Error('Canceled run exposed a result');
        run.click();
      });
      await slowPage.waitForFunction(()=>window.__startedWorkers>=1,null,{timeout:45000});
      // A late canceled startup must not start its own Worker in addition to the new run.
      await slowPage.waitForTimeout(500);
      assert.equal(await slowPage.evaluate(()=>window.__startedWorkers),1,
        'Canceled engine startup began a stale Worker alongside the current run');
      assert.ok(await slowPage.locator('#resultSection').isHidden());
      console.log('[PASS] Cancel during first-time engine preparation.');
    }finally{await slowPage.close();}

  } catch (error) {
    console.error('[FAIL] Browser audio smoke test:', error.stack || error);
    for (const line of logs) console.error('  ' + line);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})();
