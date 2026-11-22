// Tests for operate/capacity/shrink-legacy.mjs.
// Run: node operate/capacity/shrink-legacy.test.mjs   (SKIP_CHROME=1 skips the Chrome case; CHROME_PATH overrides the binary)
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  LIMIT, buildInventory, buildPlan, checkShrunk, deletionSet, fitSize, inspectImage, normalizeUploadId,
  pageLogic, pageShrinkSource, parseVersions, verifyRepair, withChrome,
} from './shrink-legacy.mjs';

let n = 0;
const t = async (name, fn) => { await fn(); n++; console.log('ok', name); };

// ---- synthetic JPEG headers ----
const seg = (marker, body) => Buffer.concat([Buffer.from([0xff, marker]), Buffer.from([(body.length + 2) >> 8, (body.length + 2) & 255]), body]);
function exifApp1(orientation, gps = false) {
  const entries = [[0x0112, 3, 1, orientation << 16]].concat(gps ? [[0x8825, 4, 1, 0]] : []);
  const tiff = Buffer.alloc(8 + 2 + entries.length * 12 + 4);
  tiff.write('MM', 0, 'latin1'); tiff.writeUInt16BE(42, 2); tiff.writeUInt32BE(8, 4); tiff.writeUInt16BE(entries.length, 8);
  entries.forEach(([tag, type, count, val], i) => { const o = 10 + i * 12; tiff.writeUInt16BE(tag, o); tiff.writeUInt16BE(type, o + 2); tiff.writeUInt32BE(count, o + 4); tiff.writeUInt32BE(val >>> 0, o + 8); });
  return seg(0xe1, Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), tiff]));
}
const sof = (w, h) => seg(0xc0, Buffer.from([8, h >> 8, h & 255, w >> 8, w & 255, 1, 1, 0x11, 0]));
const icc = () => seg(0xe2, Buffer.from('ICC_PROFILE\0\x01\x01xxxx', 'latin1'));
const jpeg = (...segs) => Buffer.concat([Buffer.from([0xff, 0xd8]), ...segs, Buffer.from([0xff, 0xd9])]);

await t('page fitSize and PHOTO_MAX_SIDE match the tool', () => {
  const L = pageLogic();
  for (const [w, h] of [[4032, 3024], [3024, 4032], [5712, 4284], [3383, 3072], [2400, 1800], [1707, 1280], [2401, 1]]) assert.deepEqual(fitSize(w, h, LIMIT), { ...L.fitSize(w, h, LIMIT) });
  assert.match(pageShrinkSource(), /async function shrinkPhoto\(file, L\)/);
});

await t('inspectImage reads size, orientation, GPS and ICC', () => {
  const i = inspectImage(jpeg(exifApp1(6, true), icc(), sof(4032, 3024)));
  assert.deepEqual([i.w, i.h, i.orientation, i.gps, i.icc, i.exif], [4032, 3024, 6, true, true, true]);
  const p = inspectImage(jpeg(sof(1800, 2400)));
  assert.deepEqual([p.w, p.h, p.orientation, p.exif, p.icc, p.app1], [1800, 2400, null, false, false, false]);
});

await t('checkShrunk applies orientation and rejects metadata', () => {
  const orig = inspectImage(jpeg(exifApp1(6), sof(4032, 3024)));
  assert.deepEqual(checkShrunk(orig, inspectImage(jpeg(sof(1800, 2400)))).problems, []);
  assert.match(checkShrunk(orig, inspectImage(jpeg(sof(2400, 1800)))).problems.join(), /want 1800x2400/); // not rotated
  assert.match(checkShrunk(orig, inspectImage(jpeg(exifApp1(1), sof(1800, 2400)))).problems.join(), /metadata/);
  assert.match(checkShrunk(orig, inspectImage(jpeg(icc(), sof(1800, 2400)))).problems.join(), /colour profile unknown/);
  const plain = inspectImage(jpeg(sof(4032, 3024)));
  assert.deepEqual(checkShrunk(plain, inspectImage(jpeg(sof(2400, 1800)))).problems, []);
});

