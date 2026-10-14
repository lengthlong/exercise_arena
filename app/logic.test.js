const fs = require('fs'), vm = require('vm'), assert = require('assert');
// 用法：node app/logic.test.js app/arena.html —— 抽出 arena.html 里 LOGIC:BEGIN 到 LOGIC:END 的纯函数，按 design/arena/README.md 的规则断言。
const html = fs.readFileSync(process.argv[2], 'utf8');
const src = html.slice(html.indexOf('/* LOGIC:BEGIN'), html.indexOf('/* LOGIC:END */'));
const ctx = {}; vm.createContext(ctx); vm.runInContext(src + ';this.L={deriveState,judgeAuto,dailyList,drawPaper,paperLayout,matchShort,addDays,tally,localToday,paperAttempts,paperScore,mustUseCheck,parseList,parseExplanation,sortExercises,pageSlice,toYaml,exportData};', ctx);
const L = ctx.L;
const ids = a => Array.from(a, e => e.id);
const A = (date, result) => ({ date, result });
// ladder: on-time rights land on day 1,3,7,14 after recording, then mastered
let s = L.deriveState('2026-10-12', []);
assert.deepStrictEqual([s.step, s.due, s.mastered, s.wrongCount], [1, '2026-10-13', false, 1]);
s = L.deriveState('2026-10-12', [A('2026-10-13', 'right')]); assert.deepStrictEqual([s.step, s.due], [2, '2026-10-15']);
s = L.deriveState('2026-10-12', [A('2026-10-13', 'right'), A('2026-10-15', 'right')]); assert.deepStrictEqual([s.step, s.due], [3, '2026-10-19']);
s = L.deriveState('2026-10-12', [A('2026-10-13', 'right'), A('2026-10-15', 'right'), A('2026-10-19', 'right')]); assert.deepStrictEqual([s.step, s.due], [4, '2026-10-26']);
s = L.deriveState('2026-10-12', [A('2026-10-13', 'right'), A('2026-10-15', 'right'), A('2026-10-19', 'right'), A('2026-10-26', 'right')]);
assert.deepStrictEqual([s.mastered, s.due], [true, null]);
// partial stays, gap of same step; wrong resets, next day, counts
s = L.deriveState('2026-10-12', [A('2026-10-13', 'right'), A('2026-10-16', 'partial')]); assert.deepStrictEqual([s.step, s.due], [2, '2026-10-18']);
s = L.deriveState('2026-10-12', [A('2026-10-13', 'right'), A('2026-10-15', 'wrong')]); assert.deepStrictEqual([s.step, s.due, s.wrongCount], [1, '2026-10-16', 2]);
// mastered: wrong on paper resets; right/partial keeps
const m = [A('2026-10-13', 'right'), A('2026-10-15', 'right'), A('2026-10-19', 'right'), A('2026-10-26', 'right')];
s = L.deriveState('2026-10-12', m.concat([A('2026-11-01', 'partial')])); assert.strictEqual(s.mastered, true);
s = L.deriveState('2026-10-12', m.concat([A('2026-11-01', 'wrong')])); assert.deepStrictEqual([s.mastered, s.step, s.due, s.wrongCount, s.lastAttemptAt], [false, 1, '2026-11-02', 2, '2026-11-01']);
// month/year rollover
assert.strictEqual(L.addDays('2026-12-30', 4), '2027-01-03');
// judging
assert.strictEqual(L.judgeAuto({ format: 'mcq', answer: 'B' }, 'b'), 'right');
assert.strictEqual(L.judgeAuto({ format: 'mcq', answer: 'B' }, 'A'), 'wrong');
assert.strictEqual(L.judgeAuto({ format: 'short', answer: '0.5', accepted: ['0.5', '1/2'] }, '0.50'), 'right');
assert.strictEqual(L.judgeAuto({ format: 'short', answer: '0.5', accepted: ['0.5', '1/2'] }, ' 1/2 '), 'right');
assert.strictEqual(L.judgeAuto({ format: 'short', answer: '1000', accepted: [] }, '1,000'), 'right');
assert.strictEqual(L.judgeAuto({ format: 'short', answer: 'Went', accepted: ['went'] }, 'WENT.'), 'right');
assert.strictEqual(L.judgeAuto({ format: 'short', answer: 'has  been', accepted: ['has been'] }, 'has   been'), 'right');
assert.strictEqual(L.judgeAuto({ format: 'short', answer: '45', accepted: ['45'] }, '54'), 'wrong');
assert.strictEqual(L.judgeAuto({ format: 'short', answer: '45', accepted: ['45'] }, ''), 'wrong');
assert.strictEqual(L.judgeAuto({ format: 'open', answer: 'x' }, 'x'), null);
// daily list: not mastered, due <= today, oldest due first, capped
const ex = [
  { id: 'a', due: '2026-10-14', createdAt: '2026-10-01', mastered: false },
  { id: 'b', due: '2026-10-10', createdAt: '2026-10-02', mastered: false },
  { id: 'c', due: '2026-10-15', createdAt: '2026-10-03', mastered: false },
  { id: 'd', due: null, createdAt: '2026-10-03', mastered: true },
  { id: 'e', due: '2026-10-10', createdAt: '2026-10-01', mastered: false }];
