#!/usr/bin/env node
// Lightweight simulated-runtime smoke suite (policy: verify/SPEC.md, catalog: verify/README.md).
// Drives local Google Chrome over raw CDP (Node built-ins only, zero npm deps) against unmodified impl/arena.html.
// Usage: node verify/fake-platform-smoke.js [impl/arena.html] [--journeys 0002,0008] [--list]
//   Set CHROME_PATH to override the Chrome binary (defaults to macOS Google Chrome).

const { spawn } = require('node:child_process');
const { existsSync, mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { createServer } = require('node:http');
const { tmpdir } = require('node:os');
const path = require('node:path');

const args = process.argv.slice(2);
const flag = n => { const i = args.indexOf(n); return i < 0 ? null : (args[i + 1] || ''); };
const wanted = flag('--journeys') ? flag('--journeys').split(',').map(s => s.trim()).filter(Boolean) : null;
const target = path.resolve(args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--journeys') || 'impl/arena.html');

const today = new Date(), pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const T = iso(today), Y = iso(new Date(today - 86400000 * 3));
const ex = (id, o) => Object.assign({ owner: 'uS', subject: 'english', topic: 'x', format: 'short', stem: 'Q' + id, answer: 'a', accepted: ['a'], options: [], images: [], createdAt: Y, attempts: [] }, o);
const baseSeed = () => ({
  users: { uS: { joinedAt: Y } }, settings: {},
  sets: {
    SO: { owner: 'uS', subject: 'english', title: 'Owned set', text: 'passage', images: [], wordBank: ['a', 'b'], createdAt: Y },
    SL: { subject: 'english', title: 'Legacy set', text: 'old passage', images: [], wordBank: [], createdAt: Y },
  },
  exercises: {
    e1: ex('1', { answer: 'z', accepted: ['z'], stem: 'Q1', attempts: [{ by: 'uS', date: T, mode: 'daily', paperId: 'DP1', response: 'z', result: 'right', judgedBy: 'auto', at: T + 'T08:00' }] }),
    e2: ex('2', { answer: 'y', accepted: ['y'], stem: 'Q2' }),
    e3: ex('3', { format: 'pick', stem: 'Q3 [[a]]', accepted: undefined, setId: 'SO', setPos: 1 }),
    e4: ex('4', { answer: 'w', accepted: ['w'], stem: 'Q4', setId: 'SL', setPos: 1 }),
    e5: ex('5', { format: 'open', answer: 'model answer', stem: 'Q5' }),
  },
  papers: { DP1: { kind: 'daily', for: 'uS', owner: 'uS', subject: 'english', title: 'English redo', createdAt: T, madeAt: T + 'T07:30', topics: [], count: 3, exerciseIds: ['e1', 'e2', 'e5'], handedIn: {}, responses: { e2: 'y' } } },
  matches: {},
});

// Minimal in-memory fake for window.claude db/user; inject faults via window.__failRead / __failWrite.
const fakeInitScript = (seed, flags) => `(() => {
  Object.assign(window, ${JSON.stringify(flags || {})});
  const data = ${JSON.stringify(seed)}, subs = []; let n = 0;
  const notify = () => subs.forEach(f => f());
  const clone = v => JSON.parse(JSON.stringify(v));
  const snapDoc = (c, id) => ({ id, data: () => clone(data[c][id]) });
  const rows = (c, f, v) => Object.keys(data[c] || {}).filter(id => !f || data[c][id][f] === v).map(id => snapDoc(c, id));
  const q = (c, f, v) => ({
    onSnapshot(cb, errCb) { if (window.__failRead === c) { setTimeout(() => errCb && errCb(new Error('read failed')), 0); return () => {}; } const fire = () => cb({ docs: rows(c, f, v) }); subs.push(fire); setTimeout(fire, 0); return () => {}; },
    async get() { return { docs: rows(c, f, v) }; },
    where(ff, op, vv) { return q(c, ff, vv); },
  });
  const doc = (c, id) => ({ id,
    async get() { const d = (data[c] || {})[id]; return { exists: !!d, data: () => clone(d || {}) }; },
    async set(v) { (data[c] = data[c] || {})[id] = clone(v); notify(); },
    async update(v) {
      const f = window.__failWrite;
      if (f && f.n > 0 && (!f.match || (c + '/' + id).startsWith(f.match))) { f.n--; f.calls++; const e = new Error('injected'); e.code = f.code; throw e; }
      Object.assign(data[c][id], clone(v)); notify();
    },
    async delete() { delete data[c][id]; notify(); },
    onSnapshot(cb, errCb) { if (window.__failRead === c) { setTimeout(() => errCb && errCb(new Error('read failed')), 0); return () => {}; } const fire = () => { const d = (data[c] || {})[id]; cb({ exists: !!d, data: () => clone(d || {}) }); }; subs.push(fire); setTimeout(fire, 0); return () => {}; },
  });
  const db = { collection: c => Object.assign(q(c), { doc: id => doc(c, id || 'auto' + (++n)) }), doc: p => { const [c, id] = p.split('/'); return doc(c, id); } };
  window.__data = data; window.__db = db;
  window.claude = { use: async name => name === 'db' ? db : name === 'user' ? { me: async () => ({ id: 'uS' }), profiles: async () => ({}) } : null };
})();`;

const cases = [];
const add = (name, journeys, fn, opts = {}) => cases.push({ name, journeys, fn, opts });

add('boot-and-read-failure', ['0010'], async c => {
  c.assertOk('boots cleanly into Today and wraps S.db with retryingDb', /Today/.test(await c.txt()) && await c.eval(`S.db !== window.__db && S.rawDb === window.__db`));
  await c.reload(baseSeed(), { __failRead: 'settings' });
  const t = await c.txt();
  c.assertOk('required settings read failure shows explicit error, not empty book', /Couldn't read your data/.test(t) && /your settings couldn't be read/.test(t));
});

add('daily-paper-flow', ['0002', '0009'], async c => {
  c.assertOk('Today lists the protected unfinished daily paper', /unfinished hand-ins/i.test(await c.txt()));
  await c.clickSel('[data-act="start-daily"]');
  c.assertOk('start recovers the existing paper', /Recovered: 1 answer already saved/.test(await c.txt()));
  await c.clickSel('.cardpager .pg-n', 2);
  await c.fill('.answer-in', 'my written answer');
  await c.eval(`window.__failWrite = { n: 99, code: 'permission-denied', calls: 0, match: 'papers/' }`);
  await c.handIn();
  c.assertOk('marker failure keeps paper unsubmitted while saving objective attempt once', await c.eval(`window.__data.exercises.e2.attempts.filter(a => a.paperId === 'DP1').length === 1 && !(window.__data.papers.DP1.handedIn || {}).uS && !!(S.run && S.run.err)`));
  await c.eval(`window.__failWrite = null`);
  await c.clickAct('exit-run');
  await c.clickAct('tab', { v: 'today' });
  await c.clickAct('recover-daily', { id: 'DP1' });
  await c.clickSel('.cardpager .pg-n', 2);
  await c.fill('.answer-in', 'my written answer');
  await c.handIn();
  c.assertOk('retry writes marker without duplicating attempts and leaves written item pending', await c.eval(`!!window.__data.papers.DP1.handedIn.uS && window.__data.exercises.e2.attempts.filter(a => a.paperId === 'DP1').length === 1 && window.__data.exercises.e5.attempts.length === 0`) && /Handed in, not fully assessed: 1 to judge/.test(await c.txt()));
  await c.clickSel('.cardpager .pg-n', 2);
  await c.clickSel('.selfmark button[data-r="right"]');
  const t = await c.txt();
  c.assertOk('self-judgment saves written attempt and shows Fully assessed with coins', /Fully assessed/.test(t) && /3\/3/.test(t) && /\+6 coins/.test(t));
});

add('check-paper-and-override', ['0003', '0004', '0008', '0009'], async c => {
  await c.eval(`S.paperForm = { subject: 'english', topics: [], count: 5 }; S.settings.defaultOwner = 'uS'; S.paperPreview = [{ id: 'e2' }]; S.paperPreviewOwner = 'uZ'`);
  await c.clickAct('paper-create');
  c.assertOk('stale cross-owner preview is refused', await c.eval(`S.paperPreview === null && S.paperMsg && S.paperMsg.kind === 'err'`));
  await c.eval(`S.paperPreview = [{ id: 'e2' }, { id: 'e5' }]; S.paperPreviewOwner = 'uS'`);
  await c.clickAct('paper-create');
  const cpId = await c.eval(`Object.keys(window.__data.papers).find(k => !window.__data.papers[k].kind)`);
  c.assertOk('new check paper starts with empty handedIn map', !!cpId && await c.eval(`JSON.stringify(window.__data.papers[${JSON.stringify(cpId)}].handedIn) === '{}'`));
  await c.clickAct('open-paper', { id: cpId });
  await c.fill('.answer-in', 'y');
  await c.handIn();
  c.assertOk('check paper review shows ladder, no coins, and pending written item', !!(await c.eval(`document.querySelector('.run-ladder svg')`)) && !/coin/.test(await c.txt()) && /1\/2/.test(await c.txt()));
  await c.clickSel('.cardpager .pg-n', 1);
  await c.clickSel('.selfmark button[data-r="right"]');
  c.assertOk('check paper reaches Fully assessed after self-judge', /Fully assessed/.test(await c.txt()));
  await c.clickAct('open-paper', { id: 'DP1' });
  await c.eval(`window.__failWrite = { n: 99, code: 'permission-denied', calls: 0, match: 'exercises/' }`);
  await c.select('select.ov-sel', 'wrong');
  c.assertOk('failed override keeps stored judgment and reports error', await c.eval(`window.__data.exercises.e1.attempts[0].result === 'right' && !!S.run.err`));
  await c.eval(`window.__failWrite = null`);
  await c.select('select.ov-sel', 'wrong');
  c.assertOk('retry override updates own attempt (judgedBy: parent) and recalculates score/coins', await c.eval(`window.__data.exercises.e1.attempts[0].result === 'wrong' && window.__data.exercises.e1.attempts[0].judgedBy === 'parent' && !S.run.err`) && /0\/2/.test(await c.txt()));
}, { seed: s => {
  s.exercises.e2.attempts = [{ by: 'uS', date: T, mode: 'daily', paperId: 'DP1', response: 'q', result: 'wrong', judgedBy: 'auto', at: T + 'T08:00' }];
  s.papers.DP1.exerciseIds = ['e1', 'e2']; s.papers.DP1.count = 2; s.papers.DP1.handedIn = { uS: T + 'T08:30' };
} });

add('library-and-owner-scope', ['0001', '0005', '0006', '0007'], async c => {
  await c.clickAct('delete-ex', { id: 'e3' });
  c.assertOk('owned set is removed with its last member', await c.eval(`!window.__data.sets.SO`));
  await c.clickAct('delete-ex', { id: 'e4' });
  c.assertOk('legacy set is kept with a notice', await c.eval(`!!window.__data.sets.SL && /legacy/.test(S.notice)`));
  const games = async () => { await c.clickAct('tab', { v: 'games' }); return c.eval(`[...document.querySelectorAll('.coin-nums .big, .coin-nums .mid')].map(x => x.textContent.trim()).join(',')`); };
  c.assertOk('Games balance reflects selected library (14 earned, 2 used, balance 12)', await games() === '12,14,2');
  await c.clickAct('tab', { v: 'settings' });
  await c.select('#set-owner', 'uB');
  c.assertOk('switching Default owner saves settings and isolates Games balance (0, never negative)', await c.eval(`window.__data.settings.uS && window.__data.settings.uS.defaultOwner === 'uB'`) && await games() === '0,0,0');
  await c.clickAct('tab', { v: 'settings' });
  await c.select('#set-owner', 'uS');
  await c.clickAct('tab', { v: 'games' });
  await c.clickSel('[data-act="game-start"]');
  c.assertOk('new match stores opener Default owner', await c.eval(`Object.values(window.__data.matches).some(m => m.owner === 'uS' && m.game === 'lift')`));
}, { seed: s => {
  const at = (by, i) => ({ by, date: T, mode: 'daily', paperId: 'DPx' + i, response: 'a', result: 'right', judgedBy: 'auto', at: T + 'T08:0' + i });
  s.users.uB = { joinedAt: Y }; s.settings.uB = { dailyLimit: 10, defaultOwner: 'uS' };
  s.exercises.e1.attempts.push(at('uB', 0));
  for (let i = 1; i <= 6; i++) s.exercises['x' + i] = ex('x' + i, { attempts: [at('uS', i), at('uB', i)] });
  s.matches.M1 = { game: 'lift', by: 'uS', owner: 'uS', players: ['uS', 'uB'], rounds: 1, stakes: { uS: 1, uB: 1 }, at: T + 'T07:00', points: [{ uS: 1, uB: 0 }] };
  s.matches.M2 = { game: 'lift', by: 'uS', players: ['uS', 'uB'], rounds: 1, stakes: { uS: 1, uB: 1 }, at: T + 'T07:30', points: [{ uS: 0, uB: 1 }] };
} });

const wait = ms => new Promise(r => setTimeout(r, ms));
async function runWithChrome(sel) {
  const html = readFileSync(target, 'utf8');
  const server = createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html); });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/arena.html`;
  const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (!existsSync(chromePath)) { server.close(); throw new Error(`Chrome not found at ${chromePath}; set CHROME_PATH`); }
  const profile = mkdtempSync(path.join(tmpdir(), 'arena-smoke-'));
  const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  try {
    const wsBrowser = await new Promise((ok, no) => {
      let err = ''; const t = setTimeout(() => no(new Error('Chrome did not start: ' + err.slice(-300))), 20000);
      chrome.stderr.on('data', d => { err += d; const m = err.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); ok(m[1]); } });
      chrome.on('exit', c => { clearTimeout(t); no(new Error(`Chrome exited ${c}: ${err.slice(-300)}`)); });
    });
    const devPort = new URL(wsBrowser).port;
    let failed = 0;
    for (const k of sel) {
      const tab = await (await fetch(`http://127.0.0.1:${devPort}/json/new?about:blank`, { method: 'PUT' })).json();
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = () => no(new Error('CDP socket failed')); });
      let seq = 0, scriptId = null; const pending = new Map(), errs = [], fails = [];
      ws.onmessage = ev => {
        const m = JSON.parse(ev.data);
        if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
        else if (m.method === 'Runtime.exceptionThrown') errs.push('pageerror ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
      };
      const send = (method, params = {}) => new Promise(ok => { const id = ++seq; pending.set(id, ok); ws.send(JSON.stringify({ id, method, params })); });
      await send('Page.enable'); await send('Runtime.enable');
      const evalExpr = async expr => {
        const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
        if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
        return r.result?.result?.value;
      };
      const load = async (seed, flags) => {
        if (scriptId) await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: scriptId });
        const added = await send('Page.addScriptToEvaluateOnNewDocument', { source: fakeInitScript(seed, flags) });
        scriptId = added.result.identifier;
        await send('Page.navigate', { url });
        for (let i = 0; i < 40; i++) {
          await wait(100);
          const ready = await evalExpr(`(() => { const t = document.querySelector('#app')?.innerText || ''; return t.trim().length > 0 && !/Opening the exercise book/.test(t); })()`);
          if (ready) break;
        }
        await wait(150);
      };
      const c = {
        eval: evalExpr, reload: load,
        txt: () => evalExpr(`(document.querySelector('#app')?.innerText || '').replace(/\\s+/g, ' ')`),
        clickAct: async (act, data = {}) => { await evalExpr(`(() => { const b = document.createElement('button'); b.dataset.act = ${JSON.stringify(act)}; for (const [k, v] of Object.entries(${JSON.stringify(data)})) b.dataset[k] = v; document.body.appendChild(b); b.click(); b.remove(); })()`); await wait(250); },
        clickSel: async (s, i = 0) => { await evalExpr(`document.querySelectorAll(${JSON.stringify(s)})[${i}]?.click()`); await wait(250); },
        fill: async (s, v) => { await evalExpr(`(() => { const el = document.querySelector(${JSON.stringify(s)}); el.value = ${JSON.stringify(v)}; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); })()`); await wait(120); },
        select: async (s, v) => { await evalExpr(`(() => { const el = document.querySelector(${JSON.stringify(s)}); el.value = ${JSON.stringify(v)}; el.dispatchEvent(new Event('change', { bubbles: true })); })()`); await wait(350); },
        handIn: async () => { await evalExpr(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Hand in'))?.click()`); await wait(250); await evalExpr(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Hand in anyway'))?.click()`); await wait(300); },
        assertOk: (label, cond) => { if (!cond) fails.push(label); },
      };
      try {
        const seed = baseSeed(); if (k.opts.seed) k.opts.seed(seed);
        await load(seed, k.opts.flags);
        await k.fn(c);
      } catch (e) { fails.push('threw: ' + e.message.split('\n')[0]); }
      if (errs.length) fails.push('page errors: ' + errs.join(' | '));
      ws.close();
      await fetch(`http://127.0.0.1:${devPort}/json/close/${tab.id}`).catch(() => {});
      if (fails.length) { failed++; console.log('FAIL', k.journeys.join(','), k.name); fails.forEach(f => console.log('   - ' + f)); }
      else console.log('ok  ', k.journeys.join(','), k.name);
    }
    console.log(failed ? `${failed} of ${sel.length} cases failed` : `fake-platform smoke passed (${sel.length} cases${wanted ? ', journeys ' + wanted.join(',') : ', all journeys'})`);
    return failed ? 1 : 0;
  } finally {
    chrome.kill('SIGKILL'); server.close();
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}

(async () => {
  const sel = cases.filter(k => !wanted || k.journeys.some(j => wanted.includes(j)));
  if (args.includes('--list')) { cases.forEach(k => console.log(k.journeys.join(',').padEnd(16), k.name)); return; }
  if (!sel.length) { console.error('no case matches --journeys ' + wanted); process.exit(2); }
  process.exit(await runWithChrome(sel));
})().catch(e => { console.error(e.message); process.exit(1); });
