#!/usr/bin/env node
// Exercise Arena backup helper. Works only on local files; downloading is done by an agent
// with the ArtifactData / Artifact tools (see README.md). Node built-ins only.
//
//   node operate/recover/backup.mjs need <snapshot> [listed-ids.txt]
//       Asset ids referenced by the snapshot's db (plus ids in the optional listing file,
//       one per line) that are not yet in backups/assets/ — i.e. what still has to be downloaded.
//   node operate/recover/backup.mjs finalize <snapshot> --artifact <url> --listed-count N --listed-bytes N [--ids ids.txt]
//       --ids: the asset ids on the platform at snapshot time (one per line). The store is never pruned,
//       so after assets are deleted on the platform the whole store no longer equals the listing;
//       with --ids the manifest covers exactly those ids (all must be stored).
//       Write <snapshot>/manifest.json: doc counts and hashes, asset references, asset store
//       hashes, and the server's asset-listing totals for comparison.
//   node operate/recover/backup.mjs verify <snapshot>
//       Re-hash everything against the manifest and check every referenced asset is present.
//
// <snapshot> is a directory name under backups/snapshots/ (e.g. 20261122) or a path.

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ROOT = join(REPO, 'backups');
const ASSETS = join(ROOT, 'assets');
const COLLECTIONS = ['exercises', 'sets', 'papers', 'users', 'settings', 'matches', 'plans', 'schoolPapers', 'paperMarks'];
// Snapshots taken before `plans` and `schoolPapers` (0050) or `paperMarks` (0051) existed have no entry for them; an absent entry with no documents verifies.
// Collections whose documents carry `images` (asset ids), per DATA.md.
const IMAGE_COLLECTIONS = ['exercises', 'sets'];

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const die = (msg) => { console.error(msg); process.exit(1); };

function snapDir(arg) {
  if (!arg) die('missing <snapshot>');
  const p = existsSync(arg) ? resolve(arg) : join(ROOT, 'snapshots', arg);
  if (!existsSync(join(p, 'db'))) die(`not a snapshot (no db/): ${p}`);
  return p;
}

function opts(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[++i];
  return o;
}

function readDb(snap) {
  const db = {};
  for (const c of COLLECTIONS) {
    const dir = join(snap, 'db', c);
    db[c] = existsSync(dir)
      ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
          .map((f) => ({ id: f.slice(0, -5), raw: readFileSync(join(dir, f)) }))
      : [];
  }
  return db;
}

function referencedAssets(db) {
  const refs = new Map(); // assetId -> ["exercises/<id>", ...]
  for (const c of IMAGE_COLLECTIONS) {
    for (const { id, raw } of db[c]) {
      const doc = JSON.parse(raw);
      for (const a of Array.isArray(doc.images) ? doc.images : []) {
        if (!refs.has(a)) refs.set(a, []);
        refs.get(a).push(`${c}/${id}`);
      }
    }
  }
  return refs;
}

function assetStore() {
  const store = new Map(); // id -> filename
  if (!existsSync(ASSETS)) return store;
  for (const f of readdirSync(ASSETS)) {
    const id = f.replace(/\.[^.]+$/, '');
    if (/^[0-9a-f]{32}$/.test(id)) store.set(id, f);
  }
  return store;
}

