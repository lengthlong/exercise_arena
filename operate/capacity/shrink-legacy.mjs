#!/usr/bin/env node
// Shrink legacy oversized photos — local tool for model/operate/capacity/SPEC.md.
// It never writes production. The agent performs uploads, db writes and deletions with the
// Claude Artifact tools; this tool prepares and checks every step from local files.
//
// Commands (run from the repository root; <work> is a folder under backups/repairs/):
//   inventory <snapshot> <work> [--allow-missing] oversized photos, referencing docs, unreferenced assets
//                                               (--allow-missing: dry runs only; plan/deletion-set then refuse)
//   shrink <work> [--only id,id]                page-identical shrink in Chrome; checks every output
//   plan <work> [--only docKey,docKey] [--dry-run]  needs <work>/uploads.json and <work>/versions/*.txt;
//                                               writes per-doc update files, batches.json, map.json
//   verify <work> <post-snapshot>               stage 5 checks against a fresh snapshot
//   deletion-set <work> <fresh-snapshot>        stage 6 deletion set (or the docs that block it)
//
// <snapshot> is a name under backups/snapshots/ or a path. Chrome: CHROME_PATH or the macOS default.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BACKUPS = join(REPO, 'backups');
const ASSETS = join(BACKUPS, 'assets');
const PAGE = join(REPO, 'impl', 'arena.html');
export const LIMIT = 2400;
const IMAGE_COLLECTIONS = ['exercises', 'sets'];
const ID32 = /^[0-9a-f]{32}$/;

const die = (m) => { console.error(m); process.exit(1); };
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (p, v) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };

// ---------- image inspection (JPEG / PNG headers, no decoding) ----------

const SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

function parseExif(buf, start, end) {
  // buf[start..end) is the TIFF block after "Exif\0\0"
  const le = buf.toString('latin1', start, start + 2) === 'II';
  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ifd = start + u32(start + 4);
  if (ifd + 2 > end) return { orientation: null, gps: false };
  const n = u16(ifd);
  let orientation = null, gps = false;
  for (let i = 0; i < n; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > end) break;
    const tag = u16(e);
    if (tag === 0x0112) orientation = u16(e + 8);
    if (tag === 0x8825) gps = true;
  }
  return { orientation, gps };
}

export function iccName(icc) {
  // profile description from the 'desc' tag (ICC v2 'desc' ASCII or v4 'mluc' UTF-16BE)
  if (!icc || icc.length < 132) return null;
  const count = icc.readUInt32BE(128);
  for (let i = 0; i < count; i++) {
    const o = 132 + i * 12;
    if (o + 12 > icc.length) break;
    if (icc.toString('latin1', o, o + 4) !== 'desc') continue;
    const off = icc.readUInt32BE(o + 4), type = icc.toString('latin1', off, off + 4);
    if (type === 'desc') { const n = icc.readUInt32BE(off + 8); return icc.toString('latin1', off + 12, off + 12 + n).split('\u0000')[0]; }
    if (type === 'mluc') {
      const len = icc.readUInt32BE(off + 20), at = off + icc.readUInt32BE(off + 24);
      const b = Buffer.from(icc.subarray(at, at + len)); b.swap16();
      return b.toString('utf16le');
    }
  }
  return null;
}