// ---- data fixtures ----
const A = (k) => 'a'.repeat(31) + k, B = (k) => 'b'.repeat(31) + k;
const docs = () => new Map([
  ['exercises/e1', { subject: 'math', images: [A(1), A(2)], attempts: [{ date: '2026-10-20', result: 'wrong' }], owner: 'u1' }],
  ['exercises/e2', { subject: 'math', images: [A(1), A(2)], attempts: [], owner: 'u1' }],
  ['exercises/e3', { subject: 'math', images: [A(3)], attempts: [], owner: 'u1' }],
  ['exercises/e4', { subject: 'math', setId: 's1', images: [], attempts: [], owner: 'u1' }],
  ['sets/s1', { subject: 'english', images: [A(4), A(1)], title: 'T' }],
]);
const manifest = { assets: Object.fromEntries([1, 2, 3, 4, 5].map((k) => [A(k), { file: A(k) + '.jpg', bytes: 1 }])) };
const sizes = { [A(1)]: [4032, 3024], [A(2)]: [2400, 1800], [A(3)]: [3024, 4032], [A(4)]: [4096, 3072], [A(5)]: [5712, 4284] };
const infoOf = (id) => ({ w: sizes[id][0], h: sizes[id][1], orientation: 1 });
const inv = () => Object.assign(buildInventory(manifest, docs(), infoOf), { snapshotAssets: Object.keys(manifest.assets) });

await t('inventory finds referenced oversized photos, their docs and unreferenced assets', () => {
  const i = inv();
  assert.deepEqual(i.oversized.map((x) => x.id), [A(1), A(3), A(4)]);
  assert.deepEqual(i.docs, ['exercises/e1', 'exercises/e2', 'exercises/e3', 'sets/s1']);
  assert.deepEqual(i.unreferenced, [A(5)]);
});

const versions = new Map([['exercises', parseVersions('- "e1"  1643 bytes  version 4\n[... "e2" 1, "e3" 9]')], ['sets', parseVersions('"s1" 1]')]]);
const uploads = { [A(1)]: '/_blob/' + B(1), [A(3)]: B(3), [A(4)]: 'https://claude.ai/x/_blob/' + B(4) };

await t('parseVersions and normalizeUploadId accept tool output and reject other id shapes', () => {
  assert.deepEqual([...versions.get('exercises')], [['e1', 4], ['e2', 1], ['e3', 9]]);
  assert.equal(normalizeUploadId('/_blob/' + B(1)), B(1));
  assert.throws(() => normalizeUploadId('/assets/abc'), /not a \/_blob/);
});

await t('plan keeps order, maps shared photos one-to-one and pins versions', () => {
  const p = buildPlan(inv(), docs(), uploads, versions, null);
  const by = Object.fromEntries(p.entries.map((e) => [e.key, e]));
  assert.deepEqual(by['exercises/e1'].newImages, [B(1), A(2)]);
  assert.deepEqual(by['exercises/e2'].newImages, [B(1), A(2)]);
  assert.deepEqual(by['sets/s1'].newImages, [B(4), B(1)]);
  assert.equal(by['exercises/e3'].version, 9);
  assert.equal(p.entries.length, 4);
  assert.throws(() => buildPlan(inv(), docs(), uploads, new Map(), null), /no version/);
  assert.throws(() => buildPlan(inv(), docs(), { [A(1)]: B(1) }, versions, null), /no upload/);
  assert.throws(() => buildPlan(inv(), docs(), { ...uploads, [A(3)]: B(1) }, versions, null), /same new id/);
  assert.deepEqual(buildPlan(inv(), docs(), uploads, versions, new Set(['exercises/e3'])).entries.map((e) => e.key), ['exercises/e3']);
});

const map = () => { const p = buildPlan(inv(), docs(), uploads, versions, null); return { assets: p.assetMap }; };
const repaired = () => { const m = new Map(Object.entries(map().assets)); const d = docs(); for (const x of d.values()) x.images = x.images.map((a) => m.get(a) || a); return d; };

