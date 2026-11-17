const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('src/index.template.html','utf8');
test('phone informational footer only',()=>assert.ok(html.includes('@media (max-width: 600px) { body > footer { display: none; } }')));
test('build version belongs to final Help metadata',()=>{assert.match(html, /class="help-build"/);assert.equal((html.match(/id="buildVersion"/g)||[]).length,1);const start=html.lastIndexOf('<dialog',html.indexOf('id="helpDialog"'));const end=html.indexOf('</dialog>',start);assert.ok(html.indexOf('id="buildVersion"')>start&&html.indexOf('id="buildVersion"')<end);});
test('all metadata IDs occur once in final Help child',()=>{const start=html.lastIndexOf('<dialog',html.indexOf('id="helpDialog"'));const end=html.indexOf('</dialog>',start);const help=html.slice(start,end);for(const id of ["buildVersion", "dependencyCount"]){assert.equal(html.split('id="'+id+'"').length-1,1);assert.ok(help.includes('id="'+id+'"'));}assert.match(help,/<section class="help-build">[\s\S]*<\/section>\s*<\/div>\s*$/);});

test('intro is concise and duplicate feature cards are removed',()=>{
  assert.match(html,/<h2 id="heroTitle" data-i18n="introTitle">音声のノイズを減らす<\/h2>/);
  assert.match(html,/<p data-i18n="lead">音声・動画の背景ノイズを減らして、WAVで保存します。<\/p>/);
  assert.doesNotMatch(html,/id="aboutTitle"|notice-card/);
  assert.match(html,/introTitle:'Reduce noise in audio recordings'/);
});
test('local processing badge is hidden only on phone widths',()=>{
  assert.match(html,/@media \(max-width: 600px\)\s*\{\s*\.local-badge\s*\{\s*display:\s*none;/);
});