export function inspectImage(buf) {
  if (buf[0] === 0x89 && buf.toString('latin1', 1, 4) === 'PNG') {
    return { type: 'png', w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), orientation: null, exif: false, gps: false, icc: false, app1: false };
  }
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('not a JPEG or PNG');
  const info = { type: 'jpeg', w: 0, h: 0, orientation: null, exif: false, gps: false, icc: false, iccName: null, app1: false };
  const iccParts = [];
  let p = 2;
  while (p + 4 <= buf.length) {
    if (buf[p] !== 0xff) { p++; continue; }
    const m = buf[p + 1];
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7) || m === 0xff) { p += m === 0xff ? 1 : 2; continue; }
    if (m === 0xd9 || m === 0xda) break;
    const len = buf.readUInt16BE(p + 2);
    const s = p + 4, e = p + 2 + len;
    if (m === 0xe1) {
      info.app1 = true;
      if (buf.toString('latin1', s, s + 6) === 'Exif\0\0') { info.exif = true; Object.assign(info, parseExif(buf, s + 6, e)); }
    }
    if (m === 0xe2 && buf.toString('latin1', s, s + 12) === 'ICC_PROFILE\0') { info.icc = true; iccParts.push(buf.subarray(s + 14, e)); }
    if (SOF.has(m)) { info.h = buf.readUInt16BE(s + 1); info.w = buf.readUInt16BE(s + 3); }
    p = e;
  }
  if (iccParts.length) info.iccName = iccName(Buffer.concat(iccParts));
  return info;
}

export const oriented = (i) => ([5, 6, 7, 8].includes(i.orientation) ? { w: i.h, h: i.w } : { w: i.w, h: i.h });
export function fitSize(w, h, max) {
  // same rule as the page's fitSize (checked against the page source by the tests)
  if (!(Math.max(w, h) > max)) return { w, h };
  const k = max / Math.max(w, h);
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

// Shrink-rule check for one output against its original (capacity contract "Shrink rule").
export function checkShrunk(origInfo, outInfo) {
  const o = oriented(origInfo), want = fitSize(o.w, o.h, LIMIT), problems = [];
  if (outInfo.type !== 'jpeg') problems.push('not JPEG');
  if (outInfo.w !== want.w || outInfo.h !== want.h) problems.push(`size ${outInfo.w}x${outInfo.h}, want ${want.w}x${want.h}`);
  if (Math.max(outInfo.w, outInfo.h) > LIMIT) problems.push('long edge over limit');
  if (outInfo.app1 || outInfo.exif) problems.push('metadata (APP1/EXIF) present');
  if (outInfo.orientation && outInfo.orientation !== 1) problems.push(`orientation tag ${outInfo.orientation}`);
  if (outInfo.gps) problems.push('GPS present');
  if (outInfo.icc && !/sRGB/i.test(outInfo.iccName || '')) problems.push(`colour profile ${outInfo.iccName || 'unknown'} (want sRGB)`);
  return { want, problems };
}

// ---------- snapshots ----------

export function snapDir(arg) {
  if (!arg) die('missing <snapshot>');
  const p = existsSync(arg) ? resolve(arg) : join(BACKUPS, 'snapshots', arg);
  if (!existsSync(join(p, 'db'))) die(`not a snapshot (no db/): ${p}`);
  return p;
}

export function readDocs(snap, collections = IMAGE_COLLECTIONS) {
  const docs = new Map(); // "coll/id" -> doc
  for (const c of collections) {
    const dir = join(snap, 'db', c);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (f.startsWith('.') || !f.endsWith('.json')) continue;
      docs.set(`${c}/${f.slice(0, -5)}`, readJson(join(dir, f)));
    }
  }
  return docs;
}

export function refsOf(docs) {
  const refs = new Map(); // assetId -> Set(docKey)
  for (const [k, d] of docs) for (const a of Array.isArray(d.images) ? d.images : []) {
    if (!refs.has(a)) refs.set(a, new Set());
    refs.get(a).add(k);
  }
  return refs;
}

const storeFile = (id) => readdirSync(ASSETS).find((f) => f.startsWith(id + '.'));

// ---------- inventory ----------