assert.deepStrictEqual(ids(L.dailyList(ex, '2026-10-14', 10)), ['e', 'b', 'a']);
assert.deepStrictEqual(ids(L.dailyList(ex, '2026-10-14', 2)), ['e', 'b']);
// paper draw: wrongCount desc, mastered first on tie, then oldest lastAttempt (never first)
const px = [
  { id: 'p1', subject: 'science', topic: 'C-water', wrongCount: 1, mastered: false, lastAttemptAt: '2026-10-01' },
  { id: 'p2', subject: 'science', topic: 'C-water', wrongCount: 3, mastered: false, lastAttemptAt: '2026-10-05' },
  { id: 'p3', subject: 'science', topic: 'C-water', wrongCount: 1, mastered: true, lastAttemptAt: '2026-10-09' },
  { id: 'p4', subject: 'science', topic: 'C-repro', wrongCount: 1, mastered: false, lastAttemptAt: null },
  { id: 'p5', subject: 'math', topic: 'F-frac', wrongCount: 9, mastered: false, lastAttemptAt: null }];
assert.deepStrictEqual(ids(L.drawPaper(px, { subject: 'science', topics: [], count: 10 })), ['p2', 'p3', 'p4', 'p1']);
assert.deepStrictEqual(ids(L.drawPaper(px, { subject: 'science', topics: ['C-water'], count: 2 })), ['p2', 'p3']);
assert.deepStrictEqual({ ...L.tally(['right', 'wrong', 'right', 'partial']) }, { right: 2, partial: 1, wrong: 1 });
// 题组：每日清单按组连排（D5、D13）
const g = [
  { id: 's1', due: '2026-10-12', createdAt: '2026-10-05', mastered: false },
  { id: 'q4', setId: 'S', setPos: 2, due: '2026-10-13', createdAt: '2026-10-01', mastered: false },
  { id: 'q2', setId: 'S', setPos: 1, due: '2026-10-14', createdAt: '2026-10-01', mastered: false },
  { id: 'q5', setId: 'S', setPos: 3, due: '2026-10-16', createdAt: '2026-10-01', mastered: false },
  { id: 's2', due: '2026-10-14', createdAt: '2026-10-02', mastered: false },
  { id: 's3', due: '2026-10-14', createdAt: '2026-10-03', mastered: false }];
// 组内到期的 q2、q4 连排、按 setPos；q5 未到期不拉进来；组按最早到期（10-13）排位
assert.deepStrictEqual(ids(L.dailyList(g, '2026-10-14', 10)), ['s1', 'q2', 'q4', 's2', 's3']);
// 上限 2：s1 放入后组放不下，跳过并继续补位 s2
assert.deepStrictEqual(ids(L.dailyList(g, '2026-10-14', 2)), ['s1', 's2']);
// 上限 1 且清单为空时，第一组整组放入（这里第一个单元是 s1，单独一题）
assert.deepStrictEqual(ids(L.dailyList(g.slice(1), '2026-10-14', 1)), ['q2', 'q4']);
// 卷面合并（D6）：按抽题顺序，遇到题组第一道题时接上同组抽中的题
const drawn = [
  { id: 'a', setId: null }, { id: 'q4', setId: 'S', setPos: 2 }, { id: 'b' }, { id: 'q2', setId: 'S', setPos: 1 }, { id: 'c' }];
