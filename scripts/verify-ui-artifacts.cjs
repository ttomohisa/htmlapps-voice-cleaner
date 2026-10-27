'use strict';
// Static generated-artifact checks; this does not launch a browser or run WASM.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8');
assert.deepEqual(fs.readFileSync('voice-cleaner.html'),fs.readFileSync('dist/index.html'));
for(const name of ['ui-conventions.js','ui-conventions.css']){
 const bytes=fs.readFileSync('components/'+name),pin=JSON.parse(fs.readFileSync('components/ui-conventions.lock.json','utf8'));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),pin.files[name]);
 assert.ok(html.includes(bytes.toString('utf8')),'Generated HTML must contain exact shared '+name);
}
assert.ok(!/__BK_UI_(?:JS|CSS)__/.test(html),'Shared build markers must be expanded');
let scripts=0;for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){new vm.Script(match[1]);scripts++;}
assert.ok(scripts>=3,'Expected shared, confirmation and application scripts');
const manifest=JSON.parse(fs.readFileSync('dist/dependency-manifest.json','utf8'));
assert.equal(manifest.dependencies.length,1);const dep=manifest.dependencies[0];assert.equal(dep.version,'0.0.3');
assert.equal(dep.tarballSha256,'d0dd19d7494d687834657a8d16914849fc38bf6863532c9213d24642470ff7f2');
const expected={main:'1f842cbd88bd899c85a6d8c03a97af17d52c3f90026d2e1d765bc22570e2d9de',wasm:'01a5286ddaa1ce6d0dd5510bd9241f3bf0cc727a05d5767ae6881d85d9983719'};
for(const asset of dep.assets)assert.equal(asset.sha256,expected[asset.key],'Pinned GTCRN bytes must stay unchanged');
console.log('[OK] Generated script syntax, exact shared embeds, root/readable identity and pinned GTCRN asset hashes.');
