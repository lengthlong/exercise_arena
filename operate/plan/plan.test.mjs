// node operate/plan/plan.test.mjs — exits 0 when every case passes (model/operate/plan/SPEC.md)
import assert from 'node:assert/strict';
import { buildPlan, replan, rankPool, planWeeks, isGep, paperId, markId, checkReadback, monday, migrate, checkMigration } from './plan.mjs';

// GEP centres and ids
assert.ok(isGep('Nanyang Primary') && isGep('Catholic High (Primary)') && isGep("Raffles Girls' Primary") && isGep('St. Hilda’s Primary') && isGep('Anglo-Chinese School (Primary)'));
assert.ok(!isGep('ACS Junior') && !isGep('Anglo-Chinese School (Junior)') && !isGep('Red Swastika School') && !isGep('Methodist Girls'));
assert.equal(paperId('psle-2027', { subject: 'math', year: 2023, kind: 'prelim', school: 'Nanyang Primary' }), 'psle-2027-math-2023-prelim-nanyang');
assert.equal(paperId('psle-2027', { subject: 'math', year: 2023, kind: 'prelim', school: 'Nanyang Primary', short: 'NY' }), 'psle-2027-math-2023-prelim-ny');
assert.equal(markId('psle-2027-math-2023-prelim-ny', 'uS'), 'psle-2027-math-2023-prelim-ny-uS');

// weeks: Monday-to-Sunday from the start week to the last full week before the PSLE week
assert.equal(monday('2026-11-25'), '2026-11-23');
const wk = planWeeks('2026-11-25', '2027-09-23');
assert.deepEqual([wk.length, wk[0], wk.at(-1)], [43, '2026-11-23', '2027-09-13']);

// ranking: prelim first, newer year, GEP within a year, then name
const P = (subject, year, school, kind = 'prelim') => ({ subject, year, school, kind, url: `https://sgexam.com/${subject}/${year}/${school}` });
const cat = [P('math', 2023, 'Nanyang Primary'), P('math', 2024, 'Red Swastika School'), P('math', 2024, 'Henry Park Primary'), P('math', 2025, 'Ai Tong School'),
  P('math', 2026, 'Tao Nan School', 'wa'), P('math', 2024, 'Henry Park Primary'), P('english', 2025, 'Rosyth School'), P('science', 2025, 'Nan Hua Primary')];
const pool = rankPool(cat);
assert.deepEqual(pool.math.map((p) => `${p.year} ${p.school}`), ['2025 Ai Tong School', '2024 Henry Park Primary', '2024 Red Swastika School', '2023 Nanyang Primary', '2026 Tao Nan School']);   // duplicate removed, WA last

// build: 1 per subject per week, oldest first, reserve has week null, pool = 2 × weeks
const many = [];
for (const s of ['math', 'english', 'science']) for (let y = 2018; y <= 2026; y++) for (const sc of ['Nanyang Primary', 'Rosyth School', 'Red Swastika School', 'Ai Tong School']) many.push(P(s, y, sc));
const b = buildPlan(many, { plan: 'psle-2027', start: '2026-11-25', psle: '2027-01-20' });   // weeks 23 Nov … 11 Jan = 8
assert.equal(b.weeks.length, 8);
const bm = b.docs.filter((d) => d.doc.subject === 'math');
assert.equal(bm.length, 16);
assert.equal(bm.filter((d) => d.doc.week).length, 8);
const sched = bm.filter((d) => d.doc.week).sort((x, y) => x.doc.week.localeCompare(y.doc.week));
assert.deepEqual(sched.map((d) => d.doc.year), [2025, 2025, 2025, 2025, 2026, 2026, 2026, 2026]);   // top 8 = 2026 ×4, 2025 ×4; oldest first
assert.equal(sched[0].doc.school, 'Nanyang Primary');   // within 2025 the GEP school (best rank) comes first
assert.ok(bm.every((d) => d.doc.plan === 'psle-2027' && !('for' in d.doc) && !('doneOn' in d.doc)));   // shared papers carry no one's mark
assert.deepEqual(b.shortfall, {});
assert.deepEqual(buildPlan(many.slice(0, 10), { plan: 'psle-2027', start: '2026-11-25', psle: '2027-01-20' }).shortfall.math, 6);

