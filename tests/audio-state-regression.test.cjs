'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('src/index.template.html','utf8');

test('hidden remains authoritative on grid and flex layout elements',()=>{
  assert.match(html,/\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/);
  for(const id of ['dropZone','sourceCard','resultSection','sourceLoading']){
    assert.ok(html.includes('id="'+id+'"'),id);
  }
});

test('worker completion and progress are guarded by run identity and ownership',()=>{
  assert.match(html,/runId:\s*0/);
  assert.match(html,/runId=\+\+state\.runId/);
  assert.match(html,/state\.runId\+\+/);
  assert.match(html,/!isCurrent\(\)\|\|state\.worker!==worker/);
  assert.match(html,/const totalSamples=input\.length/);
  assert.match(html,/Math\.min\(totalSamples,d\.value\*totalSamples\)/);
});

test('replacement stages validation and confirmation ahead of old-source release',()=>{
  const start=html.indexOf('async function loadSource(file){');
  const end=html.indexOf('async function ensureRuntime(){',start);
  const segment=html.slice(start,end);
  const a=segment.indexOf('await decodeTo16k(file,gen)');
  const b=segment.indexOf('await confirmAudioReplacement()');
  const c=segment.indexOf('revokeObjectUrls()');
  assert.ok(a>=0&&b>a&&c>b,'Decode, confirm, then release old audio');
  assert.match(segment,/state\.fullResult=null/);
  assert.match(segment,/preparedUrl=URL\.createObjectURL\(pcmToWav\(decoded\.pcm\)\)/);
});

test('a preview cannot overwrite the most recently completed full WAV',()=>{
  assert.match(html,/if\(kind==='full'\)state\.fullResult=output/);
  assert.match(html,/pcmToWav\(state\.fullResult\)/);
  assert.match(html,/state\.resultKind==='preview'\?t\('savePreviousFull'\)/);
  assert.match(html,/#saveScope/);
});

test('microphone capture keeps the stop action available but locks conflicting inputs',()=>{
  assert.match(html,/const locked=busy\|\|recording\|\|requestingMic/);
  assert.match(html,/if\(recording\)\{[\s\S]*?recorder\?\.state==='recording'/);
  assert.match(html,/if\(!file\|\|recording\|\|requestingMic/);
  assert.match(html,/\$\('#fileFallbackInput'\)\.disabled=locked/);
});

test('localized replacement and preservation notices are present in both languages',()=>{
  for(const name of ['replaceConfirmTitle','replaceConfirmMessage','previewNotSaveable','savePreviousFull','loadingSource','recordingEmpty']){
    assert.equal((html.match(new RegExp(name+':','g'))||[]).length,2,name);
  }
});