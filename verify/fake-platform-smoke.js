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
    async set(v) { const f = window.__failWrite; if (f && f.n > 0 && (!f.match || (c + '/' + id).startsWith(f.match))) { f.n--; f.calls++; const e = new Error('injected'); e.code = f.code; throw e; } (data[c] = data[c] || {})[id] = clone(v); notify(); },
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
  // AI stub (opt-in): returns window.__sampleOut after streaming a little text; absent unless a case sets __sampleOut.
  const sample = { json: async (p, o) => { await new Promise(r => setTimeout(r, 50)); o && o.onText && o.onText({ text: '"stem"' }); return clone(window.__sampleOut); } };
  window.claude = { use: async name => name === 'db' ? db : name === 'user' ? { me: async () => ({ id: 'uS' }), profiles: async () => ({}) } : name === 'sample' && window.__sampleOut ? sample : null };
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

add('record-coins-and-messages', ['0001', '0004', '0005', '0007'], async c => {
  // 0001 step 1: the Record pill shows only coins from own recordings this week (2 each); daily-redo coins, legacy (no recordedBy) and others' recordings are excluded.
  await c.clickAct('tab', { v: 'record' });
  const pill = () => c.eval(`(() => { const p = document.querySelector('#rec-coins'); return p ? p.innerText.replace(/\\s+/g, ' ').trim() : ''; })()`);
  c.assertOk('Record line shows "2 coins from recording this week" (own recording only, not the redo coin)', /^\S*\s*2 coins from recording this week\b/.test(await pill()));
  // 0001 steps 3, 6: read with AI, short ok line without timing diagnostics.
  await c.eval(`window.__sampleOut.drafts.forEach(d => { if (d.topic === '__TOPIC__') d.topic = TAX.english.topics[0][0]; })`);   // a valid topic id from the page's own taxonomy (input data, not an oracle)
  await c.fill('#rec-text', 'She go to school yesterday.');
  await c.clickAct('recognise'); await new Promise(r => setTimeout(r, 400));
  const found = await c.eval(`(() => { const n = document.querySelector('#rec-note'); return n ? [n.className, n.textContent] : null; })()`);
  c.assertOk('reading reports "Found 3 drafts" on one green line, no timing', !!found && /\bok\b/.test(found[0]) && /^Found 3 drafts · /.test(found[1]) && !/\d+ s\b|total/.test(found[1]));
  await c.fill('#rec-text', 'x');
  c.assertOk('changing the input clears the stale reading line', await c.eval(`!document.querySelector('#rec-note')`));
  // 0001 step 6 / 6c: two complete drafts save, one incomplete stays; green saved line with coins, amber remainder; celebration shown.
  await c.clickAct('save-all'); await new Promise(r => setTimeout(r, 300));
  const notes = await c.eval(`[...document.querySelectorAll('#rec-drafts > .note')].map(n => n.className + '|' + n.textContent)`);
  c.assertOk('partial save shows green "Saved 2 · +4 coins" and amber "1 incomplete"', notes.some(t => /\bok\|Saved 2 · \+4 coins/.test(t)) && notes.some(t => /\bwarn\|.*1 incomplete/.test(t)) && !notes.some(t => /\berr\|/.test(t)));
  c.assertOk('saving shows the treasure bowl (or its "+4 coins" badge) while coins are earned', await c.eval(`!!document.querySelector('.bowl-wrap') || [...document.querySelectorAll('.coin-badge')].some(e => e.textContent.includes('+4 coins'))`));
  for (let i = 0; i < 60 && await c.eval(`!!S.recAnim`); i++) await new Promise(r => setTimeout(r, 100));
  c.assertOk('the save animation finishes and cleans up', await c.eval(`!S.recAnim && !document.querySelector('.bowl-wrap, .coin-badge')`));
  c.assertOk('new exercises record the saver as recordedBy and the owner as owner', await c.eval(`Object.values(window.__data.exercises).filter(e => /school/.test(e.stem)).length === 2 && Object.values(window.__data.exercises).filter(e => /school/.test(e.stem)).every(e => e.recordedBy === 'uS' && e.owner === 'uS')`));
  c.assertOk('Record line now shows "6 coins from recording this week"', /^\S*\s*6 coins from recording this week\b/.test(await pill()));
  // 0004 step 3 / 0005 step 1: Games shows the recording part and the same earned total.
  await c.clickAct('tab', { v: 'games' });
  const g = await c.eval(`document.querySelector('.panel.coins').innerText.replace(/\\s+/g, ' ')`);
  c.assertOk('Games earned 8 (redo 2 + recording 6) with "3 recorded × 2"', /3 recorded × 2/.test(g) && /8 earned/.test(g));
  // 0007 success: editing someone else's recorded exercise keeps its Recorder; editing a legacy one never adds the editor.
  for (const id of ['r3', 'r2']) {
    await c.clickAct('edit', { id });
    const k = await c.eval(`(() => { const d = S.drafts.find(d => d.editId === ${JSON.stringify(id)}); d.topic = TAX.english.topics[0][0]; d.stem = 'edited ' + d.editId; return d.key; })()`);
    await c.clickAct('save-draft', { k: String(k) });
  }
  c.assertOk('edit keeps recordedBy (uB) and leaves a legacy exercise without one', await c.eval(`window.__data.exercises.r3.stem === 'edited r3' && window.__data.exercises.r2.stem === 'edited r2' && window.__data.exercises.r3.recordedBy === 'uB' && !('recordedBy' in window.__data.exercises.r2)`));
  // 0007 6a: deleting an exercise recorded this week removes its 2 coins.
  await c.clickAct('delete-ex', { id: 'r1' });
  await c.clickAct('tab', { v: 'games' });
  c.assertOk('deleting an own recording (and its redo attempt) drops earned to 4', /4 earned/.test(await c.eval(`document.querySelector('.panel.coins').innerText.replace(/\\s+/g, ' ')`)));
}, { seed: s => {
  for (const e of Object.values(s.exercises)) e.attempts = [];
  s.exercises.r1 = ex('r1', { createdAt: T, recordedBy: 'uS', attempts: [{ by: 'uS', date: T, mode: 'daily', paperId: null, response: 'a', result: 'right', judgedBy: 'auto', at: T + 'T08:00' }] });
  s.exercises.r2 = ex('r2', { createdAt: T });
  s.exercises.r3 = ex('r3', { createdAt: T, recordedBy: 'uB' });
}, flags: { __sampleOut: { sets: [], drafts: [1, 2, 3].map(i => ({ subject: 'english', topic: i < 3 ? '__TOPIC__' : 'no-such-topic', format: 'short', stem: 'She ___ to school yesterday. (' + i + ')', answer: 'went', accepted: ['went'], options: [], solution: 'Key idea: past tense', wrongAnswer: 'go', cause: 'careless', source: 'P5' })) } } });