assert.deepStrictEqual(ids(L.paperLayout(drawn)), ['a', 'q2', 'q4', 'b', 'c']);
// 检验卷记录与作答历史（0003）
const P = { id: 'P1', exerciseIds: ['x1', 'gone', 'x2', 'x3'] };
const hx = [
  { id: 'x1', attempts: [{ date: '2026-10-14', mode: 'paper', paperId: 'P1', result: 'right', judgedBy: 'auto', at: '2026-10-14T19:40' }] },
  { id: 'x2', attempts: [{ date: '2026-10-13', mode: 'daily', result: 'wrong', judgedBy: 'auto' }, { date: '2026-10-14', mode: 'paper', paperId: 'P1', result: 'wrong', judgedBy: 'self', at: '2026-10-14T19:41' }] },
  { id: 'x3', attempts: [{ date: '2026-10-14', mode: 'daily', result: 'partial', judgedBy: 'self', at: '2026-10-14T08:05' }, { date: '2026-10-14', mode: 'paper', paperId: 'P1', result: 'right', judgedBy: 'auto', at: '2026-10-14T19:42' }, { date: '2026-10-14', mode: 'daily', result: 'right', judgedBy: 'auto' }] }];
// 卷上作答按卷面顺序，已删题为空
assert.deepStrictEqual(Array.from(L.paperAttempts(P, hx), r => r.ex ? r.attempt.result : null), ['right', null, 'wrong', 'right']);
// 得分只算仍在的题
assert.deepStrictEqual({ ...L.paperScore(P, hx) }, { right: 2, partial: 0, wrong: 1, total: 3 });
// 0004：选词判对、必须用的词、一句检查
assert.strictEqual(L.judgeAuto({ format: 'pick', answer: 'although' }, 'Although'), 'right');
assert.strictEqual(L.judgeAuto({ format: 'pick', answer: 'although' }, 'despite'), 'wrong');
assert.strictEqual(L.judgeAuto({ format: 'pick', answer: 'although' }, ''), 'wrong');
assert.strictEqual(L.mustUseCheck('anything', []), null);
const mu = (a, m) => { const r = L.mustUseCheck(a, m); return [Array.from(r.missing), r.multi]; };
assert.deepStrictEqual(mu('Despite the heavy rain, the match continued.', ['Despite']), [[], false]);
assert.deepStrictEqual(mu('In spite of the rain, the match continued.', ['Despite']), [['Despite'], false]);
assert.deepStrictEqual(mu('The match continued despite the rain.', ['despite']), [[], false]);
assert.deepStrictEqual(mu('Despiteful rain fell.', ['Despite']), [['Despite'], false]);
assert.deepStrictEqual(mu('Neither Tom nor Ali came.', ['Neither…nor']), [[], false]);
assert.deepStrictEqual(mu('Nor Tom neither Ali came.', ['Neither…nor']), [['Neither…nor'], false]);
assert.deepStrictEqual(mu('Not only did she sing but also danced.', ['Not only...but also']), [[], false]);
assert.deepStrictEqual(mu('It rained. The match continued.', ['rained']), [[], true]);
assert.deepStrictEqual(mu('"Can you help me?" asked Tom.', ['asked']), [[], false]);
assert.deepStrictEqual(mu("'Can you help me?' asked Tom.", ['asked']), [[], false]);
assert.deepStrictEqual(mu("Mr. Tan said that he didn't know.", ['said']), [[], false]);
assert.deepStrictEqual(Array.from(L.parseList('a; b\nc ;; ')), ['a', 'b', 'c']);
// 0005：讲解三段
const ex1 = L.parseExplanation('Key idea: Use [[contrast]] connectors.\nSteps:\n1. Read both sentences.\n- Pick the word.\nWatch out: "Although" cannot start a new sentence.');
assert.deepStrictEqual([ex1.structured, ex1.keyIdea, Array.from(ex1.steps), Array.from(ex1.watchOut)],
  [true, 'Use [[contrast]] connectors.', ['Read both sentences.', 'Pick the word.'], ['"Although" cannot start a new sentence.']]);
