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

test('speech level restoration is voice-aware, bounded and safe for silence',()=>{
  const start=html.indexOf('function restoreSpeechLevel(');
  const end=html.indexOf('function getResultOriginal(',start);
  assert.ok(start>0&&end>start,'Loudness correction must be present');
  const restoreSpeechLevel=new Function(html.slice(start,end)+';return restoreSpeechLevel;')();
  const make=(speechAmplitude=0.25,noiseAmplitude=0.018,cleanFactor=.6,seconds=3)=>{
    const length=16000*seconds,original=new Float32Array(length),cleaned=new Float32Array(length);
    for(let i=0;i<length;i++){
      const t=i/16000,syllable=(Math.floor(t*4)%4)!==3;
      const speech=syllable ? speechAmplitude*Math.sin(2*Math.PI*210*t)*(0.6+0.4*Math.sin(Math.PI*2*t)**2) : 0;
      const fan=noiseAmplitude*Math.sin(2*Math.PI*1050*t);
      original[i]=speech+fan;cleaned[i]=speech*cleanFactor;
    }
    return {original,cleaned};
  };
  const quieted=make();
  const earlier=quieted.cleaned[64],boost=restoreSpeechLevel(quieted.original,quieted.cleaned);
  assert.ok(boost>1.11&&boost<=1.35,'A quieter speech-like signal gets a bounded boost');
  assert.ok(Math.abs(quieted.cleaned[64]-earlier*boost)<1e-6,'The gain is applied to output, not original');
  assert.ok(Math.max(...quieted.cleaned)<.98,'Boost must not clip the export');

  const alreadyFine=make(.25,.018,1);
  assert.equal(restoreSpeechLevel(alreadyFine.original,alreadyFine.cleaned),1,'Speech already near original level is unchanged');
  const silence=new Float32Array(32000);
  assert.equal(restoreSpeechLevel(silence,silence.slice()),1,'Silence must never be amplified');

  const fanOriginal=new Float32Array(16000*2),fanReduced=new Float32Array(16000*2);
  for(let i=0;i<fanOriginal.length;i++){
    fanOriginal[i]=.09*Math.sin(2*Math.PI*450*i/16000);
    fanReduced[i]=fanOriginal[i]*.2;
  }
  assert.equal(restoreSpeechLevel(fanOriginal,fanReduced),1,'Constant fan noise is not speech');

  const peaked=make(.3,.018,.68);
  peaked.cleaned[500]=.995;
  assert.equal(restoreSpeechLevel(peaked.original,peaked.cleaned),1,'An already peaked output cannot be boosted');
});

test('phone workflow starts with a preview and retains direct full processing',()=>{
  assert.match(html,/id="mobileProcessLabel">10秒試す</);
  assert.match(html,/runDenoise\(state\.result\?'full':'preview'\)/);
  assert.match(html,/id="processButton"/);
  assert.doesNotMatch(html,/\.desktop-run-button, \.desktop-save-button \{ display: none !important; \}/);
  assert.match(html,/id="mobileProcessing" hidden role="status" aria-live="polite"/);
  assert.match(html,/id="mobileCancelButton"/);
  assert.match(html,/\$\('#mobileCancelButton'\)\.addEventListener\('click',\(\)=>stopProcessing\(true\)\)/);
  assert.match(html,/\$\('#appMobileBottomBar'\)\.classList\.toggle\('is-processing',denoising\)/);
  assert.match(html,/\$\('#mobileProgressFill'\)\.style\.width=/);
  for(const key of ['mobileTryTen','mobileCleanAll']){
    assert.equal((html.match(new RegExp(key+':','g'))||[]).length,2,'Bilingual phone label '+key);
  }
});


test('release review: retake, dialog close, preview end, and restored audio state',()=>{
  assert.match(html,/id="recordAgainButton"/);
  assert.match(html,/id="recordAgainButtonLabel"/);
  assert.match(html,/\$\('#recordAgainButton'\)\.addEventListener\('click',toggleRecording\)/);
  assert.match(html,/close\.addEventListener\('click',onCancel\)/);
  assert.match(html,/close\.removeEventListener\('click',onCancel\)/);
  assert.match(html,/if\(a>=state\.sourcePcm\.length\)a=Math\.max\(0,state\.sourcePcm\.length-10\*SAMPLE_RATE\)/);
  assert.match(html,/window\.addEventListener\('pagehide',event=>\{/);
  assert.match(html,/if\(event\.persisted\)return/);
  assert.match(html,/#processButton \{ order: -1; \}/);
  assert.match(html,/id="processButton" type="button" disabled/);
  for(const key of ['mobileActions','compareLabel','monoLabel']){
    assert.equal((html.match(new RegExp(key+':','g'))||[]).length,2,'Bilingual locale '+key);
  }
});