export function buildInventory(manifest, docs, infoOf) {
  const refs = refsOf(docs);
  const oversized = [], unreferenced = [];
  for (const id of Object.keys(manifest.assets).sort()) {
    const info = infoOf(id);
    const o = oriented(info);
    const isOver = Math.max(o.w, o.h) > LIMIT;
    const r = [...(refs.get(id) || [])].sort();
    if (!r.length) unreferenced.push(id);
    if (isOver && r.length) oversized.push({ id, file: manifest.assets[id].file, w: info.w, h: info.h, orientation: info.orientation, gps: info.gps, icc: info.iccName, bytes: manifest.assets[id].bytes, refs: r });
  }
  const docKeys = [...new Set(oversized.flatMap((o) => o.refs))].sort();
  return { limit: LIMIT, oversized, unreferenced, docs: docKeys };
}

function cmdInventory(snapArg, work, o = {}) {
  if (!work) die('missing <work>');
  const snap = snapDir(snapArg);
  const manifest = readJson(join(snap, 'manifest.json'));
  const docs = readDocs(snap);
  const missing = Object.values(manifest.assets).filter((a) => !existsSync(join(ASSETS, a.file)));
  if (missing.length && !('allow-missing' in o)) die(`snapshot assets missing locally: ${missing.map((a) => a.file).join(', ')} — take a fresh verified snapshot`);
  const gone = new Set(missing.map((a) => a.file));
  const inv = buildInventory(manifest, docs, (id) => (gone.has(manifest.assets[id].file) ? { w: 0, h: 0, orientation: null } : inspectImage(readFileSync(join(ASSETS, manifest.assets[id].file)))));
  if (missing.length) { inv.incomplete = missing.map((a) => a.file); console.log(`DRY RUN ONLY: ${missing.length} snapshot asset(s) missing locally; plan and deletion-set will refuse this inventory`); }
  inv.snapshot = basename(snap);
  inv.snapshotAssets = Object.keys(manifest.assets).sort();
  writeJson(join(work, 'inventory.json'), inv);
  const sets = inv.docs.filter((k) => k.startsWith('sets/')).length;
  console.log(`snapshot ${inv.snapshot}: ${inv.oversized.length} referenced oversized photos, ${inv.docs.length} docs (${inv.docs.length - sets} exercises, ${sets} sets), ${inv.unreferenced.length} unreferenced assets`);
}

// ---------- shrink in Chrome with the page's own code ----------

function extractFn(src, header) {
  const i = src.indexOf(header);
  if (i < 0) throw new Error(`page source lacks ${header}`);
  let depth = 0, j = src.indexOf('{', i);
  for (; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}' && --depth === 0) break;
  }
  return src.slice(i, j + 1);
}

export function pageShrinkSource(pageSrc = readFileSync(PAGE, 'utf8')) {
  const m = pageSrc.match(/const PHOTO_MAX_SIDE = (\d+);/);
  if (!m) throw new Error('page source lacks PHOTO_MAX_SIDE');
  if (Number(m[1]) !== LIMIT) throw new Error(`page PHOTO_MAX_SIDE is ${m[1]}, tool LIMIT is ${LIMIT}`);
  return [m[0], extractFn(pageSrc, 'function fitSize('), extractFn(pageSrc, 'async function shrinkPhoto(')].join('\n');
}

const HARNESS = (shrinkSrc) => `<!doctype html><meta charset="utf-8"><body><script>
const LOG = []; const plog = (s) => LOG.push(s);
${shrinkSrc}
const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function shrinkOne(url) {
  LOG.length = 0;
  const blob = await (await fetch(url)).blob();
  const f = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
  const out = await shrinkPhoto(f, {});
  if (out === f) return { ok: false, log: LOG.slice() };
  return { ok: true, b64: b64(new Uint8Array(await out.arrayBuffer())), log: LOG.slice() };
}
async function makeJpeg(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.fillStyle = '#00f'; g.fillRect(0, 0, w, h); g.fillStyle = '#f00'; g.fillRect(0, 0, 200, 200);
  const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
  return b64(new Uint8Array(await blob.arrayBuffer()));
}
async function pixelAt(data, x, y) {
  const img = new Image(); img.src = URL.createObjectURL(new Blob([unb64(data)], { type: 'image/jpeg' })); await img.decode();
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0); return Array.from(g.getImageData(x, y, 1, 1).data.slice(0, 3));
}
</script>`;

