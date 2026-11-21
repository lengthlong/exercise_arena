// 模拟平台验收入口（声明的替代品，证据层级见 model/verify/SPEC.md）：用内存里的假 db/user 在无头 Chromium 里打开 impl/arena.html，
// 每个用例从同一份种子重新开一页，带旅程编号，可按旅程挑着跑。它只证明页面代码在假平台约定下的行为；
// 真实 db 查询、身份、AI/照片、真实 db 上的部分写入恢复需要授权的 OFFLINE 测试 Artifact（见 verify/README.md）。
// 用法：node verify/fake-platform-smoke.js impl/arena.html [--journeys 0002,0008] [--list]
//   不带 --journeys 跑全部（发布候选必须全跑）；--list 只列用例与旅程。需要可 require 的 playwright 与 Chromium。
const assert = require('assert'); const path = require('path');
const args = process.argv.slice(2);
const flag = n => { const i = args.indexOf(n); return i < 0 ? null : (args[i + 1] || ''); };
const wanted = flag('--journeys') ? flag('--journeys').split(',').map(s => s.trim()).filter(Boolean) : null;
const target = path.resolve(args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--journeys') || 'impl/arena.html');
const today = new Date(); const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const ago = n => iso(new Date(today - 86400000 * n));
const T = iso(today), Y = ago(3);
const ex = (id, o) => Object.assign({ owner: 'uS', subject: 'english', topic: 'x', format: 'short', stem: 'Q' + id, answer: 'a', accepted: ['a'], options: [], images: [], createdAt: Y, attempts: [] }, o);
const baseSeed = () => ({
  users: { uS: { joinedAt: Y } },
  settings: {},
  sets: { SO: { owner: 'uS', subject: 'english', title: 'Owned set', text: 'passage', images: [], wordBank: ['a', 'b'], createdAt: Y }, SL: { subject: 'english', title: 'Legacy set', text: 'old passage', images: [], wordBank: [], createdAt: Y } },
  exercises: {
    e1: ex('1', { answer: 'z', accepted: ['z'], stem: 'Q1', attempts: [{ by: 'uS', date: T, mode: 'daily', paperId: 'DP1', response: 'z', result: 'right', judgedBy: 'auto', at: T + 'T08:00' }] }),
    e2: ex('2', { answer: 'y', accepted: ['y'], stem: 'Q2' }),
    e3: ex('3', { format: 'pick', stem: 'Q3 [[a]]', accepted: undefined, setId: 'SO', setPos: 1 }),
    e4: ex('4', { answer: 'w', accepted: ['w'], stem: 'Q4', setId: 'SL', setPos: 1 }),
  },
  papers: { DP1: { kind: 'daily', for: 'uS', owner: 'uS', subject: 'english', title: 'English redo', createdAt: T, madeAt: T + 'T07:30', topics: [], count: 2, exerciseIds: ['e1', 'e2'], handedIn: {}, responses: { e2: 'y' } } },
  matches: {},
});

// 假平台：只实现页面用到的 db/user；故障靠 window.__fail* 注入（__failRead、__failIdentity、__failUsers、__failWrite、__failDelete）
const initFake = ([seed]) => {
  const data = JSON.parse(JSON.stringify(seed)); const subs = []; let n = 0;
  const notify = () => subs.forEach(f => f());
  const snapDoc = (c, id) => ({ id, data: () => JSON.parse(JSON.stringify(data[c][id])) });
  const rows = (c, f, v) => Object.keys(data[c] || {}).filter(id => !f || data[c][id][f] === v).map(id => snapDoc(c, id));
  const q = (c, f, v) => ({
    onSnapshot(cb, errCb) { if (window.__failRead === c) { setTimeout(() => errCb && errCb(new Error('read failed')), 0); return () => {}; } const fire = () => cb({ docs: rows(c, f, v) }); subs.push(fire); setTimeout(fire, 0); return () => {}; },
    async get() { return { docs: rows(c, f, v) }; },
    where(ff, op, vv) { return q(c, ff, vv); },
  });
  const doc = (c, id) => ({ id,
    async get() { if (window.__failUsers && c === 'users') throw new Error('users unavailable'); const d = (data[c] || {})[id]; return { exists: !!d, data: () => JSON.parse(JSON.stringify(d || {})) }; },
    async set(v) { (data[c] = data[c] || {})[id] = JSON.parse(JSON.stringify(v)); notify(); },
    async update(v) {
      const f = window.__failWrite;   // { n: 失败次数, code, calls, match?: 只对以此开头的 'collection/id' 失败 }
      if (f && f.n > 0 && (!f.match || (c + '/' + id).startsWith(f.match))) { f.n--; f.calls++; const e = new Error('injected'); e.code = f.code; throw e; }
      Object.assign(data[c][id], JSON.parse(JSON.stringify(v))); notify();
    },
    async delete() { if (window.__failDelete) throw new Error('delete failed'); delete data[c][id]; notify(); },
    onSnapshot(cb, errCb) { if (window.__failRead === c) { setTimeout(() => errCb && errCb(new Error('read failed')), 0); return () => {}; } const fire = () => { const d = (data[c] || {})[id]; cb({ exists: !!d, data: () => JSON.parse(JSON.stringify(d || {})) }); }; subs.push(fire); setTimeout(fire, 0); return () => {}; } });
  const db = { collection: c => Object.assign(q(c), { doc: id => doc(c, id || 'auto' + (++n)) }), doc: p => { const [c, id] = p.split('/'); return doc(c, id); } };
  window.__data = data; window.__db = db;
  window.claude = { use: async name => name === 'db' ? db : name === 'user' ? { me: async () => { if (window.__failIdentity) throw new Error('no identity'); return { id: 'uS' }; }, profiles: async () => ({}) } : null };
};

const cases = [];
const add = (name, journeys, fn, opts) => cases.push({ name, journeys, fn, opts: opts || {} });
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- 0002 每日重做 ----
add('daily-protected-recovery-and-handin', ['0002'], async c => {
  const { pg, txt, assertOk } = c;
  let t = await txt();
  assertOk('Today lists the protected unfinished paper', /unfinished hand-ins/i.test(t) && /1\/2 saved/.test(t));
  await pg.locator('[data-act="start-daily"]').first().click().catch(() => {});
  await pg.waitForTimeout(200); t = await txt();
  assertOk('start recovers the paper instead of replacing it', /Recovered: 1 answer already saved/.test(t) && await pg.evaluate(() => !!window.__data.papers.DP1 && Object.keys(window.__data.papers).length === 1));
  await pg.locator('button:has-text("Hand in")').first().click(); await pg.waitForTimeout(300);
  const again = pg.locator('button:has-text("Hand in anyway")'); if (await again.count()) { await again.first().click(); await pg.waitForTimeout(300); }
  assertOk('hand-in writes the marker and only the missing attempt', await pg.evaluate(() => !!(window.__data.papers.DP1.handedIn || {}).uS && window.__data.exercises.e1.attempts.length === 1 && window.__data.exercises.e2.attempts.filter(a => a.paperId === 'DP1').length === 1));
});

add('daily-marker-write-fails-then-recovers', ['0002'], async c => {
  const { pg, txt, click, assertOk } = c;
  await pg.locator('[data-act="start-daily"]').first().click(); await pg.waitForTimeout(200);
  await pg.evaluate(() => { window.__failWrite = { n: 99, code: 'permission-denied', calls: 0, match: 'papers/' }; });   // 只让卷子上的确认标记写失败，作答照常写
  await pg.locator('button:has-text("Hand in")').first().click(); await pg.waitForTimeout(300);
  const again = pg.locator('button:has-text("Hand in anyway")'); if (await again.count()) { await again.first().click(); await pg.waitForTimeout(300); }
  assertOk('attempt saved, marker missing, paper kept', await pg.evaluate(() => window.__data.exercises.e2.attempts.filter(a => a.paperId === 'DP1').length === 1 && !(window.__data.papers.DP1.handedIn || {}).uS && !!window.__data.papers.DP1));
  assertOk('the failure is reported on the page', await pg.evaluate(() => !!(S.run && S.run.err)) && !/handed in\b.*saved\b/i.test(await txt()));
  await click('exit-run'); await click('tab', { v: 'today' });
  assertOk('after leaving, Today still shows the unfinished paper with every answer saved', /unfinished hand-ins/i.test(await txt()) && /2\/2 saved/.test(await txt()));
  await pg.evaluate(() => { window.__failWrite = null; });
  await click('recover-daily', { id: 'DP1' });
  await pg.locator('button:has-text("Hand in")').first().click(); await pg.waitForTimeout(300);
  assertOk('retry writes only the marker', await pg.evaluate(() => !!(window.__data.papers.DP1.handedIn || {}).uS && window.__data.exercises.e2.attempts.filter(a => a.paperId === 'DP1').length === 1));
});

add('daily-paper-with-deleted-question', ['0002'], async c => {
  const { pg, txt, click, assertOk } = c;
  await pg.evaluate(async () => {
    const d = window.__data.papers.DP1.createdAt;
    window.__data.exercises.e1.attempts.push({ by: 'uS', date: d, mode: 'daily', paperId: 'DP9', response: 'z', result: 'right', judgedBy: 'auto', at: d + 'T09:00' });
    window.__data.papers.DP9 = { kind: 'daily', for: 'uS', owner: 'uS', subject: 'english', title: 't', createdAt: d, madeAt: d + 'T09:30', topics: [], count: 2, exerciseIds: ['e1', 'gone9'], handedIn: {} };
    await window.__db.doc('users/uS').update({});
  });
  await pg.waitForTimeout(300);
  await click('recover-daily', { id: 'DP9' });
  const t = await txt();
  assertOk('missing question is shown and the rest is recovered', /1 question on this paper was deleted/.test(t) && /Recovered: 1 answer already saved/.test(t));
}, { seed: s => { s.papers.DP1.handedIn = { uS: T + 'T08:30' }; } });

// ---- 卷页（0002/0003/0004/0009）：刚交与重新打开同一页 ----
const paperPageSeed = s => {
  const at = { by: 'uS', date: T, mode: 'daily', paperId: 'DP1', judgedBy: 'auto', at: T + 'T08:00' };
  s.exercises.e5 = ex('5', { format: 'open', answer: 'model answer', stem: 'Q5' });
  s.exercises.e2.attempts = [Object.assign({ response: 'q', result: 'wrong' }, at)];
  s.papers.DP1.exerciseIds = ['e1', 'e2', 'e5']; s.papers.DP1.handedIn = { uS: T + 'T08:30' };
  s.papers.CP1 = { owner: 'uS', madeBy: 'uS', subject: 'english', title: 'check', createdAt: T, madeAt: T + 'T06:00', topics: [], count: 2, exerciseIds: ['e2', 'e5'], handedIn: {} };
};
add('paper-page-reopened-outcome-and-pending', ['0002', '0004'], async c => {
  const { pg, txt, click, assertOk } = c;
  await click('open-paper', { id: 'DP1' }); await pg.waitForTimeout(200);
  let t = await txt();
  assertOk('re-opened daily paper shows score, coins, ladder and what is left to judge', /1\/3/.test(t) && /coin/.test(t) && !!(await pg.$('.run-ladder svg')) && /Handed in, not fully assessed: 1 to judge/.test(t));
  assertOk('a re-opened page does not lock the tabs', await pg.$$eval('nav.tabs button', bs => bs.every(b => !b.disabled)));
  await pg.locator('.cardpager .pg-n').nth(2).click(); await pg.waitForTimeout(100); t = await txt();
  assertOk('pending written answer reads Not judged yet, with no self-mark and no created attempt', /Not judged yet/.test(t) && !/No answer to this question/.test(t) && !(await pg.$('.selfmark')) && await pg.evaluate(() => window.__data.exercises.e5.attempts.length === 0));
  await click('exit-run'); await click('tab', { v: 'papers' }); await click('paper-tab', { v: 'daily' });
  assertOk('the same paper from the Papers Daily list opens the same page', /1\/3/.test(await txt()) && /1 to judge/.test(await txt()));
}, { seed: paperPageSeed });

add('paper-page-override-and-detail-back', ['0004', '0009'], async c => {
  const { pg, txt, click, assertOk } = c;
  await click('open-paper', { id: 'DP1' }); await pg.waitForTimeout(200);
  await pg.selectOption('select.ov-sel', 'wrong'); await pg.waitForTimeout(300);
  assertOk('override changes only that own attempt and the outcome follows', await pg.evaluate(() => window.__data.exercises.e1.attempts.length === 1 && window.__data.exercises.e1.attempts[0].result === 'wrong' && window.__data.exercises.e1.attempts[0].judgedBy === 'parent') && /0\/3/.test(await txt()));
  await pg.locator('.cardpager .pg-n').nth(1).click(); await pg.waitForTimeout(100);
  await click('goto-ex', { from: 'paper', id: 'e2' }); await pg.waitForTimeout(100);
  assertOk('Detail opens the exercise with a way back to the paper', /Back to the paper/.test(await txt()));
  await click('back-list'); await pg.waitForTimeout(100);
  assertOk('Back returns to the same card of the paper page', await pg.evaluate(() => !!S.run && S.run.idx === 1) && /Handed in/.test(await txt()));
}, { seed: paperPageSeed });

add('check-paper-hand-in-self-judge-and-review', ['0003', '0009'], async c => {
  const { pg, txt, click, assertOk } = c;
  await click('open-paper', { id: 'CP1' }); await pg.waitForTimeout(200);
  assertOk('taking locks the tabs', await pg.$$eval('nav.tabs button', bs => bs.every(b => b.disabled)));
  await pg.fill('.answer-in', 'q');
  await pg.locator('.progress button:has-text("Hand in")').click(); await pg.waitForTimeout(200);
  const again = pg.locator('.progress button:has-text("Hand in anyway")'); if (await again.count()) { await again.first().click(); await pg.waitForTimeout(300); }
  let t = await txt();
  assertOk('review shows a ladder and no coins for a check paper, with the written answer still to judge', !!(await pg.$('.run-ladder svg')) && !/coin/.test(t) && /Handed in, not fully assessed: 1 to judge/.test(t));
  assertOk('the objective attempt is saved as a paper attempt, the marker written', await pg.evaluate(() => window.__data.exercises.e2.attempts.some(a => a.paperId === 'CP1' && a.mode === 'paper') && !!window.__data.papers.CP1.handedIn.uS));
  assertOk('tabs stay locked while a written answer is pending in this session', await pg.$$eval('nav.tabs button', bs => bs.every(b => b.disabled)));
  await pg.locator('.cardpager .pg-n').nth(1).click(); await pg.waitForTimeout(100);
  await pg.locator('.selfmark button[data-r="right"]').click(); await pg.waitForTimeout(300);
  assertOk('self-judgment is saved once and the card offers Override', await pg.evaluate(() => window.__data.exercises.e5.attempts.filter(a => a.paperId === 'CP1').length === 1 && window.__data.exercises.e5.attempts[0].judgedBy === 'self') && !!(await pg.$('select.ov-sel')));
  assertOk('fully assessed and tabs free again', /Fully assessed/.test(await txt()) && await pg.$$eval('nav.tabs button', bs => bs.every(b => !b.disabled)));
}, { seed: paperPageSeed });

// ---- 0002/0004 保留期 ----
const retentionSeed = s => {
  const mk = (id, o) => { s.papers[id] = Object.assign({ kind: 'daily', for: 'uS', owner: 'uS', subject: 'english', title: id, topics: [], count: 1, exerciseIds: ['e2'], responses: null }, o); };
  s.papers.DP1.handedIn = { uS: T + 'T08:30' };
  mk('OLD31', { createdAt: ago(31), handedIn: { uS: ago(31) + 'T10:00' } });
  mk('EDGE30', { createdAt: ago(30), handedIn: { uS: ago(30) + 'T10:00' } });
  mk('NEW29', { createdAt: ago(29), handedIn: { uS: ago(29) + 'T10:00' } });
  mk('OLDOPEN', { createdAt: ago(40), handedIn: {} });
  mk('OLDOTHER', { createdAt: ago(40), for: 'uO', handedIn: { uO: ago(40) + 'T10:00' } });
  s.papers.OLDCHECK = { owner: 'uS', madeBy: 'uS', subject: 'english', title: 'check', createdAt: ago(40), topics: [], count: 1, exerciseIds: ['e2'], handedIn: { uS: ago(40) + 'T10:00' } };
  s.exercises.e2.attempts = [{ by: 'uS', date: ago(31), mode: 'daily', paperId: 'OLD31', response: 'y', result: 'right', judgedBy: 'auto', at: ago(31) + 'T10:00' }];
};
add('retention-prunes-only-old-handed-in-daily-papers', ['0002', '0004'], async c => {
  const { pg, assertOk } = c;
  await pg.waitForTimeout(400);
  const left = await pg.evaluate(() => Object.keys(window.__data.papers).sort());
  assertOk('only the daily paper handed in more than 30 days ago is deleted (' + left + ')', !left.includes('OLD31') && ['EDGE30', 'NEW29', 'OLDOPEN', 'OLDOTHER', 'OLDCHECK', 'DP1'].every(k => left.includes(k)));
  assertOk('attempts on the deleted paper survive', await pg.evaluate(() => window.__data.exercises.e2.attempts.some(a => a.paperId === 'OLD31')));
}, { seed: retentionSeed });
add('retention-failed-delete-is-ignored', ['0002', '0004'], async c => {
  const { pg, assertOk } = c;
  await pg.waitForTimeout(400);
  assertOk('a failed delete keeps the paper, the attempts and the page', await pg.evaluate(() => !!window.__data.papers.OLD31 && window.__data.exercises.e2.attempts.length === 1) && /Today/.test(await c.txt()));
}, { seed: retentionSeed, flags: { __failDelete: true } });

// ---- 0001/0007 题库与题组 ----
add('set-cleanup-uses-complete-membership', ['0007'], async c => {
  const { pg, click, assertOk } = c;
  await click('tab', { v: 'today' });
  await click('delete-ex', { id: 'e3' });
  assertOk('owned set is removed with its last member', await pg.evaluate(() => !window.__data.sets.SO));
  await click('delete-ex', { id: 'e4' });
  const legacy = await pg.evaluate(() => [!!window.__data.sets.SL, S.notice]);
  assertOk('legacy set is kept and the notice says why', legacy[0] && /legacy/.test(legacy[1]));
  await pg.evaluate(() => { window.__data.sets.S2 = { owner: 'uS', subject: 'english', title: 'S2', text: 't', images: [], wordBank: [], createdAt: '2026-01-01' }; window.__data.exercises.e5 = { owner: 'uS', subject: 'english', topic: 'x', format: 'short', stem: 'Q5', answer: 'a', accepted: ['a'], options: [], images: [], createdAt: '2026-01-01', setId: 'S2', setPos: 1, attempts: [] }; });
  await pg.evaluate(async () => { await window.__db.doc('users/uS').update({}); }); await pg.waitForTimeout(300);
  await pg.evaluate(() => { const orig = window.__db.collection; S.rawDb = Object.assign({}, window.__db, { collection: c => { const x = orig(c); const w = x.where; x.where = (...a) => { const y = w(...a); y.get = async () => { throw new Error('boom'); }; return y; }; return x; } }); });
  await click('delete-ex', { id: 'e5' });
  const failed = await pg.evaluate(() => [!!window.__data.sets.S2, S.notice]);
  assertOk('a failed membership read keeps the set and says so', failed[0] && /couldn't confirm/.test(failed[1]));
});
add('set-link-validation', ['0001', '0007'], async c => {
  const { pg, assertOk } = c;
  const link = await pg.evaluate(() => {
    window.__data.sets.SO2 = { owner: 'uOther', subject: 'english', title: 'o', text: 't', images: [], wordBank: [], createdAt: '2026-01-01' };
    window.__data.sets.SOK = { owner: 'uS', subject: 'english', title: 'k', text: 't', images: [], wordBank: [], createdAt: '2026-01-01' };
    S.sets = Object.keys(window.__data.sets).map(id => Object.assign({ id, images: [] }, window.__data.sets[id]));
    const d = ref => ({ setRef: ref, subject: 'english', editId: null, owner: null });
    return { legacy: draftLinkError(d('SL')), other: draftLinkError(d('SO2')), ok: draftLinkError(d('SOK')), unchangedLegacy: draftLinkError({ setRef: 'SL', origSetId: 'SL', subject: 'english', editId: 'e4', owner: 'uS' }) };
  });
  assertOk('legacy and other-owner links rejected; owned and unchanged legacy links allowed', !!link.legacy && !!link.other && link.ok === '' && link.unchangedLegacy === '');
});
add('material-edit-keeps-bank-and-blocks-legacy', ['0007'], async c => {
  const { pg, click, assertOk } = c;
  await pg.evaluate(async () => { window.__data.sets.SB = { owner: 'uS', subject: 'english', title: 'Old', text: 't', images: [], wordBank: ['a', 'b'], createdAt: '2026-01-01' }; window.__data.exercises.e6 = { owner: 'uS', subject: 'english', topic: 'x', format: 'pick', stem: 'Q6 [[b]]', answer: 'b', options: [], images: [], createdAt: '2026-01-01', setId: 'SB', setPos: 1, attempts: [] }; await window.__db.doc('users/uS').update({}); });
  await pg.waitForTimeout(300);
  await pg.evaluate(() => { S.rawDb = window.__db; const x = setById('SB'); const sd = newSetDraft(x); S.setEdit = Object.assign(sd, { key: 'edit', id: 'SB', base: { title: sd.title, text: sd.text, source: sd.source, images: [], wordBank: sd.wordBank } }); S.setEdit.title = 'New title'; window.__data.sets.SB.wordBank = ['a', 'b', 'c']; });
  await click('save-set');
  const sb = await pg.evaluate(() => window.__data.sets.SB);
  assertOk('a stale unrelated edit does not overwrite bank, owner or subject', sb.title === 'New title' && sb.owner === 'uS' && sb.subject === 'english' && sb.wordBank.join() === 'a,b,c' && sb.createdAt === '2026-01-01');
  await pg.evaluate(() => { const x = setById('SB'); const sd = newSetDraft(Object.assign({}, x, { wordBank: ['a', 'b', 'c'] })); S.setEdit = Object.assign(sd, { key: 'edit', id: 'SB', base: { title: sd.title, text: sd.text, source: sd.source, images: [], wordBank: sd.wordBank } }); S.setEdit.wordBank = 'a; c'; });
  await click('save-set');
  const rm = await pg.evaluate(() => [S.setEdit && S.setEdit.error, JSON.stringify(window.__data.sets.SB.wordBank)]);
  assertOk('removing a used word is rejected and names the question', /Q6/.test(rm[0]) && rm[1] === '["a","b","c"]');
  await pg.evaluate(() => { const x = setById('SL') || { id: 'SL', subject: 'english', title: 'l', text: 't', images: [] }; const sd = newSetDraft(x); S.setEdit = Object.assign(sd, { key: 'edit', id: 'SL', base: { title: '', text: sd.text, source: '', images: [], wordBank: '' } }); S.setEdit.title = 'x'; });
  await click('save-set');
  assertOk('editing a legacy set is blocked', /ownership/.test(await pg.evaluate(() => S.setEdit && S.setEdit.error)));
});
add('legacy-set-not-selectable-in-saved-material', ['0001', '0007'], async c => {
  const { pg, click, assertOk } = c;
  await pg.evaluate(async () => {
    window.__data.sets.SL2 = { subject: 'english', title: 'Legacy two', text: 'old', images: [], wordBank: [], createdAt: '2026-01-01' };
    window.__data.exercises.e8 = { owner: 'uS', subject: 'english', topic: 'x', format: 'short', stem: 'Q8', answer: 'a', accepted: ['a'], options: [], images: [], createdAt: '2026-01-01', setId: 'SL2', setPos: 1, attempts: [] };
    await window.__db.doc('users/uS').update({});
  });
  await pg.waitForTimeout(300);
  await click('tab', { v: 'record' }); await click('rec-mode', { v: 'saved' });
  const card = await pg.evaluate(() => { const m = [...document.querySelectorAll('button.mat')].find(x => /Legacy two/.test(x.innerText)); return m ? [m.disabled, /Owner not recorded/.test(m.innerText)] : null; });
  await click('mat-pick', { id: 'SL2' });
  assertOk('legacy material card is disabled with a reason and cannot be picked', Array.isArray(card) && card[0] && card[1] && await pg.evaluate(() => S.recSet === ''));
});

// ---- 0008 检验卷 ----
add('check-paper-stale-preview-and-marker', ['0008'], async c => {
  const { pg, click, assertOk } = c;
  await pg.evaluate(() => { S.paperForm = { subject: 'english', topics: [], count: 5 }; S.settings.defaultOwner = 'uS'; S.paperPreview = [{ id: 'e1' }, { id: 'e2' }]; S.paperPreviewOwner = 'uZ'; });
  await click('paper-create');
  const stale = await pg.evaluate(() => [S.paperPreview === null, S.paperMsg && S.paperMsg.kind]);
  assertOk('a preview from another owner is refused and needs re-preview', stale[0] === true && stale[1] === 'err');
  await pg.evaluate(() => { S.paperPreview = [{ id: 'e1' }, { id: 'e2' }]; S.paperPreviewOwner = 'uS'; });
  await click('paper-create');
  const made = await pg.evaluate(() => Object.values(window.__data.papers).filter(p => !p.kind).map(p => JSON.stringify(p.handedIn)));
  assertOk('a new check paper starts with an empty marker map', made.length === 1 && made[0] === '{}');
});

// ---- 0010 平台适配与故障呈现 ----
add('write-path-retries-only-unavailable', ['0010'], async c => {
  const { pg, assertOk } = c;
  const r = await pg.evaluate(async () => {
    window.__failWrite = { n: 1, code: 'unavailable', calls: 0 };
    const t0 = Date.now(); await S.db.doc('exercises/e2').update({ solution: 'Key idea: retried write.' });
    const ok1 = window.__data.exercises.e2.solution === 'Key idea: retried write.' && window.__failWrite.calls === 1 && Date.now() - t0 >= 450;
    window.__failWrite = { n: 3, code: 'quota_exceeded', calls: 0 }; let threw = null;
    try { await S.db.doc('exercises/e2').update({ solution: 'should not land' }); } catch (e) { threw = e.code; }
    return { ok1, threw, calls: window.__failWrite.calls, landed: window.__data.exercises.e2.solution === 'should not land' };
  });
  assertOk('unavailable is retried once and lands; other codes fail at once without landing', r.ok1 && r.threw === 'quota_exceeded' && r.calls === 1 && !r.landed);
});
add('read-failure-settings', ['0010'], async c => {
  const t = await c.txt(); c.assertOk('shows "Couldn\'t read your data" with the settings cause, not loading or empty',
    /Couldn't read your data/.test(t) && /your settings couldn't be read/.test(t) && !/Opening the exercise book/.test(t) && !/empty/.test(t.replace(/not an empty exercise book/, '')));
}, { flags: { __failRead: 'settings' } });
add('read-failure-exercises', ['0010'], async c => c.assertOk('shows "Couldn\'t read your data"', /Couldn't read your data/.test(await c.txt())), { flags: { __failRead: 'exercises' } });
add('identity-failure', ['0010'], async c => c.assertOk('shows "Data unavailable"', /Data unavailable/.test(await c.txt())), { flags: { __failIdentity: true } });
add('registration-failure', ['0010'], async c => { const t = await c.txt(); c.assertOk('warns but stays usable', /Couldn't register you/.test(t) && /Today/.test(t)); }, { flags: { __failUsers: true } });

(async () => {
  const sel = cases.filter(k => !wanted || k.journeys.some(j => wanted.includes(j)));
  if (args.includes('--list')) { cases.forEach(k => console.log(k.journeys.join(',').padEnd(10), k.name)); return; }
  if (!sel.length) { console.error('no case matches --journeys ' + wanted); process.exit(2); }
  const { chromium } = require('playwright');
  const b = await chromium.launch(); let failed = 0;
  for (const k of sel) {
    const seed = baseSeed(); if (k.opts.seed) k.opts.seed(seed);
    const pg = await b.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push('pageerror ' + e.message)); if (!k.opts.flags) pg.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
    if (k.opts.flags) await pg.addInitScript(f => Object.assign(window, f), k.opts.flags);
    await pg.addInitScript(initFake, [seed]);
    const fails = [];
    const c = { pg,
      txt: async () => (await pg.locator('#app').innerText()).replace(/\s+/g, ' '),
      click: async (act, data) => { await pg.evaluate(([act, data]) => { const x = document.createElement('button'); x.dataset.act = act; for (const kk in data) x.dataset[kk] = data[kk]; document.body.appendChild(x); x.click(); x.remove(); }, [act, data || {}]); await pg.waitForTimeout(250); },
      assertOk: (label, cond) => { if (!cond) fails.push(label); } };
    try { await pg.goto('file://' + target); await pg.waitForTimeout(500); await k.fn(c); } catch (e) { fails.push('threw: ' + e.message.split('\n')[0]); }
    if (errs.length) fails.push('page errors: ' + errs.join(' | '));
    await pg.close();
    if (fails.length) { failed++; console.log('FAIL', k.journeys.join(','), k.name); fails.forEach(f => console.log('   - ' + f)); } else console.log('ok  ', k.journeys.join(','), k.name);
  }
  await b.close();
  console.log(failed ? `${failed} of ${sel.length} cases failed` : `fake-platform smoke passed (${sel.length} cases${wanted ? ', journeys ' + wanted.join(',') : ', all journeys'})`);
  process.exit(failed ? 1 : 0);
})();
