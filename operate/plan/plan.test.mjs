// node operate/plan/plan.test.mjs — exits 0 when every case passes (model/operate/plan/SPEC.md)
import assert from 'node:assert/strict';
import { buildPlan, replan, rankPool, planWeeks, isGep, paperId, checkReadback, monday } from './plan.mjs';

// GEP centres and ids
assert.ok(isGep('Nanyang Primary') && isGep('Catholic High (Primary)') && isGep("Raffles Girls' Primary") && isGep('St. Hilda’s Primary') && isGep('Anglo-Chinese School (Primary)'));
assert.ok(!isGep('ACS Junior') && !isGep('Anglo-Chinese School (Junior)') && !isGep('Red Swastika School') && !isGep('Methodist Girls'));
assert.equal(paperId('uS', { subject: 'math', year: 2023, kind: 'prelim', school: 'Nanyang Primary' }), 'uS-math-2023-prelim-nanyang');
assert.equal(paperId('uS', { subject: 'math', year: 2023, kind: 'prelim', school: 'Nanyang Primary', short: 'NY' }), 'uS-math-2023-prelim-ny');

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
const b = buildPlan(many, { user: 'uS', start: '2026-11-25', psle: '2027-01-20' });   // weeks 23 Nov … 11 Jan = 8
assert.equal(b.weeks.length, 8);
const bm = b.docs.filter((d) => d.doc.subject === 'math');
assert.equal(bm.length, 16);
assert.equal(bm.filter((d) => d.doc.week).length, 8);
const sched = bm.filter((d) => d.doc.week).sort((x, y) => x.doc.week.localeCompare(y.doc.week));
assert.deepEqual(sched.map((d) => d.doc.year), [2025, 2025, 2025, 2025, 2026, 2026, 2026, 2026]);   // top 8 = 2026 ×4, 2025 ×4; oldest first
assert.equal(sched[0].doc.school, 'Nanyang Primary');   // within 2025 the GEP school (best rank) comes first
assert.ok(bm.every((d) => d.doc.doneOn === null && d.doc.for === 'uS'));
assert.deepEqual(b.shortfall, {});
assert.deepEqual(buildPlan(many.slice(0, 10), { user: 'uS', start: '2026-11-25', psle: '2027-01-20' }).shortfall.math, 6);

// replan to 2 a week from 7 Dec: done papers untouched, the rest spread again, existing papers only get week/rank
const papers = b.docs.map((d) => ({ id: d.id, ...d.doc }));
const first = papers.filter((p) => p.subject === 'math' && p.week === '2026-11-23')[0];
first.doneOn = '2026-11-24'; first.score = 70; first.total = 100;
const behind = papers.filter((p) => p.subject === 'math' && p.week === '2026-11-30')[0];   // not done, earlier week
const r = replan(many, { user: 'uS', plan: b.plan, papers }, { from: '2026-12-07', perWeek: 2 });
assert.ok(!r.updates.some((u) => u.id === first.id));
assert.ok(r.updates.every((u) => Object.keys(u.patch).sort().join() === 'rank,week'));
const after = new Map(papers.map((p) => [p.id, { ...p }])); for (const u of r.updates) Object.assign(after.get(u.id), u.patch); for (const s of r.sets) after.set(s.id, s.doc);
const am = [...after.values()].filter((p) => p.subject === 'math');
for (const w of r.weeks) assert.equal(am.filter((p) => p.week === w).length, 2, w);
assert.ok(after.get(behind.id).week === null || after.get(behind.id).week >= '2026-12-07');
assert.equal(after.get(first.id).week, '2026-11-23');
// replan with a later PSLE date and the same amount: no paper is deleted, new ones may be added
const r2 = replan(many, { user: 'uS', plan: b.plan, papers }, { from: '2026-12-07', psle: '2027-02-20' });
assert.equal(r2.plan.psleDate, '2027-02-20');

// read-back check: perWeek per subject per planned week; done marks unchanged
const rb = { plan: { perWeek: 1 }, papers };
assert.deepEqual(checkReadback(rb, { before: { papers } }).problems, []);
const broken = papers.map((p) => (p.id === first.id ? { ...p, doneOn: null } : p));
assert.ok(checkReadback({ plan: { perWeek: 1 }, papers: broken }, { before: { papers } }).problems.some((x) => x.includes('done mark changed')));
assert.ok(checkReadback({ plan: { perWeek: 2 }, papers }).problems.length > 0);

console.log('plan tool tests passed');