const ex2 = L.parseExplanation('steps: 1. first\n2. second\nWATCH OUT:\n- a\n- b');
assert.deepStrictEqual([ex2.keyIdea, Array.from(ex2.steps), Array.from(ex2.watchOut)], ['', ['first', 'second'], ['a', 'b']]);
const ex3 = L.parseExplanation('One paragraph.\n\nSecond paragraph.');
assert.deepStrictEqual([ex3.structured, Array.from(ex3.paras)], [false, ['One paragraph.', 'Second paragraph.']]);
// 0005：错题排序（D7、D9）与分页
const sx = [
  { id: 'a', recordedAt: '2026-10-14T19:00', createdAt: '2026-10-14', due: '2026-10-16', wrongCount: 1, lastAttemptAt: '2026-10-14' },
  { id: 'b', createdAt: '2026-10-14', due: null, wrongCount: 3, lastAttemptAt: null },
  { id: 'c', recordedAt: '2026-10-13T08:00', createdAt: '2026-10-13', due: '2026-10-15', wrongCount: 3, lastAttemptAt: '2026-10-13' },
  { id: 'd', recordedAt: '2026-10-14T00:30', createdAt: '2026-10-14', due: '2026-10-15', wrongCount: 1, lastAttemptAt: null }];
assert.deepStrictEqual(ids(L.sortExercises(sx, 'recorded', 'desc')), ['a', 'd', 'b', 'c']);   // b 旧题按 00:00
assert.deepStrictEqual(ids(L.sortExercises(sx, 'recorded', 'asc')), ['c', 'b', 'd', 'a']);
assert.deepStrictEqual(ids(L.sortExercises(sx, 'due', 'asc')), ['d', 'c', 'a', 'b']);         // 并列按录入新的在前；空值最后
assert.deepStrictEqual(ids(L.sortExercises(sx, 'due', 'desc')), ['a', 'd', 'c', 'b']);
assert.deepStrictEqual(ids(L.sortExercises(sx, 'wrong', 'desc')), ['b', 'c', 'a', 'd']);
assert.deepStrictEqual(ids(L.sortExercises(sx, 'last', 'asc')), ['c', 'a', 'd', 'b']);        // 空值无论升降都在最后
assert.deepStrictEqual(ids(L.sortExercises(sx, 'last', 'desc')), ['a', 'c', 'd', 'b']);
const many = Array.from({ length: 45 }, (_, i) => i);
let pgx = L.pageSlice(many, 1, 20); assert.deepStrictEqual([pgx.page, pgx.pages, pgx.items.length, pgx.items[0]], [1, 3, 20, 0]);
pgx = L.pageSlice(many, 3, 20); assert.deepStrictEqual([pgx.items.length, pgx.items[0]], [5, 40]);
pgx = L.pageSlice(many, 9, 20); assert.strictEqual(pgx.page, 3);
pgx = L.pageSlice([], 1, 20); assert.deepStrictEqual([pgx.page, pgx.pages, pgx.items.length], [1, 1, 0]);
// 0005：YAML 与导出（D6）
assert.strictEqual(L.toYaml({ a: 'x "q"\nnew', b: [], c: {}, d: null, e: 3, f: true }), 'a: "x \\"q\\"\\nnew"\nb: []\nc: {}\nd: null\ne: 3\nf: true');
assert.strictEqual(L.toYaml({ list: [{ id: 'x', tags: ['p', 'q'] }, 'plain'] }), 'list:\n  - id: "x"\n    tags:\n      - "p"\n      - "q"\n  - "plain"');
const exd = L.exportData([{ id: 'x1', images: ['i1', 'i2'], attempts: [{ paperId: 'P1', result: 'right' }] }], [{ id: 's1', images: [] }],
  [{ id: 'P1', exerciseIds: ['x1'], score: { right: 9 } }], { dailyLimit: 10 }, '2026-10-14T20:00');
assert.deepStrictEqual([exd.exportedAt, exd.exercises[0].images, exd.sets[0].images, { ...exd.papers[0].score }, exd.settings.dailyLimit],
  ['2026-10-14T20:00', 2, 0, { right: 1, partial: 0, wrong: 0, total: 1 }, 10]);
console.log('all logic tests passed');