// replan to 2 a week from 7 Dec: past weeks keep their papers whoever did them; the rest is spread again; only week/rank change
const papers = b.docs.map((d) => ({ id: d.id, ...d.doc }));
const first = papers.filter((p) => p.subject === 'math' && p.week === '2026-11-23')[0];
const behind = papers.filter((p) => p.subject === 'math' && p.week === '2026-11-30')[0];   // earlier week, not done by someone
const later = papers.filter((p) => p.subject === 'math' && p.week === '2026-12-14')[0];
const cur = { planId: 'psle-2027', plan: b.plan, papers };
const r = replan(many, cur, { from: '2026-12-07', perWeek: 2 });
assert.ok(!r.updates.some((u) => u.id === first.id || u.id === behind.id));
assert.ok(r.updates.every((u) => Object.keys(u.patch).sort().join() === 'rank,week'));
assert.ok(r.sets.every((d) => d.doc.plan === 'psle-2027' && !('doneOn' in d.doc)));
const after = new Map(papers.map((p) => [p.id, { ...p }])); for (const u of r.updates) Object.assign(after.get(u.id), u.patch); for (const s of r.sets) after.set(s.id, s.doc);
const am = [...after.values()].filter((p) => p.subject === 'math');
for (const w of r.weeks) assert.equal(am.filter((p) => p.week === w).length, 2, w);
assert.equal(after.get(first.id).week, '2026-11-23');
assert.equal(after.get(behind.id).week, '2026-11-30');
assert.ok(after.get(later.id).week === null || after.get(later.id).week >= '2026-12-07');
const r2 = replan(many, cur, { from: '2026-12-07', psle: '2027-02-20' });
assert.equal(r2.plan.psleDate, '2027-02-20');

// read-back check: perWeek per subject per planned week from the current week; past weeks and Paper marks unchanged
const marks = [{ id: markId(first.id, 'uS'), paper: first.id, by: 'uS', doneOn: '2026-11-24', score: 70, total: 100 }];
const rb = { plan: { perWeek: 1 }, papers, marks };
assert.deepEqual(checkReadback(rb, { before: { papers, marks } }).problems, []);
assert.ok(checkReadback({ ...rb, marks: [{ ...marks[0], score: 60 }] }, { before: { papers, marks } }).problems.some((x) => x.includes('Paper mark changed')));
const moved = papers.map((p) => (p.id === behind.id ? { ...p, week: '2026-12-07' } : p));
assert.ok(checkReadback({ ...rb, papers: moved }, { before: { papers, marks }, from: '2026-12-07' }).problems.some((x) => x.includes('past week changed')));
assert.ok(checkReadback({ plan: { perWeek: 2 }, papers }).problems.length > 0);

// migrate a per-user plan: same weeks and ranks, legacy done marks become Paper marks; second pass copies only missing ones
const legacy = { user: 'uS', plan: { psleDate: '2027-01-20', startWeek: '2026-11-23', perWeek: 1, updatedAt: '2026-11-25T09:00' },
  papers: b.docs.slice(0, 3).map((d, i) => ({ ...d.doc, id: 'uS' + d.id.slice('psle-2027'.length), plan: undefined, for: 'uS', doneOn: i === 0 ? '2026-11-24' : null, score: i === 0 ? 70 : null, total: i === 0 ? 100 : null })) };
legacy.papers.forEach((p) => delete p.plan);
const m = migrate(legacy, { plan: 'psle-2027' });
assert.deepEqual(m.papers.map((p) => p.id), b.docs.slice(0, 3).map((d) => d.id));
assert.ok(m.papers.every((p, i) => p.doc.week === (legacy.papers[i].week || null) && p.doc.rank === legacy.papers[i].rank && p.doc.plan === 'psle-2027' && !('for' in p.doc)));
assert.deepEqual(m.marks, [{ id: markId(b.docs[0].id, 'uS'), doc: { paper: b.docs[0].id, by: 'uS', doneOn: '2026-11-24', score: 70, total: 100 } }]);
assert.deepEqual(m.deletes, legacy.papers.map((p) => p.id));
assert.equal(migrate(legacy, { plan: 'psle-2027', existingMarks: [{ id: m.marks[0].id, ...m.marks[0].doc }] }).marks.length, 0);
legacy.papers[1].doneOn = '2026-12-01';   // marked on the old page between the copy and the new release
assert.equal(migrate(legacy, { plan: 'psle-2027', existingMarks: [{ id: m.marks[0].id, ...m.marks[0].doc }] }).marks.length, 1);
const mrb = { plan: m.plan, papers: m.papers.map((p) => ({ id: p.id, ...p.doc })), marks: m.marks.map((x) => ({ id: x.id, ...x.doc })) };
assert.ok(checkMigration(mrb, legacy, { plan: 'psle-2027' }).problems.some((x) => x.includes('Paper mark')));
legacy.papers[1].doneOn = null;
assert.deepEqual(checkMigration(mrb, legacy, { plan: 'psle-2027' }).problems, []);

console.log('plan tool tests passed');
