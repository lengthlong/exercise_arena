// 假平台冒烟入口（替代品，不是平台验收）：用内存里的假 db/user 在无头 Chromium 里打开 impl/arena.html，
// 走讨论 0039 落实的处理器：受保护每日卷恢复、新卷交卷确认初始化、题组清理、题组链接校验、检验卷预览校验、材料编辑。
// 另覆盖验收 20261120-first-loop-after-0039 #8（旧题组补录入口）与 #11（卷上已删题的明示）。
// 用法：node verify/fake-platform-smoke.js impl/arena.html（需要可 require 的 playwright 与 Chromium）。
// 它只证明页面代码在假平台约定下的行为；真实 db 查询、身份、AI/照片、并发与发布需要授权的测试 Artifact（见 verify/README.md）。
const assert = require('assert'); const path = require('path');
const { chromium } = require('playwright');
const target = path.resolve(process.argv[2] || 'impl/arena.html');
const today = new Date(); const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const T = iso(today), Y = iso(new Date(today - 86400000 * 3));
const seed = {
  users: { uS: { joinedAt: Y } },
  settings: {},
  sets: { SO: { owner: 'uS', subject: 'english', title: 'Owned set', text: 'passage', images: [], wordBank: ['a', 'b'], createdAt: Y }, SL: { subject: 'english', title: 'Legacy set', text: 'old passage', images: [], wordBank: [], createdAt: Y } },
  exercises: {
    e1: { owner: 'uS', subject: 'english', topic: 'x', format: 'short', stem: 'Q1', answer: 'z', accepted: ['z'], options: [], images: [], createdAt: Y, attempts: [{ by: 'uS', date: T, mode: 'daily', paperId: 'DP1', response: 'z', result: 'right', judgedBy: 'auto', at: T + 'T08:00' }] },
    e2: { owner: 'uS', subject: 'english', topic: 'x', format: 'short', stem: 'Q2', answer: 'y', accepted: ['y'], options: [], images: [], createdAt: Y, attempts: [] },
    e3: { owner: 'uS', subject: 'english', topic: 'x', format: 'pick', stem: 'Q3 [[a]]', answer: 'a', options: [], images: [], createdAt: Y, setId: 'SO', setPos: 1, attempts: [] },
    e4: { owner: 'uS', subject: 'english', topic: 'x', format: 'short', stem: 'Q4', answer: 'w', accepted: ['w'], options: [], images: [], createdAt: Y, setId: 'SL', setPos: 1, attempts: [] },
  },
  papers: { DP1: { kind: 'daily', for: 'uS', owner: 'uS', subject: 'english', title: 'English redo', createdAt: T, madeAt: T + 'T07:30', topics: [], count: 2, exerciseIds: ['e1', 'e2'], handedIn: {}, responses: { e2: 'y' } } },
  matches: {},
};
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push('pageerror ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  await pg.addInitScript(([seed]) => {
    const data = JSON.parse(JSON.stringify(seed)); const subs = []; let n = 0;
    const notify = () => subs.forEach(f => f());
    const snapDoc = (c, id) => ({ id, data: () => JSON.parse(JSON.stringify(data[c][id])) });
    const q = (c, f, v) => ({
      onSnapshot(cb) { const fire = () => cb({ docs: Object.keys(data[c] || {}).filter(id => !f || data[c][id][f] === v).map(id => snapDoc(c, id)) }); subs.push(fire); setTimeout(fire, 0); return () => {}; },
      async get() { return { docs: Object.keys(data[c] || {}).filter(id => !f || data[c][id][f] === v).map(id => snapDoc(c, id)) }; },
      where(ff, op, vv) { return q(c, ff, vv); },
    });
    const doc = (c, id) => ({ id,
      async get() { const d = (data[c] || {})[id]; return { exists: !!d, data: () => JSON.parse(JSON.stringify(d || {})) }; },
      async set(v) { (data[c] = data[c] || {})[id] = JSON.parse(JSON.stringify(v)); notify(); },
      async update(v) { Object.assign(data[c][id], JSON.parse(JSON.stringify(v))); notify(); },
      async delete() { delete data[c][id]; notify(); },
      onSnapshot(cb) { const fire = () => { const d = (data[c] || {})[id]; cb({ exists: !!d, data: () => JSON.parse(JSON.stringify(d || {})) }); }; subs.push(fire); setTimeout(fire, 0); return () => {}; } });
    const db = { collection: c => Object.assign(q(c), { doc: id => doc(c, id || 'auto' + (++n)) }), doc: p => { const [c, id] = p.split('/'); return doc(c, id); } };
    window.__data = data; window.__failGet = false;
    const realGet = db.collection('exercises').get;
    window.claude = { use: async name => name === 'db' ? db : name === 'user' ? { me: async () => ({ id: 'uS' }), profiles: async () => ({}) } : null };
    window.__db = db;
  }, [seed]);
  await pg.goto('file://' + target); await pg.waitForTimeout(500);
  const out = {};
  const txt = async () => (await pg.locator('#app').innerText());
  let t = await txt();
  out.todayHasRecovery = /unfinished hand-ins/i.test(t) && /1\/2 saved/.test(t);
  // start-daily for english must recover, not replace
  await pg.locator('[data-act="start-daily"]').first().click().catch(() => {});
  await pg.waitForTimeout(200); t = await txt();
  out.recoveredBanner = /Recovered: 1 answer already saved/.test(t);
  out.paperStillThere = await pg.evaluate(() => !!window.__data.papers.DP1);
  out.paperCountAfterStart = await pg.evaluate(() => Object.keys(window.__data.papers).length);
  // hand in (answer for e2 is carried from stored responses); marker should be written, attempts for e2 added
  await pg.locator('button:has-text("Hand in")').first().click(); await pg.waitForTimeout(300);
  let again = pg.locator('button:has-text("Hand in anyway")'); if (await again.count()) { await again.first().click(); await pg.waitForTimeout(300); }
  out.markerWritten = await pg.evaluate(() => !!(window.__data.papers.DP1.handedIn || {}).uS);
  out.e1AttemptsUnchanged = await pg.evaluate(() => window.__data.exercises.e1.attempts.length === 1);
  out.e2AttemptSaved = await pg.evaluate(() => window.__data.exercises.e2.attempts.filter(a => a.paperId === 'DP1').length === 1);
  const click = async (act, data) => { await pg.evaluate(([act, data]) => { const b = document.createElement('button'); b.dataset.act = act; for (const k in data) b.dataset[k] = data[k]; document.body.appendChild(b); b.click(); b.remove(); }, [act, data || {}]); await pg.waitForTimeout(250); };
  await click('exit-run'); await click('tab', { v: 'today' });
  // owned set SO: delete last member through the real handler -> set removed (fresh membership read succeeds)
  await click('delete-ex', { id: 'e3' });
  out.ownedSetDeleted = await pg.evaluate(() => !window.__data.sets.SO);
  // legacy set SL: delete last member -> exercise gone, set kept, notice shown
  await click('delete-ex', { id: 'e4' });
  out.legacySetKept = await pg.evaluate(() => !!window.__data.sets.SL);
  out.noticeLegacy = await pg.evaluate(() => S.notice);
  // membership read failure on an owned set -> kept + notice
  await pg.evaluate(async () => { window.__data.sets.S2 = { owner: 'uS', subject: 'english', title: 'S2', text: 't', images: [], wordBank: [], createdAt: '2026-01-01' }; window.__data.exercises.e5 = { owner: 'uS', subject: 'english', topic: 'x', format: 'short', stem: 'Q5', answer: 'a', accepted: ['a'], options: [], images: [], createdAt: '2026-01-01', setId: 'S2', setPos: 1, attempts: [] }; });
  await pg.evaluate(async () => { await window.__db.doc('users/uS').update({}); }); await pg.waitForTimeout(300);
  await pg.evaluate(() => { const orig = window.__db.collection; S.db = Object.assign({}, S.db, { collection: c => { const x = orig(c); const w = x.where; x.where = (...a) => { const y = w(...a); y.get = async () => { throw new Error('boom'); }; return y; }; return x; } }); });
  await click('delete-ex', { id: 'e5' });
  out.failedReadKeptSet = await pg.evaluate(() => !!window.__data.sets.S2);
  out.noticeMembership = await pg.evaluate(() => S.notice);
  // draft link validation: legacy set link rejected; owned set from another owner rejected; unchanged legacy link on edit allowed
  const link = await pg.evaluate(() => {
    window.__data.sets.SO2 = { owner: 'uOther', subject: 'english', title: 'o', text: 't', images: [], wordBank: [], createdAt: '2026-01-01' };
    window.__data.sets.SOK = { owner: 'uS', subject: 'english', title: 'k', text: 't', images: [], wordBank: [], createdAt: '2026-01-01' };
    S.sets = Object.keys(window.__data.sets).map(id => Object.assign({ id, images: [] }, window.__data.sets[id]));
    const d = ref => ({ setRef: ref, subject: 'english', editId: null, owner: null });
    return { legacy: draftLinkError(d('SL')), other: draftLinkError(d('SO2')), ok: draftLinkError(d('SOK')), unchangedLegacy: draftLinkError({ setRef: 'SL', origSetId: 'SL', subject: 'english', editId: 'e4', owner: 'uS' }), newSetStale: draftLinkError({ setRef: 'new:9', subject: 'english', editId: null }) };
  });
  out.link = { legacy: !!link.legacy, other: !!link.other, ok: link.ok === '', unchangedLegacy: link.unchangedLegacy === '' };
  // stale check preview: preview under owner uS, then owner differs -> create refused with re-preview
  await pg.evaluate(() => { S.paperForm = { subject: 'english', topics: [], count: 5 }; S.settings.defaultOwner = 'uS'; S.paperPreview = [{ id: 'e1' }, { id: 'e2' }]; S.paperPreviewOwner = 'uZ'; });
  await click('paper-create');
  out.stalePreviewRefused = await pg.evaluate(() => [S.paperPreview === null, S.paperMsg && S.paperMsg.kind]);
  await pg.evaluate(() => { S.paperPreview = [{ id: 'e1' }, { id: 'e2' }]; S.paperPreviewOwner = 'uS'; });
  await click('paper-create');
  out.freshPaperHasMarker = await pg.evaluate(() => Object.values(window.__data.papers).filter(p => !p.kind).map(p => JSON.stringify(p.handedIn)));
  // material edit: stale form edits only the title while the stored bank changed elsewhere -> bank/owner/subject untouched
  await pg.evaluate(async () => { window.__data.sets.SB = { owner: 'uS', subject: 'english', title: 'Old', text: 't', images: [], wordBank: ['a', 'b'], createdAt: '2026-01-01' }; window.__data.exercises.e6 = { owner: 'uS', subject: 'english', topic: 'x', format: 'pick', stem: 'Q6 [[b]]', answer: 'b', options: [], images: [], createdAt: '2026-01-01', setId: 'SB', setPos: 1, attempts: [] }; await window.__db.doc('users/uS').update({}); });
  await pg.waitForTimeout(300);
  await pg.evaluate(() => { S.db = window.__db; const x = setById('SB'); const sd = newSetDraft(x); S.setEdit = Object.assign(sd, { key: 'edit', id: 'SB', base: { title: sd.title, text: sd.text, source: sd.source, images: [], wordBank: sd.wordBank } }); S.setEdit.title = 'New title'; window.__data.sets.SB.wordBank = ['a', 'b', 'c']; });
  await click('save-set');
  out.staleFormKeepsBank = await pg.evaluate(() => JSON.stringify(window.__data.sets.SB));
  // destructive removal that would orphan e6's answer 'b' -> rejected with the question named
  await pg.evaluate(() => { const x = setById('SB'); const sd = newSetDraft(Object.assign({}, x, { wordBank: ['a', 'b', 'c'] })); S.setEdit = Object.assign(sd, { key: 'edit', id: 'SB', base: { title: sd.title, text: sd.text, source: sd.source, images: [], wordBank: sd.wordBank } }); S.setEdit.wordBank = 'a; c'; });
  await click('save-set');
  out.removeUsedWordRejected = await pg.evaluate(() => [S.setEdit && S.setEdit.error, JSON.stringify(window.__data.sets.SB.wordBank)]);
  // legacy set edit blocked
  await pg.evaluate(() => { const x = setById('SL') || { id: 'SL', subject: 'english', title: 'l', text: 't', images: [] }; const sd = newSetDraft(x); S.setEdit = Object.assign(sd, { key: 'edit', id: 'SL', base: { title: '', text: sd.text, source: '', images: [], wordBank: '' } }); S.setEdit.title = 'x'; });
  await click('save-set');
  out.legacyEditBlocked = await pg.evaluate(() => S.setEdit && S.setEdit.error);
  // 验收 #11：受保护的卷里有题已删时，作答页明示缺失，并仍可恢复其余的题
  await pg.evaluate(async () => {
    const t = Object.keys(window.__data.papers).length; const today = window.__data.papers.DP1.createdAt;
    window.__data.exercises.e1.attempts.push({ by: 'uS', date: today, mode: 'daily', paperId: 'DP9', response: 'z', result: 'right', judgedBy: 'auto', at: today + 'T09:00' });
    window.__data.papers.DP9 = { kind: 'daily', for: 'uS', owner: 'uS', subject: 'english', title: 't', createdAt: today, madeAt: today + 'T09:30', topics: [], count: 2, exerciseIds: ['e1', 'gone9'], handedIn: {} };
    await window.__db.doc('users/uS').update({});
  });
  await pg.waitForTimeout(300);
  await click('exit-run'); await click('recover-daily', { id: 'DP9' });
  out.missingShown = /1 question on this paper was deleted/.test(await txt()) && /Recovered: 1 answer already saved/.test(await txt());
  await click('exit-run');
  // 验收 #8：旧题组（无 owner）在「From saved material」里不可选，并说明原因；点它不会选中
  await pg.evaluate(async () => {
    window.__data.sets.SL2 = { subject: 'english', title: 'Legacy two', text: 'old', images: [], wordBank: [], createdAt: '2026-01-01' };
    window.__data.exercises.e8 = { owner: 'uS', subject: 'english', topic: 'x', format: 'short', stem: 'Q8', answer: 'a', accepted: ['a'], options: [], images: [], createdAt: '2026-01-01', setId: 'SL2', setPos: 1, attempts: [] };
    await window.__db.doc('users/uS').update({});
  });
  await pg.waitForTimeout(300);
  await click('tab', { v: 'record' }); await click('rec-mode', { v: 'saved' });
  out.legacyCardBlocked = await pg.evaluate(() => { const m = [...document.querySelectorAll('button.mat')].find(x => /Legacy two/.test(x.innerText)); return m ? [m.disabled, /Owner not recorded/.test(m.innerText)] : null; });
  await click('mat-pick', { id: 'SL2' });
  out.legacyNotSelected = await pg.evaluate(() => S.recSet === '');
  await b.close();
  const ok = (k, cond) => { assert.ok(cond, 'FAILED: ' + k + ' = ' + JSON.stringify(out[k])); };
  ok('todayHasRecovery', out.todayHasRecovery); ok('recoveredBanner', out.recoveredBanner); ok('paperStillThere', out.paperStillThere);
  ok('paperCountAfterStart', out.paperCountAfterStart === 1); ok('markerWritten', out.markerWritten); ok('e1AttemptsUnchanged', out.e1AttemptsUnchanged); ok('e2AttemptSaved', out.e2AttemptSaved);
  ok('ownedSetDeleted', out.ownedSetDeleted); ok('legacySetKept', out.legacySetKept); ok('noticeLegacy', /legacy/.test(out.noticeLegacy));
  ok('failedReadKeptSet', out.failedReadKeptSet); ok('noticeMembership', /couldn't confirm/.test(out.noticeMembership));
  ok('link', out.link.legacy && out.link.other && out.link.ok && out.link.unchangedLegacy);
  ok('stalePreviewRefused', out.stalePreviewRefused[0] === true && out.stalePreviewRefused[1] === 'err');
  ok('freshPaperHasMarker', out.freshPaperHasMarker.length === 1 && out.freshPaperHasMarker[0] === '{}');
  const sb = JSON.parse(out.staleFormKeepsBank); ok('staleFormKeepsBank', sb.title === 'New title' && sb.owner === 'uS' && sb.subject === 'english' && sb.wordBank.join() === 'a,b,c' && sb.createdAt === '2026-01-01');
  ok('removeUsedWordRejected', /Q6/.test(out.removeUsedWordRejected[0]) && out.removeUsedWordRejected[1] === '["a","b","c"]');
  ok('legacyEditBlocked', /ownership/.test(out.legacyEditBlocked));
  ok('missingShown', out.missingShown); ok('legacyCardBlocked', Array.isArray(out.legacyCardBlocked) && out.legacyCardBlocked[0] && out.legacyCardBlocked[1]); ok('legacyNotSelected', out.legacyNotSelected);
  assert.deepStrictEqual(errs, [], 'page errors');
  console.log('fake-platform smoke passed');
})();
