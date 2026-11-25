#!/usr/bin/env node
// PSLE paper plan tool (model/operate/plan/SPEC.md, journey 0016). Local files only:
// the agent reads sgexam.com and production, and applies the batches with ArtifactData after the user confirms.
//
// One Paper plan is shared by every user (plans/<plan id>); each user's progress is in paperMarks (DATA.md).
//
//   node operate/plan/plan.mjs build   <catalog.json> <work> --plan <id> --start <YYYY-MM-DD> --psle <YYYY-MM-DD> [--per-week 1] [--pool-per-week 2]
//   node operate/plan/plan.mjs replan  <catalog.json> <work> --plan <id> --current <dir> --from <YYYY-MM-DD> [--psle <date>] [--per-week n] [--pool-per-week 2]
//   node operate/plan/plan.mjs check   <work> <readback-dir> --plan <id> [--before <dir>]
//   node operate/plan/plan.mjs migrate <work> --current <dir> --user <legacy user id> --plan <id> [--marks-only]
//   node operate/plan/plan.mjs check-migration <readback-dir> --user <legacy user id> --plan <id>
//
// catalog.json: [{ subject: "math"|"english"|"science", school, short?, year, kind: "prelim"|"sa2"|"sa1"|"wa"|"other", url }]
// <dir> for --current, readback and --before: a folder holding plans/<id>.json, schoolPapers/<id>.json and paperMarks/<id>.json
// (the layout of a backup snapshot's db/ folder).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SUBJECTS = ['math', 'english', 'science'];
// Catalogue school names should be sgexam's full names (for example "Anglo-Chinese School (Primary)", not "ACSP"); ACS Junior is not a GEP centre.
export const GEP_CENTRES = ['anglo-chinese school (primary)', 'acs primary', 'catholic high', 'henry park', 'nan hua', 'nanyang', 'raffles girls', 'rosyth', 'st hilda', 'tao nan'];
const KIND_ORDER = { prelim: 0 };