export async function withChrome(serveDir, fn) {
  const shrinkSrc = pageShrinkSource();
  const server = createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    if (u === '/harness.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(HARNESS(shrinkSrc)); }
    const f = u.startsWith('/img/') ? join(serveDir, basename(u)) : null;
    if (!f || !existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': f.endsWith('.png') ? 'image/png' : 'image/jpeg' });
    res.end(readFileSync(f));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (!existsSync(chromePath)) { server.close(); throw new Error(`Chrome not found at ${chromePath}; set CHROME_PATH`); }
  const profile = mkdtempSync(join(tmpdir(), 'arena-shrink-'));
  const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  try {
    const wsBrowser = await new Promise((ok, no) => {
      let err = '';
      const t = setTimeout(() => no(new Error('Chrome did not start: ' + err.slice(-300))), 20000);
      chrome.stderr.on('data', (d) => { err += d; const m = err.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); ok(m[1]); } });
      chrome.on('exit', (c) => { clearTimeout(t); no(new Error(`Chrome exited ${c}: ${err.slice(-300)}`)); });
    });
    const devPort = new URL(wsBrowser).port;
    const target = await (await fetch(`http://127.0.0.1:${devPort}/json/new?http://127.0.0.1:${port}/harness.html`, { method: 'PUT' })).json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = () => no(new Error('DevTools socket failed')); });
    let seq = 0; const pending = new Map();
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const send = (method, params) => new Promise((ok) => { const id = ++seq; pending.set(id, ok); ws.send(JSON.stringify({ id, method, params })); });
    for (let i = 0; i < 100; i++) {
      const r = await send('Runtime.evaluate', { expression: "typeof shrinkOne === 'function' && document.readyState === 'complete'", returnByValue: true });
      if (r.result?.result?.value) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    const call = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
      return r.result.result.value;
    };
    return await fn(call);
  } finally {
    chrome.kill('SIGKILL');
    server.close();
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}

async function cmdShrink(work, o) {
  const inv = readJson(join(work, 'inventory.json'));
  const only = o.only ? new Set(o.only.split(',')) : null;
  const todo = inv.oversized.filter((x) => !only || only.has(x.id));
  if (only && todo.length !== only.size) die('--only names an id that is not a referenced oversized photo');
  const outDir = join(work, 'shrunk');
  mkdirSync(outDir, { recursive: true });
  const resultsPath = join(work, 'shrink.json');
  const results = existsSync(resultsPath) ? readJson(resultsPath) : {};
  let failed = 0;
  await withChrome(ASSETS, async (call) => {
    for (const x of todo) {
      const out = join(outDir, x.id + '.jpg');
      const orig = inspectImage(readFileSync(join(ASSETS, x.file)));
      if (!existsSync(out)) {
        const r = await call(`shrinkOne(${JSON.stringify('/img/' + x.file)})`);
        if (!r.ok) { results[x.id] = { ok: false, problems: ['page shrink kept the original'], log: r.log }; failed++; console.log(`FAIL ${x.id}: kept original`); continue; }
        writeFileSync(out, Buffer.from(r.b64, 'base64'));
      }
      const buf = readFileSync(out);
      const { want, problems } = checkShrunk(orig, inspectImage(buf));
      results[x.id] = { ok: !problems.length, file: `shrunk/${x.id}.jpg`, bytes: buf.length, sha256: sha256(buf), w: want.w, h: want.h, problems };
      if (problems.length) { failed++; console.log(`FAIL ${x.id}: ${problems.join('; ')}`); }
    }
  });
  writeJson(resultsPath, results);
  const ok = todo.filter((x) => results[x.id]?.ok).length;
  console.log(`${ok}/${todo.length} shrunk and checked (${Object.values(results).filter((r) => r.ok).length} ok in total)`);
  if (failed) process.exit(1);
}