// 0015 / 0016 / 0006 (discussions 0050, 0051): shared PSLE paper plan with per-user Paper marks, and the Questions per day / New per week finish forecast.
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d); };
const MON = addDays(T, -((today.getDay() + 6) % 7)), PREV = addDays(MON, -7), NEXT = addDays(MON, 7);
const spDoc = (subject, week, school, short, o) => Object.assign({ plan: 'psle-2027', subject, school, short, year: 2023, kind: 'prelim', url: 'https://sgexam.com/x', week, rank: 1 }, o);
const planSeed = s => {
  s.plans = { 'psle-2027': { psleDate: addDays(NEXT, 10), startWeek: PREV, perWeek: 1, updatedAt: T + 'T07:00' }, uS: { psleDate: addDays(NEXT, 10), startWeek: PREV, perWeek: 1 } };
  s.paperMarks = { 'pm1-uS': { paper: 'pm1', by: 'uS', doneOn: PREV, score: 71, total: 100 }, 'pe1-uB': { paper: 'pe1', by: 'uB', doneOn: PREV, score: 40, total: 100 } };
  s.schoolPapers = {
    pm1: spDoc('math', PREV, 'Nanyang Primary', 'NY'),
    pe1: spDoc('english', PREV, 'Rosyth School', 'RS'), ps1: spDoc('science', PREV, 'Tao Nan School', 'TN'),
    pm2: spDoc('math', MON, 'Henry Park Primary', 'HP'), pe2: spDoc('english', MON, 'Nan Hua Primary', 'NH'), ps2: spDoc('science', MON, 'Catholic High (Primary)', 'CHS'),
    pm3: spDoc('math', NEXT, 'Rosyth School', 'RS'), pe3: spDoc('english', NEXT, 'Tao Nan School', 'TN'), ps3: spDoc('science', NEXT, 'Nanyang Primary', 'NY'),
    pr1: spDoc('math', null, 'Red Swastika School', 'RSS', { rank: 40, year: 2022 }),
    other: { for: 'uS', subject: 'math', school: 'Ai Tong School', short: 'AT', year: 2023, kind: 'prelim', url: 'x', week: MON, rank: 1 },   // legacy per-user doc: never shown
  };
};