function cmdNeed(snapArg, listing) {
  const refs = referencedAssets(readDb(snapDir(snapArg)));
  const want = new Set(refs.keys());
  if (listing) for (const l of readFileSync(listing, 'utf8').split(/\s+/)) if (l) want.add(l.replace(/^\/_blob\//, ''));
  const store = assetStore();
  const missing = [...want].filter((id) => !store.has(id)).sort();
  for (const id of missing) console.log(id);
  console.error(`${missing.length} to download (${want.size} wanted, ${store.size} already stored)`);
}

function cmdFinalize(snapArg, o) {
  const snap = snapDir(snapArg);
  const db = readDb(snap);
  const refs = referencedAssets(db);
  let store = assetStore();
  if (o.ids) {
    const ids = readFileSync(o.ids, 'utf8').split(/\s+/).map((l) => l.replace(/^\/_blob\//, '')).filter(Boolean);
    const missing = ids.filter((id) => !store.has(id));
    if (missing.length) die(`--ids lists assets not in the store: ${missing.join(', ')}`);
    store = new Map(ids.sort().map((id) => [id, store.get(id)]));
  }

  const collections = {};
  for (const c of COLLECTIONS) {
    const h = createHash('sha256');
    for (const { id, raw } of db[c]) h.update(`${id}\n${sha256(raw)}\n`);
    collections[c] = { count: db[c].length, sha256: h.digest('hex') };
  }

  const assets = {};
  let storeBytes = 0;
  for (const [id, file] of [...store].sort()) {
    const buf = readFileSync(join(ASSETS, file));
    storeBytes += buf.length;
    assets[id] = { file, bytes: buf.length, sha256: sha256(buf) };
  }
  const missing = [...refs.keys()].filter((id) => !store.has(id)).sort();
  const unreferenced = [...store.keys()].filter((id) => !refs.has(id)).sort();

  const page = join(snap, 'page', 'index.html');
  const repoPage = join(REPO, 'impl', 'arena.html');
  let pageInfo = null;
  if (existsSync(page)) {
    const buf = readFileSync(page);
    pageInfo = {
      file: 'page/index.html', bytes: buf.length, sha256: sha256(buf),
      matchesRepoImpl: existsSync(repoPage) ? sha256(readFileSync(repoPage)) === sha256(buf) : null,
    };
  }

  const listedCount = o['listed-count'] ? Number(o['listed-count']) : null;
  const listedBytes = o['listed-bytes'] ? Number(o['listed-bytes']) : null;
  const manifest = {
    format: 1,
    snapshot: basename(snap),
    artifact: o.artifact ?? null,
    finalizedAt: new Date().toISOString(),
    collections,
    page: pageInfo,
    assetStore: {
      dir: '../../assets',
      count: store.size,
      bytes: storeBytes,
      serverListing: { count: listedCount, bytes: listedBytes },
      matchesServerListing: listedCount === null ? null : listedCount === store.size && listedBytes === storeBytes,
    },
    references: {
      referencedAssetCount: refs.size,
      missingAssets: missing.map((id) => ({ id, referencedBy: refs.get(id) })),
      unreferencedAssetCount: unreferenced.length,
    },
    assets,
  };
  writeFileSync(join(snap, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ ...manifest, assets: `${store.size} entries` }, null, 2));
  if (missing.length) die(`\n${missing.length} referenced asset(s) missing from the store`);
}

function cmdVerify(snapArg) {
  const snap = snapDir(snapArg);
  const mPath = join(snap, 'manifest.json');
  if (!existsSync(mPath)) die('no manifest.json; run finalize first');
  const m = JSON.parse(readFileSync(mPath, 'utf8'));
  const db = readDb(snap);
  const problems = [];
  for (const c of COLLECTIONS) {
    if (!m.collections[c] && db[c].length === 0) continue;
    const h = createHash('sha256');
    for (const { id, raw } of db[c]) h.update(`${id}\n${sha256(raw)}\n`);
    if (db[c].length !== m.collections[c]?.count || h.digest('hex') !== m.collections[c]?.sha256) problems.push(`db/${c} changed`);
  }
  for (const [id, a] of Object.entries(m.assets)) {
    const p = join(ASSETS, a.file);
    if (!existsSync(p)) { problems.push(`asset missing: ${a.file}`); continue; }
    if (statSync(p).size !== a.bytes || sha256(readFileSync(p)) !== a.sha256) problems.push(`asset changed: ${a.file}`);
  }
  const store = assetStore();
  for (const id of referencedAssets(db).keys()) if (!store.has(id)) problems.push(`referenced asset not stored: ${id}`);
  if (m.page) {
    const p = join(snap, m.page.file);
    if (!existsSync(p) || sha256(readFileSync(p)) !== m.page.sha256) problems.push('page/index.html changed or missing');
  }
  if (problems.length) die(problems.join('\n'));
  console.log(`OK ${m.snapshot}: ${Object.values(m.collections).reduce((n, c) => n + c.count, 0)} docs, ${Object.keys(m.assets).length} assets verified`);
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'need') cmdNeed(rest[0], rest[1]);
else if (cmd === 'finalize') cmdFinalize(rest[0], opts(rest.slice(1)));
else if (cmd === 'verify') cmdVerify(rest[0]);
else die('usage: node operate/recover/backup.mjs need|finalize|verify <snapshot> [...]');