// ---------- plan ----------

export function parseVersions(text) {
  // Accepts the ArtifactData list/query/get output: '- "<id>"  <n> bytes  version <v>' lines and '"<id>" <v>' pairs.
  const v = new Map();
  for (const m of text.matchAll(/"([A-Za-z0-9_\-.~:@+]{1,200})"\s+(?:\d+ bytes\s+)?version (\d+)/g)) v.set(m[1], Number(m[2]));
  for (const m of text.matchAll(/"([A-Za-z0-9_\-.~:@+]{1,200})" (\d+)(?=[,\]\s])/g)) if (!v.has(m[1])) v.set(m[1], Number(m[2]));
  return v;
}

export function normalizeUploadId(v) {
  // uploads.json values may be a bare id or the url the upload returned; only a /_blob/<32 hex> id is accepted
  const s = String(v).trim();
  if (ID32.test(s)) return s;
  const m = s.match(/\/_blob\/([0-9a-f]{32})(?:[?#].*)?$/);
  if (m) return m[1];
  throw new Error(`upload result is not a /_blob/<32 hex> id: ${s}`);
}

export function buildPlan(inv, docs, uploads, versions, only) {
  const map = new Map(Object.entries(uploads).map(([o, n]) => [o, normalizeUploadId(n)]));
  const over = new Set(inv.oversized.map((x) => x.id));
  const keys = only ? inv.docs.filter((k) => only.has(k)) : inv.docs;
  if (only && keys.length !== only.size) throw new Error('--only names a doc that does not reference an oversized photo');
  const entries = [];
  for (const k of keys) {
    const d = docs.get(k);
    if (!d) throw new Error(`doc ${k} not in snapshot`);
    const [collection, id] = k.split('/');
    const version = versions.get(collection)?.get(id);
    if (!version) throw new Error(`no version for ${k}; save the ArtifactData listing to versions/${collection}.txt`);
    const oldImages = d.images.slice();
    const missing = oldImages.filter((a) => over.has(a) && !map.has(a));
    if (missing.length) throw new Error(`${k}: no upload for ${missing.join(', ')}`);
    const newImages = oldImages.map((a) => (over.has(a) ? map.get(a) : a));
    entries.push({ key: k, collection, id, version, oldImages, newImages });
  }
  const news = [...map.values()];
  if (new Set(news).size !== news.length) throw new Error('two originals map to the same new id');
  for (const n of news) if (over.has(n) || inv.snapshotAssets.includes(n)) throw new Error(`new id ${n} already existed before the repair`);
  return { entries, assetMap: Object.fromEntries(map) };
}

function cmdPlan(work, o) {
  const inv = readJson(join(work, 'inventory.json'));
  if (inv.incomplete && !('dry-run' in o)) die('inventory is incomplete (dry run only); take a fresh verified snapshot');
  const docs = readDocs(snapDir(inv.snapshot));
  const uploads = readJson(join(work, 'uploads.json'));
  const versions = new Map();
  for (const c of IMAGE_COLLECTIONS) {
    const p = join(work, 'versions', c + '.txt');
    if (existsSync(p)) versions.set(c, parseVersions(readFileSync(p, 'utf8')));
  }
  const shrink = existsSync(join(work, 'shrink.json')) ? readJson(join(work, 'shrink.json')) : {};
  for (const old of Object.keys(uploads)) if (!shrink[old]?.ok) die(`upload for ${old} has no passing shrink result`);
  let plan;
  try { plan = buildPlan(inv, docs, uploads, versions, o.only ? new Set(o.only.split(',')) : null); } catch (e) { die(e.message); }
  const name = o.only ? 'canary' : 'bulk';
  const dir = join(work, 'writes-' + name);
  const writes = plan.entries.map((e) => {
    const f = join(dir, `${e.collection}__${e.id}.json`);
    writeJson(f, { images: e.newImages });
    return { op: 'update', collection: e.collection, doc_id: e.id, file_path: f, if_version: e.version };
  });
  const batches = [];
  for (let i = 0; i < writes.length; i += 50) batches.push(writes.slice(i, i + 50));
  writeJson(join(work, `batches-${name}.json`), batches);
  const mapPath = join(work, 'map.json');
  const prev = existsSync(mapPath) ? readJson(mapPath) : { assets: {}, docs: {} };
  Object.assign(prev.assets, plan.assetMap);
  for (const e of plan.entries) prev.docs[e.key] = { oldImages: e.oldImages, newImages: e.newImages, versionRead: e.version };
  writeJson(mapPath, prev);
  console.log(`${name}: ${writes.length} images-only updates in ${batches.length} batch(es) → batches-${name}.json; map.json updated`);
}

// ---------- verify (stage 5) ----------

let PAGE_LOGIC = null;
export function pageLogic() {
  if (PAGE_LOGIC) return PAGE_LOGIC;
  const html = readFileSync(PAGE, 'utf8');
  const src = html.slice(html.indexOf('/* LOGIC:BEGIN'), html.indexOf('/* LOGIC:END */'));
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(src + ';this.L={photoGroups,fitSize};', ctx);
  return (PAGE_LOGIC = ctx.L);
}

const groupView = (gs) => JSON.stringify(gs.map((g) => ({ key: g.key, ids: g.ids })).sort((a, b) => a.key.localeCompare(b.key)));
const exList = (docs, keep) => [...docs].filter(([k]) => k.startsWith('exercises/') && (!keep || keep.has(k))).map(([k, d]) => Object.assign({}, d, { id: k.slice(10) }));

export function verifyRepair({ preDocs, postDocs, map, newAssetOk }) {
  const problems = [];
  const old2new = new Map(Object.entries(map.assets));
  const mapImages = (imgs) => (Array.isArray(imgs) ? imgs.map((a) => old2new.get(a) || a) : imgs);
  for (const [k, pre] of preDocs) {
    const post = postDocs.get(k);
    if (!post) { problems.push(`${k}: missing after repair`); continue; }
    const want = mapImages(pre.images);
    if (JSON.stringify(post.images ?? null) !== JSON.stringify(want ?? null)) problems.push(`${k}: images ${JSON.stringify(post.images)} ≠ mapped ${JSON.stringify(want)}`);
    const keys = new Set([...Object.keys(pre), ...Object.keys(post)]);
    for (const f of keys) {
      if (f === 'images') continue;
      if (f === 'attempts') {
        const a = pre.attempts || [], b = post.attempts || [];
        if (b.length < a.length || JSON.stringify(b.slice(0, a.length)) !== JSON.stringify(a)) problems.push(`${k}: earlier attempts changed`);
        continue;
      }
      if (JSON.stringify(pre[f]) !== JSON.stringify(post[f])) problems.push(`${k}: field ${f} changed`);
    }
  }
  for (const [k, d] of postDocs) for (const a of Array.isArray(d.images) ? d.images : []) {
    if (old2new.has(a)) problems.push(`${k}: still references superseded ${a}`);
    else if (Object.values(map.assets).includes(a) && !newAssetOk(a)) problems.push(`${k}: new asset ${a} missing or fails the shrink rule`);
  }
  const L = pageLogic();
  const keep = new Set([...preDocs.keys()]);
  const before = L.photoGroups(exList(preDocs).map((e) => Object.assign(e, { images: mapImages(e.images) })));
  const after = L.photoGroups(exList(postDocs, keep));
  if (groupView(before) !== groupView(after)) problems.push('photo groups differ from the pre-repair groups with ids mapped');
  return problems;
}

function cmdVerify(work, postArg) {
  const inv = readJson(join(work, 'inventory.json'));
  const map = readJson(join(work, 'map.json'));
  const preDocs = readDocs(snapDir(inv.snapshot));
  const postDocs = readDocs(snapDir(postArg));
  const origInfo = new Map(inv.oversized.map((x) => [x.id, inspectImage(readFileSync(join(ASSETS, x.file)))]));
  const new2old = new Map(Object.entries(map.assets).map(([o, n]) => [n, o]));
  const newAssetOk = (id) => {
    const f = existsSync(ASSETS) && storeFile(id);
    if (!f) return false;
    return !checkShrunk(origInfo.get(new2old.get(id)), inspectImage(readFileSync(join(ASSETS, f)))).problems.length;
  };
  const problems = verifyRepair({ preDocs, postDocs, map, newAssetOk });
  writeJson(join(work, 'verify.json'), { post: basename(snapDir(postArg)), checkedDocs: preDocs.size, problems });
  if (problems.length) { console.log(problems.join('\n')); die(`\n${problems.length} problem(s); do not delete anything`); }
  console.log(`OK: ${preDocs.size} pre-repair docs verified against ${basename(snapDir(postArg))}; ${Object.keys(map.assets).length} new assets pass the shrink rule`);
}

// ---------- deletion set (stage 6) ----------

export function deletionSet({ inv, map, freshDocs }) {
  const freshRefs = refsOf(freshDocs);
  const pre = new Set(inv.snapshotAssets);
  const superseded = Object.keys(map.assets);
  const blockers = [];
  for (const id of superseded) if (freshRefs.has(id)) blockers.push(...[...freshRefs.get(id)].map((k) => `${k} still references superseded ${id}`));
  const candidates = [...new Set([...superseded, ...inv.unreferenced])];
  const del = candidates.filter((id) => pre.has(id) && !freshRefs.has(id)).sort();
  const kept = candidates.filter((id) => !del.includes(id)).sort();
  return { delete: del, kept, blockers };
}

function cmdDeletionSet(work, freshArg) {
  const inv = readJson(join(work, 'inventory.json'));
  if (inv.incomplete) die('inventory is incomplete (dry run only); take a fresh verified snapshot');
  const map = readJson(join(work, 'map.json'));
  const r = deletionSet({ inv, map, freshDocs: readDocs(snapDir(freshArg)) });
  writeJson(join(work, 'deletion.json'), { fresh: basename(snapDir(freshArg)), ...r });
  if (r.blockers.length) { console.log(r.blockers.join('\n')); die('\nrewrite these docs and read again before deleting'); }
  console.log(`${r.delete.length} assets to delete (${r.kept.length} kept because still referenced or not in the pre-repair snapshot) → deletion.json`);
}

// ---------- CLI ----------

function opts(argv) {
  const o = {}, rest = [];
  const flags = new Set(['--allow-missing', '--dry-run']);
  for (let i = 0; i < argv.length; i++) (flags.has(argv[i]) ? (o[argv[i].slice(2)] = true) : argv[i].startsWith('--') ? (o[argv[i].slice(2)] = argv[++i]) : rest.push(argv[i]));
  return [o, rest];
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [cmd, ...args] = process.argv.slice(2);
  const [o, r] = opts(args);
  const work = (p) => (p ? resolve(p) : die('missing <work>'));
  if (cmd === 'inventory') cmdInventory(r[0], work(r[1]), o);
  else if (cmd === 'shrink') await cmdShrink(work(r[0]), o);
  else if (cmd === 'plan') cmdPlan(work(r[0]), o);
  else if (cmd === 'verify') cmdVerify(work(r[0]), r[1]);
  else if (cmd === 'deletion-set') cmdDeletionSet(work(r[0]), r[1]);
  else die('usage: node operate/capacity/shrink-legacy.mjs inventory|shrink|plan|verify|deletion-set ... (see header)');
}