const norm = (s) => String(s || '').toLowerCase().replace(/[’'`.]/g, '').replace(/\s+/g, ' ').trim();
export const isGep = (school) => { const n = norm(school).replace(/^saint /, 'st '); return GEP_CENTRES.some((g) => n.startsWith(g)); };
export const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function shortName(school) {
  const base = String(school || '').replace(/\s*\((primary)\)\s*$/i, '').replace(/\s+(primary school|primary|school)\s*$/i, '');
  const w = base.split(/[\s-]+/).filter(Boolean);
  return w.length === 1 ? w[0].slice(0, 8) : w.map((x) => x[0]).join('').toUpperCase().slice(0, 4) || '?';   // one word reads better whole ("Nanyang"); the agent may supply `short`
}
export const paperId = (planId, p) => `${planId}-${p.subject}-${p.year}-${p.kind}-${slug(p.short || shortName(p.school))}`;
export const markId = (paper, user) => `${paper}-${user}`;
const paperDoc = (planId, p, week, rank) => ({ plan: planId, subject: p.subject, school: p.school, short: p.short, year: p.year, kind: p.kind, url: p.url, week, rank });

export function addDays(iso, n) { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
export function monday(iso) { const dow = new Date(iso + 'T00:00:00Z').getUTCDay(); return addDays(iso, -((dow + 6) % 7)); }
export function planWeeks(start, psle) {
  // Monday-to-Sunday weeks from the start week through the last full week before the PSLE week
  const out = [], end = monday(psle);
  for (let w = monday(start); w < end; w = addDays(w, 7)) out.push(w);
  return out;
}

export function rankPool(catalog) {
  // Ranking key per subject: prelim first, newer year, GEP-centre school within a year, school name A–Z
  const out = {};
  for (const s of SUBJECTS) {
    const seen = new Set();
    out[s] = catalog.filter((p) => p.subject === s && p.url && Number.isInteger(p.year))
      .filter((p) => { const k = `${p.year}|${p.kind}|${norm(p.school)}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => ((KIND_ORDER[a.kind] ?? 1) - (KIND_ORDER[b.kind] ?? 1)) || (b.year - a.year) || (isGep(b.school) - isGep(a.school)) || norm(a.school).localeCompare(norm(b.school)))
      .map((p, i) => ({ ...p, short: p.short || shortName(p.school), rank: i + 1 }));
  }
  return out;
}

const oldestFirst = (a, b) => (a.year - b.year) || (a.rank - b.rank);
function fill(slots, papers) {
  // slots: [{week, free}] in week order; papers placed oldest first; returns Map(id → week)
  const at = new Map(), list = papers.slice().sort(oldestFirst);
  let i = 0;
  for (const s of slots) for (let k = 0; k < s.free && i < list.length; k++) at.set(list[i++].id, s.week);
  return at;
}

export function buildPlan(catalog, { plan: planId, start, psle, perWeek = 1, poolPerWeek = 2 }) {
  const weeks = planWeeks(start, psle), pool = rankPool(catalog), docs = [], short = {};
  for (const s of SUBJECTS) {
    const chosen = pool[s].slice(0, poolPerWeek * weeks.length).map((p) => ({ ...p, id: paperId(planId, p) }));
    if (chosen.length < poolPerWeek * weeks.length) short[s] = poolPerWeek * weeks.length - chosen.length;
    const scheduled = chosen.slice(0, perWeek * weeks.length);
    const at = fill(weeks.map((w) => ({ week: w, free: perWeek })), scheduled);
    for (const p of chosen) docs.push({ id: p.id, doc: paperDoc(planId, p, at.get(p.id) || null, p.rank) });
  }
  return { plan: { psleDate: psle, startWeek: monday(start), perWeek, updatedAt: null }, docs, weeks, shortfall: short };
}

export function replan(catalog, current, { from, psle, perWeek, poolPerWeek = 2 }) {
  // Papers of weeks before the current week keep their week, whoever has done them. Papers of this and later weeks,
  // the reserve and papers new to the pool are spread again from the current week by rank; existing papers get
  // week/rank updates only, new ones are set; nothing is deleted and no Paper mark is written.
  const plan = current.plan, planId = current.planId;
  psle = psle || plan.psleDate; perWeek = perWeek || plan.perWeek || 1;
  const weeks = planWeeks(from, psle), pool = rankPool(catalog), updates = [], sets = [], short = {};
  const byId = new Map(current.papers.map((p) => [p.id, p]));
  const isPast = (p) => p.week && p.week < weeks[0];
  for (const s of SUBJECTS) {
    const mine = current.papers.filter((p) => p.subject === s);
    const pastIds = new Set(mine.filter(isPast).map((p) => p.id));
    const slots = weeks.map((w) => ({ week: w, free: perWeek }));
    const need = slots.reduce((n, x) => n + x.free, 0);
    const ranked = pool[s].map((p) => ({ ...p, id: paperId(planId, p) }));
    const rankOf = new Map(ranked.map((p) => [p.id, p.rank]));
    const open = ranked.filter((p) => !pastIds.has(p.id));
    for (const p of mine) if (!pastIds.has(p.id) && !rankOf.has(p.id)) open.push({ ...p, rank: 1e6 + (p.rank || 0) });   // still in plan but gone from the catalogue: keep, rank last
    open.sort((a, b) => a.rank - b.rank);
    const target = poolPerWeek * weeks.length;
    if (open.length < target) short[s] = target - open.length;
    const at = fill(slots, open.slice(0, need));
    for (const p of open) {
      const week = at.get(p.id) || null, rank = rankOf.get(p.id) ?? p.rank;
      const ex = byId.get(p.id);
      if (ex) { if (ex.week !== week || ex.rank !== rank) updates.push({ id: p.id, patch: { week, rank } }); }
      else if (week || sets.filter((x) => x.doc.subject === s).length + mine.length - pastIds.size < target) sets.push({ id: p.id, doc: paperDoc(planId, p, week, rank) });
    }
  }
  return { plan: { ...plan, psleDate: psle, perWeek, updatedAt: null }, updates, sets, weeks, shortfall: short };
}

export function checkReadback(readback, { before, from } = {}) {
  // Every planned week holds perWeek papers per subject; after a re-plan, past-week papers keep their week
  // and every Paper mark equals the one before the write
  const problems = [], per = readback.plan?.perWeek || 1, counts = new Map();
  for (const p of readback.papers) if (p.week) { const k = `${p.week}|${p.subject}`; counts.set(k, (counts.get(k) || 0) + 1); }
  const weeks = [...new Set(readback.papers.filter((p) => p.week).map((p) => p.week))].sort();
  const cur = from ? monday(from) : null;
  for (const w of weeks) for (const s of SUBJECTS) { const n = counts.get(`${w}|${s}`) || 0; if (n < per && (!cur || w >= cur)) problems.push(`${w} ${s}: ${n} of ${per}`); }
  if (before) {
    const now = new Map(readback.papers.map((p) => [p.id, p]));
    for (const p of before.papers) {
      const q = now.get(p.id);
      if (!q) problems.push(`${p.id} missing after write`);
      else if (cur && p.week && p.week < cur && q.week !== p.week) problems.push(`${p.id} past week changed`);
    }
    const marks = new Map((readback.marks || []).map((m) => [m.id, m]));
    for (const m of before.marks || []) {
      const q = marks.get(m.id);
      if (!q || q.doneOn !== m.doneOn || q.score !== m.score || q.total !== m.total) problems.push(`${m.id} Paper mark changed`);
    }
  }
  const reserve = readback.papers.filter((p) => !p.week).length;
  return { problems, weeks: weeks.length, first: weeks[0] || null, last: weeks[weeks.length - 1] || null, reserve, total: readback.papers.length };
}

export function migrate(legacy, { plan: planId, existingMarks = [] }) {
  // Per-user plan → shared shape (plan contract, Migrate): same weeks and ranks; each legacy done mark becomes a
  // Paper mark unless an equal one exists (the second pass after the new page is released copies only the missing or different).
  const mapId = (p) => paperId(planId, p);
  const papers = legacy.papers.map((p) => ({ id: mapId(p), doc: paperDoc(planId, p, p.week || null, p.rank), from: p.id }));
  const have = new Map(existingMarks.map((m) => [m.id, m]));
  const marks = [];
  for (const p of legacy.papers) {
    if (!p.doneOn) continue;
    const id = markId(mapId(p), legacy.user), doc = { paper: mapId(p), by: legacy.user, doneOn: p.doneOn, score: p.score ?? null, total: p.total ?? null };
    const h = have.get(id);
    if (!h || h.doneOn !== doc.doneOn || h.score !== doc.score || h.total !== doc.total) marks.push({ id, doc });
  }
  const ids = new Set(papers.map((p) => p.id));
  if (ids.size !== papers.length) throw new Error('two legacy papers map to one shared id');
  const { psleDate, startWeek, perWeek } = legacy.plan;
  return { plan: { psleDate, startWeek, perWeek, updatedAt: null }, papers, marks, deletes: legacy.papers.map((p) => p.id) };
}

export function checkMigration(readback, legacy, { plan: planId }) {
  // The shared plan holds every legacy paper with the same week and rank, and every legacy done mark has an equal Paper mark
  const problems = [], now = new Map(readback.papers.map((p) => [p.id, p])), marks = new Map((readback.marks || []).map((m) => [m.id, m]));
  if (!readback.plan || readback.plan.psleDate !== legacy.plan.psleDate) problems.push('shared plan missing or psleDate differs');
  for (const p of legacy.papers) {
    const id = paperId(planId, p), q = now.get(id);
    if (!q) { problems.push(`${id} missing`); continue; }
    if ((q.week || null) !== (p.week || null) || q.rank !== p.rank || q.plan !== planId) problems.push(`${id} week/rank/plan differs`);
    if (p.doneOn) {
      const m = marks.get(markId(id, legacy.user));
      if (!m || m.doneOn !== p.doneOn || m.score !== (p.score ?? null) || m.total !== (p.total ?? null) || m.by !== legacy.user || m.paper !== id) problems.push(`${id} Paper mark missing or differs`);
    }
  }
  return { problems, papers: legacy.papers.length, marks: legacy.papers.filter((p) => p.doneOn).length };
}

// ---------- files ----------
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (p, v) => { mkdirSync(resolve(p, '..'), { recursive: true }); writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };
const die = (m) => { console.error(m); process.exit(1); };
function opts(argv) {
  // --name value; a flag followed by nothing or by another --flag is true
  const o = {}, rest = [];
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i]; else rest.push(argv[i]);
  return { o, rest };
}
const readAll = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => ({ id: f.slice(0, -5), ...readJson(join(dir, f)) })) : []);
export function readDir(dir, planId) {
  // The shared plan, its School papers (by the `plan` field) and every Paper mark of those papers
  const pf = join(dir, 'plans', `${planId}.json`);
  const papers = readAll(join(dir, 'schoolPapers')).filter((p) => p.plan === planId);
  const ids = new Set(papers.map((p) => p.id));
  return { planId, plan: existsSync(pf) ? readJson(pf) : null, papers, marks: readAll(join(dir, 'paperMarks')).filter((m) => ids.has(m.paper)) };
}
export function readLegacy(dir, user) {
  // A per-user plan from before the shared shape: plans/<user>.json and the School papers whose `for` is that user
  const pf = join(dir, 'plans', `${user}.json`);
  if (!existsSync(pf)) throw new Error(`no legacy plans/${user}.json in ${dir}`);
  return { user, plan: readJson(pf), papers: readAll(join(dir, 'schoolPapers')).filter((p) => p.for === user) };
}
function batches(work, name, ops) {
  const out = [];
  for (let i = 0; i < ops.length; i += 50) out.push(ops.slice(i, i + 50));
  writeJson(join(work, `batches-${name}.json`), out);
  return out.length;
}
function preview(work, docs, weeks) {
  const lines = ['week        | math | english | science'];
  for (const w of weeks) lines.push(`${w}  | ` + SUBJECTS.map((s) => docs.filter((d) => d.subject === s && d.week === w).map((d) => `${d.year} ${d.short}`).join(', ') || '—').join(' | '));
  lines.push('', 'reserve: ' + SUBJECTS.map((s) => `${s} ${docs.filter((d) => d.subject === s && !d.week).length}`).join(', '));
  writeFileSync(join(work, 'preview.txt'), lines.join('\n') + '\n');
}

function main(argv) {
  const [cmd, ...args] = argv, { o, rest } = opts(args);
  const d = new Date(), p2 = (n) => String(n).padStart(2, '0');
  const now = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;   // device-local time, as DATA.md requires for 时刻
  if (cmd === 'build') {
    const [cat, work] = rest; if (!cat || !work || !o.plan || !o.start || !o.psle) die('usage: build <catalog.json> <work> --plan <id> --start <date> --psle <date>');
    const r = buildPlan(readJson(cat), { plan: o.plan, start: o.start, psle: o.psle, perWeek: Number(o['per-week'] || 1), poolPerWeek: Number(o['pool-per-week'] || 2) });
    r.plan.updatedAt = now;
    const ops = [{ op: 'set', collection: 'plans', doc_id: o.plan, file_path: resolve(work, 'writes', `plans__${o.plan}.json`) }];
    writeJson(ops[0].file_path, r.plan);
    for (const d of r.docs) { const f = resolve(work, 'writes', `schoolPapers__${d.id}.json`); writeJson(f, d.doc); ops.push({ op: 'set', collection: 'schoolPapers', doc_id: d.id, file_path: f }); }
    preview(work, r.docs.map((d) => d.doc), r.weeks);
    console.log(`build: ${r.weeks.length} weeks (${r.weeks[0]} … ${r.weeks.at(-1)}), ${r.docs.length} papers, ${batches(work, 'build', ops)} batch(es); preview.txt written` + (Object.keys(r.shortfall).length ? `; SHORTFALL ${JSON.stringify(r.shortfall)}` : ''));
  } else if (cmd === 'replan') {
    const [cat, work] = rest; if (!cat || !work || !o.plan || !o.current || !o.from) die('usage: replan <catalog.json> <work> --plan <id> --current <dir> --from <date>');
    const cur = readDir(o.current, o.plan); if (!cur.plan) die(`no plans/${o.plan}.json in ${o.current}`);
    const r = replan(readJson(cat), cur, { from: o.from, psle: o.psle, perWeek: o['per-week'] ? Number(o['per-week']) : undefined, poolPerWeek: Number(o['pool-per-week'] || 2) });
    r.plan.updatedAt = now;
    const ops = [{ op: 'update', collection: 'plans', doc_id: o.plan, file_path: resolve(work, 'writes', `plans__${o.plan}.json`) }];
    writeJson(ops[0].file_path, { psleDate: r.plan.psleDate, perWeek: r.plan.perWeek, updatedAt: r.plan.updatedAt });
    for (const u of r.updates) { const f = resolve(work, 'writes', `schoolPapers__${u.id}.json`); writeJson(f, u.patch); ops.push({ op: 'update', collection: 'schoolPapers', doc_id: u.id, file_path: f }); }
    for (const d of r.sets) { const f = resolve(work, 'writes', `schoolPapers__${d.id}.json`); writeJson(f, d.doc); ops.push({ op: 'set', collection: 'schoolPapers', doc_id: d.id, file_path: f }); }
    const after = cur.papers.map((p) => { const u = r.updates.find((x) => x.id === p.id); return u ? { ...p, ...u.patch } : p; }).concat(r.sets.map((d) => d.doc));
    preview(work, after, r.weeks);
    writeJson(join(work, 'changes.json'), { updates: r.updates, sets: r.sets.map((d) => d.id) });
    console.log(`replan: ${r.updates.length} week/rank updates, ${r.sets.length} new papers, ${batches(work, 'replan', ops)} batch(es); changes.json and preview.txt written` + (Object.keys(r.shortfall).length ? `; SHORTFALL ${JSON.stringify(r.shortfall)}` : ''));
  } else if (cmd === 'check') {
    const [, back] = rest; if (!back || !o.plan) die('usage: check <work> <readback-dir> --plan <id> [--before <dir> --from <date>]');
    const r = checkReadback(readDir(back, o.plan), { before: o.before ? readDir(o.before, o.plan) : null, from: o.from });
    console.log(`check: ${r.total} papers, ${r.weeks} planned weeks (${r.first} … ${r.last}), reserve ${r.reserve}`);
    if (r.problems.length) { console.error(r.problems.join('\n')); process.exit(1); }
    console.log('check passed');
  } else if (cmd === 'migrate') {
    const [work] = rest; if (!work || !o.current || !o.user || !o.plan) die('usage: migrate <work> --current <dir> --user <legacy user id> --plan <id> [--marks-only]');
    const legacy = readLegacy(o.current, o.user), shared = readDir(o.current, o.plan);
    const r = migrate(legacy, { plan: o.plan, existingMarks: shared.marks });
    const w = (name, v) => { const f = resolve(work, 'writes', name); writeJson(f, v); return f; };
    const marks = r.marks.map((m) => ({ op: 'set', collection: 'paperMarks', doc_id: m.id, file_path: w(`paperMarks__${m.id}.json`, m.doc) }));
    if (!('marks-only' in o)) {
      r.plan.updatedAt = now;
      const ops = [...r.papers.map((p) => ({ op: 'set', collection: 'schoolPapers', doc_id: p.id, file_path: w(`schoolPapers__${p.id}.json`, p.doc) })),
        { op: 'set', collection: 'plans', doc_id: o.plan, file_path: w(`plans__${o.plan}.json`, r.plan) }];
      const n = batches(work, 'migrate-shared', ops);
      batches(work, 'migrate-delete', [...r.deletes.map((id) => ({ op: 'delete', collection: 'schoolPapers', doc_id: id })), { op: 'delete', collection: 'plans', doc_id: o.user }]);
      console.log(`migrate: ${r.papers.length} shared papers and plans/${o.plan} in ${n} batch(es); ${r.deletes.length} legacy papers + plans/${o.user} listed in batches-migrate-delete.json (apply only on a separate confirmation)`);
    }
    console.log(`migrate: ${marks.length} Paper mark(s) to copy in ${batches(work, 'migrate-marks', marks)} batch(es)`);
  } else if (cmd === 'check-migration') {
    const [back] = rest; if (!back || !o.user || !o.plan) die('usage: check-migration <readback-dir> --user <legacy user id> --plan <id>');
    const r = checkMigration(readDir(back, o.plan), readLegacy(back, o.user), { plan: o.plan });
    console.log(`check-migration: ${r.papers} legacy papers, ${r.marks} legacy done marks`);
    if (r.problems.length) { console.error(r.problems.join('\n')); process.exit(1); }
    console.log('check-migration passed');
  } else die('commands: build | replan | check | migrate | check-migration');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