add('psle-paper-plan', ['0015', '0001'], async c => {
  await c.clickAct('tab', { v: 'papers' });
  await c.clickAct('paper-tab', { v: 'psle' });
  const t = await c.txt();
  // 0015 steps 1-2: sub-tab next to Exam and Daily; progress line; week × subject grid with this week marked; only the actor's papers
  c.assertOk('PSLE sub-tab sits after Exam and Daily', await c.eval(`[...document.querySelectorAll('[data-act="paper-tab"]')].map(b => b.dataset.v).join() === 'check,daily,psle'`));
  c.assertOk('progress line "1 of 9 done · 2 behind · 2 weeks to PSLE"', /1 of 9 done · 2 behind · 2 weeks to PSLE/.test(t));
  c.assertOk('grid has Maths, English, Science columns and three week rows in order', await c.eval(`[...document.querySelectorAll('.sp-grid thead th')].map(x => x.textContent).join('|') === '|Maths|English|Science' && document.querySelectorAll('.sp-grid tbody tr').length === 3`));
  c.assertOk('done paper shows its score, behind papers are marked, this week stands out', await c.eval(`document.querySelector('[data-id="pm1"]').className.includes('sp-done') && /71/.test(document.querySelector('[data-id="pm1"]').textContent) && document.querySelector('[data-id="pe1"]').className.includes('sp-behind') && document.querySelector('#sp-now [data-id="pm2"]') !== null`));
  c.assertOk("a legacy per-user paper (with `for`, no `plan`) is not shown", await c.eval(`!document.querySelector('[data-id="other"]')`));
  c.assertOk("success: another user's mark on the shared plan does not count as the actor's (pe1 is behind for uS)", await c.eval(`!document.querySelector('[data-id="pe1"]').className.includes('sp-done')`));
  c.assertOk('reserve papers are listed, folded', /Reserve: 1 paper\b/.test(t) && await c.eval(`!document.querySelector('details.panel').open`));
  // 0015 steps 3-6: choose a paper, open link, mark done with a score; only the done mark is written
  await c.clickAct('sp-sel', { id: 'pm2' });
  c.assertOk('panel shows the full paper name and an Open paper link to sgexam.com', /2023 P6 Prelim · Henry Park Primary · Maths/.test(await c.txt()) && await c.eval(`(document.querySelector('#sp-panel a[href]') || {}).href === 'https://sgexam.com/x' && document.querySelector('#sp-panel a[href]').target === '_blank'`));
  const before = await c.eval(`JSON.stringify((window.__data.paperMarks||{})['pm2-uS'])`);
  await c.fill('#sp-date', addDays(T, 1)); await c.clickAct('sp-done', { id: 'pm2' });
  c.assertOk('5c: a future date is rejected and nothing is written', /can't be in the future/.test(await c.txt()) && await c.eval(`JSON.stringify((window.__data.paperMarks||{})['pm2-uS'])`) === before);
  await c.fill('#sp-date', T); await c.fill('#sp-score', '120'); await c.fill('#sp-total', '100'); await c.clickAct('sp-done', { id: 'pm2' });
  c.assertOk('5c: a score above the total is rejected', /can't be more than the total/.test(await c.txt()) && await c.eval(`JSON.stringify((window.__data.paperMarks||{})['pm2-uS'])`) === before);
  await c.eval(`window.__failWrite = { n: 99, code: 'permission-denied', calls: 0, match: 'paperMarks/' }`);
  await c.fill('#sp-score', '78'); await c.clickAct('sp-done', { id: 'pm2' });
  c.assertOk('6a: a failed save says so and the paper is not shown as done', /Saving failed/.test(await c.txt()) && await c.eval(`!((window.__data.paperMarks||{})['pm2-uS']||{}).doneOn && !document.querySelector('[data-id="pm2"]').className.includes('sp-done')`));
  await c.eval(`window.__failWrite = null`);
  await c.fill('#sp-score', '78'); await c.clickAct('sp-done', { id: 'pm2' });
  c.assertOk("step 5-6: mark done writes only the actor's Paper mark (date, score, total), leaves the shared paper and other users' marks unchanged, and the grid shows it done", await c.eval(`(() => { const b = window.__data.paperMarks['pm2-uS'], o = window.__data.paperMarks['pe1-uB']; return b.paper === 'pm2' && b.by === 'uS' && b.doneOn === ${JSON.stringify(T)} && b.score === 78 && b.total === 100 && !('doneOn' in window.__data.schoolPapers.pm2) && o.doneOn === ${JSON.stringify(PREV)} && o.score === 40 && Object.keys(window.__data.paperMarks).length === 3; })()`) && await c.eval(`document.querySelector('[data-id="pm2"]').className.includes('sp-done')`) && /2 of 9 done/.test(await c.txt()));
  // 2b / 5a: an earlier-week paper can still be done; a later paper can be done ahead
  await c.clickAct('sp-sel', { id: 'pe3' }); await c.clickAct('sp-done', { id: 'pe3' });
  c.assertOk('5a: a paper can be marked done ahead of its week', await c.eval(`window.__data.paperMarks['pe3-uS'].doneOn === ${JSON.stringify(T)} && window.__data.schoolPapers.pe3.week === ${JSON.stringify(NEXT)}`));
  // 5b: undo clears the mark and score
  await c.clickAct('sp-undo', { id: 'pe3' });
  c.assertOk('5b: Undo clears date, score and total', await c.eval(`(() => { const p = window.__data.paperMarks['pe3-uS']; return p.doneOn === null && p.score === null && p.total === null; })()`));
  // 2d: the Default owner is someone else → "Mine · <owner>" switch, owner view read-only
  const sw = baseSeed(); planSeed(sw); sw.settings.uS = Object.assign({}, sw.settings.uS || {}, { dailyLimit: 10, defaultOwner: 'uB' }); await c.reload(sw);
  await c.clickAct('tab', { v: 'papers' }); await c.clickAct('paper-tab', { v: 'psle' });
  c.assertOk('2d: a two-way switch appears and the grid opens on Mine (1 done)', await c.eval(`document.querySelectorAll('[data-act="sp-who"]').length === 2`) && /1 of 9 done/.test(await c.txt()));
  await c.clickAct('sp-who', { v: 'owner' });
  c.assertOk("2d: the owner view shows uB's marks on the same plan, marked read-only", /read-only/.test(await c.txt()) && await c.eval(`document.querySelector('[data-id="pe1"]').className.includes('sp-done') && !document.querySelector('[data-id="pm1"]').className.includes('sp-done')`));
  await c.clickAct('sp-sel', { id: 'pe2' });
  c.assertOk('2d: in the owner view a paper offers no Mark done, Undo or Record mistakes', await c.eval(`!document.querySelector('[data-act="sp-done"]') && !document.querySelector('[data-act="sp-record"]')`));
  await c.reload((() => { const x = baseSeed(); planSeed(x); return x; })(), { __sampleOut: { sets: [], drafts: [{ subject: 'math', topic: 'x', format: 'short', stem: 'She ___ (go) to school yesterday.', answer: 'went', accepted: ['went'], options: [], solution: 'Key idea: past tense', wrongAnswer: 'go', cause: 'concept', source: 'Rosyth 2023 Prelim Paper 2 Question 7' }, { subject: 'science', topic: 'x', format: 'short', stem: 'They ___ (be) late.', answer: 'were', accepted: ['were'], options: [], solution: 'Key idea: past tense', wrongAnswer: 'was', cause: 'concept', source: '' }] } });
  await c.clickAct('tab', { v: 'papers' }); await c.clickAct('paper-tab', { v: 'psle' });
  // step 7 / 0001 2b: Record mistakes opens Record with the paper's subject and its name as Source; AI numbers are added, never replacing the name
  await c.clickAct('sp-record', { id: 'pe1' });
  c.assertOk('step 7: Record opens on New photos or text with a banner naming the paper', await c.eval(`S.tab === 'record' && S.recMode === 'new'`) && /Recording mistakes from 2023 P6 Prelim Rosyth English/.test(await c.txt()));
  await c.eval(`window.__sampleOut.drafts.forEach(d => { d.topic = TAX.english.topics[0][0]; })`);
  await c.fill('#rec-text', 'Q7. She ___ (go) to school yesterday.');
  await c.clickAct('recognise'); await new Promise(r => setTimeout(r, 400));
  c.assertOk("0001 2b: each draft takes the paper's subject and a Source starting with the paper name plus the AI's paper and question numbers", await c.eval(`S.drafts.length === 2 && S.drafts.every(d => d.subject === 'english') && S.drafts[0].source === '2023 P6 Prelim Rosyth English Paper 2 Q7' && S.drafts[1].source === '2023 P6 Prelim Rosyth English'`));
  // 1a / 2a: no plan, and a failed plan read
  const noPlan = baseSeed(); await c.reload(noPlan);
  await c.clickAct('tab', { v: 'papers' }); await c.clickAct('paper-tab', { v: 'psle' });
  c.assertOk('1a: without a plan the sub-tab says "No plan yet" and Exam/Daily still work', /No plan yet/.test(await c.txt()) && await c.eval(`document.querySelectorAll('[data-act="paper-tab"]').length === 3`));
  const failSeed = baseSeed(); planSeed(failSeed); await c.reload(failSeed, { __failRead: 'plans' });
  await c.clickAct('tab', { v: 'papers' }); await c.clickAct('paper-tab', { v: 'psle' });
  c.assertOk('2a: a failed plan read says the plan is unavailable, not an empty plan', /plan is unavailable/.test(await c.txt()) && !/No plan yet/.test(await c.txt()));
  const failMarks = baseSeed(); planSeed(failMarks); await c.reload(failMarks, { __failRead: 'paperMarks' });
  await c.clickAct('tab', { v: 'papers' }); await c.clickAct('paper-tab', { v: 'psle' });
  c.assertOk('2a: a failed marks read says the marks are unavailable, never nothing done', /marks are unavailable/.test(await c.txt()) && !/0 of 9 done/.test(await c.txt()));
}, { seed: planSeed, flags: { __sampleOut: { sets: [], drafts: [
  { subject: 'math', topic: 'x', format: 'short', stem: 'She ___ (go) to school yesterday.', answer: 'went', accepted: ['went'], options: [], solution: 'Key idea: past tense', wrongAnswer: 'go', cause: 'concept', source: 'Rosyth 2023 Prelim Paper 2 Question 7' },
  { subject: 'science', topic: 'x', format: 'short', stem: 'They ___ (be) late.', answer: 'were', accepted: ['were'], options: [], solution: 'Key idea: past tense', wrongAnswer: 'was', cause: 'concept', source: '' }] } } });

add('questions-per-day-forecast', ['0006'], async c => {
  await c.clickAct('tab', { v: 'settings' });
  const t = await c.txt();
  // 0006 step 1 / 1b: Questions per day under batch size, unset shows recent pace, and the hint says Today isn't limited
  c.assertOk('1b: Questions per day is unset and shows the recent pace instead', await c.eval(`document.querySelector('#set-qpd').value === '' && document.querySelector('#set-qpd').placeholder === '1'`) && /recent pace 1/.test(t) && /Today isn't limited by this/.test(t));
  // 6a: too few recent answers → the stated rate is marked assumed
  c.assertOk('6a: the forecast line marks the right rate as assumed', /80% right \(assumed/.test(t));
  // 1b: saving another setting never stores the recent pace
  await c.select('#set-limit', '12');
  c.assertOk('1b: saving batch size does not store Questions per day', await c.eval(`window.__data.settings.uS.dailyLimit === 12 && !('questionsPerDay' in window.__data.settings.uS)`));
  // step 2-3: the stepper saves; step 6: the forecast redraws with one bar per week and a named finish week
  // 1c: New per week unset shows the recent recording rate, used by the forecast and never stored
  c.assertOk('1c: New per week is unset, shows the recent recording rate (3) and the line says "about 3 new a week"', await c.eval(`document.querySelector('#set-npw').value === '' && document.querySelector('#set-npw').placeholder === '3'`) && /with about 3 new a week/.test(t) && await c.eval(`!('newPerWeek' in window.__data.settings.uS)`));
  // step 3: − / + shows the number and redraws the forecast at once; one write follows shortly after the last tap
  await c.clickAct('qpd-inc');
  c.assertOk('step 3: + on Questions per day starts from the recent pace and shows 2 at once, before any write', await c.eval(`document.querySelector('#set-qpd').value === '2' && !('questionsPerDay' in window.__data.settings.uS)`) && /At 2 a day/.test(await c.txt()));
  await c.clickAct('npw-inc'); await c.clickAct('npw-inc');
  c.assertOk('step 2-3: + on New per week starts from the rounded recent rate (3 → 5) and the forecast redraws "with 5 new a week" at once', await c.eval(`document.querySelector('#set-npw').value === '5' && !('newPerWeek' in window.__data.settings.uS)`) && /with 5 new a week/.test(await c.txt()));
  await wait(900);
  c.assertOk('step 3: shortly after the last tap one write saves both values', await c.eval(`window.__data.settings.uS.questionsPerDay === 2 && window.__data.settings.uS.newPerWeek === 5`) && /Saved/.test(await c.txt()));
  // 3a: a failed stepper write reports unsaved and returns both steppers to the stored values
  await c.eval(`window.__failWrite = { n: 1, code: 'permission-denied', calls: 0, match: 'settings/' }`);
  await c.clickAct('npw-inc'); await c.clickAct('qpd-inc'); await wait(900);
  c.assertOk('3a: a failed write says so and both steppers return to the stored 2 and 5', /Saving failed/.test(await c.txt()) && await c.eval(`document.querySelector('#set-qpd').value === '2' && document.querySelector('#set-npw').value === '5' && window.__data.settings.uS.newPerWeek === 5`));
  await c.eval(`window.__failWrite = null`);
  // step 3: leaving Settings sends a pending write at once
  await c.clickAct('npw-dec'); await c.clickAct('tab', { v: 'today' }); await wait(100);
  c.assertOk('step 3: leaving Settings right after a tap still saves it', await c.eval(`window.__data.settings.uS.newPerWeek === 4`));
  await c.clickAct('tab', { v: 'settings' });
  await c.select('#set-npw', '3');
  await c.select('#set-qpd', '20');
  const f = await c.txt();
  c.assertOk('step 6: at 20 a day the line names the finish week for today\'s 12', /At 20 a day you'll master today's 12 in the week of \d+ \w+ \(\d+ weeks?\)/.test(f) && await c.eval(`window.__data.settings.uS.questionsPerDay === 20`));
  c.assertOk('6a: the dated line also states the assumed right rate and the New per week amount (set, so no "about")', /80% right \(assumed: too few recent answers\), with 3 new a week/.test(f));
  c.assertOk('step 6: one bar pair per week with the remaining count above each bar, falling to 0 in the finish week', await c.eval(`(() => { const n = document.querySelectorAll('.fc-svg rect.fc-old').length, nums = [...document.querySelectorAll('.fc-svg .fc-num')].map(x => Number(x.textContent)); return n >= 2 && document.querySelectorAll('.fc-svg rect.fc-new').length === n && nums[0] === 12 && nums[nums.length - 1] === 0; })()`));
  // Questions per day never limits the Daily redo
  await c.select('#set-qpd', '1');
  await c.select('#set-limit', '5');
  await c.clickAct('tab', { v: 'today' });
  await c.clickAct('start-daily', { subject: 'math' });
  c.assertOk('Today is not limited: the Maths batch takes the batch size (5), not Questions per day (1)', await c.eval(`(() => { const p = Object.values(window.__data.papers).filter(p => p.kind === 'daily' && p.subject === 'math'); return p.length === 1 && p[0].exerciseIds.length === 5; })()`));
  // 6b: far too few a day for the library and its recording → no date within a year
  const big = baseSeed();
  for (let i = 0; i < 300; i++) big.exercises['b' + i] = ex('b' + i, { subject: 'math', createdAt: T });
  big.settings.uS = { dailyLimit: 10, defaultOwner: 'uS', questionsPerDay: 1 };
  await c.reload(big);
  await c.clickAct('tab', { v: 'settings' });
  c.assertOk("6b: at 1 a day the line says not within a year instead of a date", /won't all be mastered within a year\. Try more a day\./.test(await c.txt()));
}, { seed: s => {
  for (const e of Object.values(s.exercises)) e.attempts = [];
  s.papers = {};
  for (let i = 0; i < 12; i++) s.exercises['m' + i] = ex('m' + i, { subject: 'math', createdAt: Y });
  for (const id of ['e1', 'e2', 'e3', 'e4', 'e5']) delete s.exercises[id];
  s.sets = {};
  s.exercises.m0.attempts = [{ by: 'uS', date: T, mode: 'daily', paperId: null, response: 'a', result: 'right', judgedBy: 'auto', at: T + 'T08:00' }];
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
  const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, ...(process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : []), 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
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