await t('verify accepts appended attempts and rejects other changes', () => {
  const post = repaired();
  post.get('exercises/e1').attempts.push({ date: '2026-11-23', result: 'right' });
  post.set('exercises/new', { subject: 'math', images: [B(3)], attempts: [] }); // created later: ignored for groups
  assert.deepEqual(verifyRepair({ preDocs: docs(), postDocs: post, map: map(), newAssetOk: () => true }), []);
  const bad = repaired();
  bad.get('exercises/e1').attempts = [];
  bad.get('sets/s1').owner = 'u1';
  bad.get('exercises/e2').images = [A(1), A(2)];
  const p = verifyRepair({ preDocs: docs(), postDocs: bad, map: map(), newAssetOk: () => true }).join('\n');
  assert.match(p, /e1: earlier attempts changed/);
  assert.match(p, /s1: field owner changed/);
  assert.match(p, /e2: still references superseded/);
  assert.match(p, /photo groups differ/);
  assert.match(verifyRepair({ preDocs: docs(), postDocs: repaired(), map: map(), newAssetOk: () => false }).join(), /fails the shrink rule/);
});

await t('deletion set excludes ids still referenced or unknown to the pre-repair snapshot', () => {
  const m = map();
  const ok = deletionSet({ inv: inv(), map: m, freshDocs: repaired() });
  assert.deepEqual(ok.delete, [A(1), A(3), A(4), A(5)].sort());
  assert.deepEqual(ok.blockers, []);
  const fresh = repaired();
  fresh.set('exercises/late', { subject: 'math', images: [A(5)], attempts: [] });
  fresh.get('exercises/e3').images = [A(3)];
  const r = deletionSet({ inv: inv(), map: m, freshDocs: fresh });
  assert.deepEqual(r.delete, [A(1), A(4)].sort());
  assert.deepEqual(r.kept, [A(3), A(5)].sort());
  assert.match(r.blockers.join(), /e3 still references superseded/);
  const i2 = Object.assign(inv(), { unreferenced: [A(5), 'f'.repeat(32)] });
  assert.ok(!deletionSet({ inv: i2, map: m, freshDocs: repaired() }).delete.includes('f'.repeat(32)));
});

if (process.env.SKIP_CHROME) console.log('skip Chrome case (SKIP_CHROME)');
else await t('Chrome: the page shrink rotates an orientation-6 photo upright and strips metadata', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'shrink-test-'));
  try {
    await withChrome(dir, async (call) => {
      const base = Buffer.from(await call('makeJpeg(3000, 2000)'), 'base64'); // red square at stored top-left
      const withExif = Buffer.concat([base.subarray(0, 2), exifApp1(6, true), base.subarray(2)]);
      writeFileSync(join(dir, 'o6.jpg'), withExif);
      const orig = inspectImage(withExif);
      assert.deepEqual([orig.w, orig.h, orig.orientation, orig.gps], [3000, 2000, 6, true]);
      const r = await call('shrinkOne("/img/o6.jpg")');
      assert.ok(r.ok, 'page shrink kept the original: ' + r.log.join(' | '));
      const out = Buffer.from(r.b64, 'base64');
      assert.deepEqual(checkShrunk(orig, inspectImage(out)).problems, []);
      assert.deepEqual([inspectImage(out).w, inspectImage(out).h], [1600, 2400]);
      const [r1, g1, b1] = await call(`pixelAt(${JSON.stringify(r.b64)}, 1590, 10)`); // orientation 6 = 90° clockwise: top-left → top-right
      assert.ok(r1 > 200 && g1 < 60 && b1 < 60, `top-right pixel ${[r1, g1, b1]} is not red`);
      const [r2, , b2] = await call(`pixelAt(${JSON.stringify(r.b64)}, 10, 10)`);
      assert.ok(b2 > 200 && r2 < 60, 'top-left should be blue after rotation');
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

console.log(`all ${n} shrink-legacy tests passed`);
