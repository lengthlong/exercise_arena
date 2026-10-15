const fs = require('fs'), vm = require('vm'), assert = require('assert');
// 用法：node app/logic.test.js app/arena.html —— 抽出 arena.html 里 LOGIC:BEGIN 到 LOGIC:END 的纯函数断言；这些断言就是页面规则的规格。
const html = fs.readFileSync(process.argv[2], 'utf8');
const src = html.slice(html.indexOf('/* LOGIC:BEGIN'), html.indexOf('/* LOGIC:END */'));
const ctx = {}; vm.createContext(ctx); vm.runInContext(src + ';this.L={deriveState,judgeAuto,dailyList,drawPaper,paperLayout,matchShort,addDays,tally,localToday,paperAttempts,paperScore,mustUseCheck,parseList,parseExplanation,sortExercises,pageSlice,toYaml,exportData,streakInfo,masteredOn,masteryPeak,dashboardData,encouragement,readSettings,planForecast,planLine,weekStart,goalProgress,weekReview,goalChecks,weekTips};', ctx);
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
// 题组：每日清单按组连排
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
// 卷面合并：按抽题顺序，遇到题组第一道题时接上同组抽中的题
const drawn = [
  { id: 'a', setId: null }, { id: 'q4', setId: 'S', setPos: 2 }, { id: 'b' }, { id: 'q2', setId: 'S', setPos: 1 }, { id: 'c' }];
assert.deepStrictEqual(ids(L.paperLayout(drawn)), ['a', 'q2', 'q4', 'b', 'c']);
// 检验卷记录与作答历史
const P = { id: 'P1', exerciseIds: ['x1', 'gone', 'x2', 'x3'] };
const hx = [
  { id: 'x1', attempts: [{ date: '2026-10-14', mode: 'paper', paperId: 'P1', result: 'right', judgedBy: 'auto', at: '2026-10-14T19:40' }] },
  { id: 'x2', attempts: [{ date: '2026-10-13', mode: 'daily', result: 'wrong', judgedBy: 'auto' }, { date: '2026-10-14', mode: 'paper', paperId: 'P1', result: 'wrong', judgedBy: 'self', at: '2026-10-14T19:41' }] },
  { id: 'x3', attempts: [{ date: '2026-10-14', mode: 'daily', result: 'partial', judgedBy: 'self', at: '2026-10-14T08:05' }, { date: '2026-10-14', mode: 'paper', paperId: 'P1', result: 'right', judgedBy: 'auto', at: '2026-10-14T19:42' }, { date: '2026-10-14', mode: 'daily', result: 'right', judgedBy: 'auto' }] }];
// 卷上作答按卷面顺序，已删题为空
assert.deepStrictEqual(Array.from(L.paperAttempts(P, hx), r => r.ex ? r.attempt.result : null), ['right', null, 'wrong', 'right']);
// 得分只算仍在的题
assert.deepStrictEqual({ ...L.paperScore(P, hx) }, { right: 2, partial: 0, wrong: 1, total: 3 });
// 选词判对、必须用的词、一句检查
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
// 讲解三段
const ex1 = L.parseExplanation('Key idea: Use [[contrast]] connectors.\nSteps:\n1. Read both sentences.\n- Pick the word.\nWatch out: "Although" cannot start a new sentence.');
assert.deepStrictEqual([ex1.structured, ex1.keyIdea, Array.from(ex1.steps), Array.from(ex1.watchOut)],
  [true, 'Use [[contrast]] connectors.', ['Read both sentences.', 'Pick the word.'], ['"Although" cannot start a new sentence.']]);
const ex2 = L.parseExplanation('steps: 1. first\n2. second\nWATCH OUT:\n- a\n- b');
assert.deepStrictEqual([ex2.keyIdea, Array.from(ex2.steps), Array.from(ex2.watchOut)], ['', ['first', 'second'], ['a', 'b']]);
const ex3 = L.parseExplanation('One paragraph.\n\nSecond paragraph.');
assert.deepStrictEqual([ex3.structured, Array.from(ex3.paras)], [false, ['One paragraph.', 'Second paragraph.']]);
// 错题排序与分页
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
// YAML 与导出
assert.strictEqual(L.toYaml({ a: 'x "q"\nnew', b: [], c: {}, d: null, e: 3, f: true }), 'a: "x \\"q\\"\\nnew"\nb: []\nc: {}\nd: null\ne: 3\nf: true');
assert.strictEqual(L.toYaml({ list: [{ id: 'x', tags: ['p', 'q'] }, 'plain'] }), 'list:\n  - id: "x"\n    tags:\n      - "p"\n      - "q"\n  - "plain"');
const exd = L.exportData([{ id: 'x1', images: ['i1', 'i2'], attempts: [{ paperId: 'P1', result: 'right' }] }], [{ id: 's1', images: [] }],
  [{ id: 'P1', exerciseIds: ['x1'], score: { right: 9 } }], { dailyLimit: 10 }, '2026-10-14T20:00');
assert.deepStrictEqual([exd.exportedAt, exd.exercises[0].images, exd.sets[0].images, { ...exd.papers[0].score }, exd.settings.dailyLimit],
  ['2026-10-14T20:00', 2, 0, { right: 1, partial: 0, wrong: 0, total: 1 }, 10]);
// 进度看板
const T0 = '2026-10-20';
const at = (date, result) => ({ date, result, mode: 'daily' });
// 连续天数
let si = L.streakInfo([{ attempts: [at('2026-10-20', 'right'), at('2026-10-19', 'wrong')] }, { attempts: [at('2026-10-18', 'right')] }], T0);
assert.deepStrictEqual([si.streak, si.doneToday], [3, true]);
si = L.streakInfo([{ attempts: [at('2026-10-19', 'right'), at('2026-10-18', 'wrong')] }], T0);
assert.deepStrictEqual([si.streak, si.doneToday], [2, false]);          // 今天还没做，从昨天数
si = L.streakInfo([{ attempts: [at('2026-10-20', 'right'), at('2026-10-18', 'right')] }], T0);
assert.strictEqual(si.streak, 1);                                          // 19 号中断
si = L.streakInfo([{ attempts: [] }], T0); assert.deepStrictEqual([si.streak, si.doneToday], [0, false]);
// 变成掌握的日期：4 次对 → 掌握；再错 → 失去；再 4 次对 → 新日期；掌握后再对不变
const four = d => [at(d[0], 'right'), at(d[1], 'right'), at(d[2], 'right'), at(d[3], 'right')];
const mA = { attempts: four(['2026-10-01', '2026-10-03', '2026-10-07', '2026-10-14']).concat([at('2026-10-16', 'right')]), mastered: true };
assert.strictEqual(L.masteredOn(mA), '2026-10-14');
const mB = { attempts: four(['2026-10-01', '2026-10-03', '2026-10-07', '2026-10-10']).concat([at('2026-10-12', 'wrong')]).concat(four(['2026-10-13', '2026-10-15', '2026-10-17', '2026-10-19'])), mastered: true };
assert.strictEqual(L.masteredOn(mB), '2026-10-19');
const mC = { attempts: four(['2026-10-01', '2026-10-03', '2026-10-07', '2026-10-10']).concat([at('2026-10-12', 'wrong')]), mastered: false, step: 1 };
assert.strictEqual(L.masteredOn(mC), null);
// 历史最高：mC 曾掌握（10 号）后丢失，仍计入当日最高
assert.strictEqual(L.masteryPeak([mA, mC]), 1);                            // 10 号 mC=1，12 号回 0，14 号 mA=1
assert.strictEqual(L.masteryPeak([mA, mB, mC]), 2);
// 看板数据
const dex = [mA, mB, mC, { attempts: [at('2026-10-20', 'partial'), at('2026-10-07', 'wrong')], mastered: false, step: 2 }, { attempts: [], mastered: false, step: 1 }];
mA.step = 4; mB.step = 4;
const dd = L.dashboardData(dex, T0);
assert.deepStrictEqual([dd.total, dd.mastered, dd.newMastered7, dd.newMasteredToday], [5, 2, 2, 0]);
assert.deepStrictEqual([dd.days.length, dd.days[0].date, dd.days[13].date], [14, '2026-10-07', '2026-10-20']);
assert.deepStrictEqual({ ...dd.days[0] }, { date: '2026-10-07', right: 3, partial: 0, wrong: 1 });   // 含边界第 1 天
assert.deepStrictEqual({ ...dd.days[13] }, { date: '2026-10-20', right: 0, partial: 1, wrong: 0 });
assert.deepStrictEqual({ ...dd.ladder }, { 1: 2, 2: 1, 3: 0, 4: 0, mastered: 2 });
assert.deepStrictEqual([dd.peak, Array.from(dd.badges), dd.next, dd.toGo], [2, [], 10, 8]);
// 鼓励语各分支
const base = { streak: 0, newMasteredToday: 0, todayRight: 0, todayAny: 0 };
assert.strictEqual(L.encouragement(Object.assign({}, base, { newMasteredToday: 2, todayRight: 5, todayAny: 5, streak: 3 }), true), 'You mastered 2 today! 3-day streak, keep it going!');
assert.strictEqual(L.encouragement(Object.assign({}, base, { todayRight: 4, todayAny: 6, streak: 1 }), true), '4 right today — nice work!');
assert.strictEqual(L.encouragement(Object.assign({}, base, { todayAny: 3, streak: 5 }), true), 'You practised today — every mistake helps you learn!');
assert.strictEqual(L.encouragement(Object.assign({}, base, { streak: 4 }), true), "Do today's redo to keep your 4-day streak!");
assert.strictEqual(L.encouragement(base, true), "Start today's redo to begin a streak!");
assert.strictEqual(L.encouragement(base, false), 'All caught up. See you tomorrow!');
// 里程碑
const mast27 = Array.from({ length: 27 }, () => ({ attempts: four(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']), mastered: true, step: 4 }));
const dm = L.dashboardData(mast27, T0);
assert.deepStrictEqual([dm.peak, Array.from(dm.badges), dm.next, dm.toGo], [27, [10, 25], 50, 23]);
// 设置：缺字段与非数按默认，超出范围收紧，0 保留
assert.deepStrictEqual({ ...L.readSettings(null) }, { dailyLimit: 10, practiceDays: 6, papersPerWeek: 1 });
assert.deepStrictEqual({ ...L.readSettings({ dailyLimit: 18 }) }, { dailyLimit: 18, practiceDays: 6, papersPerWeek: 1 });
assert.deepStrictEqual({ ...L.readSettings({ dailyLimit: 0, practiceDays: 9, papersPerWeek: 0 }) }, { dailyLimit: 1, practiceDays: 7, papersPerWeek: 0 });
assert.deepStrictEqual({ ...L.readSettings({ dailyLimit: 'x', practiceDays: -2, papersPerWeek: 5 }) }, { dailyLimit: 10, practiceDays: 1, papersPerWeek: 3 });
// 计划：未来 7 天按上限做、假设都做对；做过的题按间隔回来
const q = (id, due, step, extra) => Object.assign({ id, due, step, createdAt: '2026-10-01', mastered: false }, extra || {});
let pf = L.planForecast([q('a', '2026-10-15', 1), q('b', '2026-10-15', 1), q('c', '2026-10-15', 1)], '2026-10-15', 2);
// 15 号做 a、b（升到第 2 级，17 号回来）；16 号做 c；17 号 a、b 回来升第 3 级，21 号再回来
assert.deepStrictEqual(Array.from(pf.days, d => d.count), [2, 1, 2, 1, 0, 0, 2]);
assert.deepStrictEqual([pf.waiting, pf.clearOn, pf.needLimit], [3, '2026-10-16', null]);
assert.strictEqual(L.planLine(pf, 2, d => 'D' + d.slice(8)), "At 2 a day, you'll be caught up by D16.");
// 当天全做完：clearOn 是今天
pf = L.planForecast([q('a', '2026-10-15', 1), q('m', null, 4, { mastered: true })], '2026-10-15', 5);
assert.deepStrictEqual([pf.days[0].count, pf.waiting, pf.clearOn], [1, 1, '2026-10-15']);
assert.strictEqual(L.planLine(pf, 5), "Today's set covers everything due.");
// 第 4 级做对即掌握，不再回来
pf = L.planForecast([q('a', '2026-10-15', 4)], '2026-10-15', 5);
assert.deepStrictEqual(Array.from(pf.days, d => d.count), [1, 0, 0, 0, 0, 0, 0]);
// 题组不拆：上限 1 时整组放入
pf = L.planForecast([q('g1', '2026-10-15', 3, { setId: 'S', setPos: 1 }), q('g2', '2026-10-15', 3, { setId: 'S', setPos: 2 })], '2026-10-15', 1);
assert.strictEqual(pf.days[0].count, 2);
// 7 天清不完：needLimit 是能清完的最小上限
const pile = Array.from({ length: 30 }, (_, i) => q('p' + i, '2026-10-15', 1));
pf = L.planForecast(pile, '2026-10-15', 3);
assert.deepStrictEqual([pf.waiting, pf.clearOn], [30, null]);
assert.ok(pf.needLimit > 3 && L.planForecast(pile, '2026-10-15', pf.needLimit).clearOn !== null && L.planForecast(pile, '2026-10-15', pf.needLimit - 1).clearOn === null);
assert.strictEqual(L.planLine(pf, 3), `At 3 a day, you won't catch up in the next 7 days. ${pf.needLimit} a day would.`);
// 50 也清不完
const huge = Array.from({ length: 400 }, (_, i) => q('h' + i, '2026-10-15', 1));
pf = L.planForecast(huge, '2026-10-15', 10);
assert.deepStrictEqual([pf.clearOn, pf.needLimit], [null, null]);
assert.strictEqual(L.planLine(pf, 10), "At 10 a day, you won't catch up in the next 7 days.");
// 本周的周一
assert.strictEqual(L.weekStart('2026-10-12'), '2026-10-12');   // 周一
assert.strictEqual(L.weekStart('2026-10-18'), '2026-10-12');   // 周日
assert.strictEqual(L.weekStart('2026-11-01'), '2026-10-26');   // 跨月
// 目标进度：有作答的天数、完成的检验卷（旧卷用 createdAt；未完成不算）
const gx = [{ attempts: [at('2026-10-12', 'right'), at('2026-10-13', 'wrong')] }, { attempts: [at('2026-10-13', 'right'), at('2026-10-11', 'right')] }];
const gp = [{ status: 'done', finishedAt: '2026-10-14T19:00', createdAt: '2026-10-10' }, { status: 'done', createdAt: '2026-10-12' },
  { status: 'open', createdAt: '2026-10-13' }, { status: 'done', finishedAt: '2026-10-11T08:00', createdAt: '2026-10-11' }];
assert.deepStrictEqual({ ...L.goalProgress(gx, gp, '2026-10-12', '2026-10-18') }, { days: 2, papers: 2 });
// 回顾：最近 7 天（含今天）
const T1 = '2026-10-20';
const rx = [
  { id: 'r1', subject: 'english', topic: 'en-prep', concept: 'en-pp-fixed', step: 2, mastered: false, due: '2026-10-22',
    attempts: [at('2026-10-13', 'wrong'), at('2026-10-14', 'wrong'), at('2026-10-19', 'right'), at('2026-10-20', 'wrong')] },
  { id: 'r2', subject: 'english', topic: 'en-prep', concept: 'en-pp-fixed', step: 1, mastered: false, due: '2026-10-19',
    attempts: [at('2026-10-18', 'wrong'), at('2026-10-18', 'wrong')] },
  { id: 'r3', subject: 'science', topic: 'S-elec', concept: null, step: 4, mastered: false, due: '2026-10-25', attempts: [] }];
let wr = L.weekReview(rx, [], T1);
assert.deepStrictEqual([wr.from, wr.questions, wr.answers, wr.right, wr.partial, wr.wrong, wr.practised, wr.overdue],
  ['2026-10-14', 2, 5, 1, 0, 4, 4, 1]);                                   // 13 号不在窗口；14 号在
assert.deepStrictEqual([wr.days.length, wr.days[0].date, { ...wr.days[6] }], [7, '2026-10-14', { date: '2026-10-20', right: 0, partial: 0, wrong: 1 }]);
assert.deepStrictEqual({ ...wr.topWrong }, { subject: 'english', topic: 'en-prep', n: 4 });
assert.deepStrictEqual([wr.newlyMastered.length, wr.fallback], [0, 'Almost there: 1 question is at step 4.']);
rx[2].step = 3;
assert.strictEqual(L.weekReview(rx, [], T1).fallback, '1 question moved up the ladder in the last 7 days.');
assert.strictEqual(L.weekReview(rx.slice(1), [], T1).fallback, '');
// 新掌握按概念分组，没填概念的按专题
const mm = (id, concept, topic, d) => ({ id, subject: 'english', topic, concept, mastered: true, step: 4, due: null, attempts: four(d) });
const nm = L.weekReview([mm('k1', 'en-pp-fixed', 'en-prep', ['2026-10-05', '2026-10-06', '2026-10-08', '2026-10-15']),
  mm('k2', 'en-pp-fixed', 'en-prep', ['2026-10-05', '2026-10-06', '2026-10-08', '2026-10-14']),
  mm('k3', null, 'en-tense', ['2026-10-05', '2026-10-06', '2026-10-08', '2026-10-20']),
  mm('k4', 'en-c-coord', 'en-conj', ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-13'])], [], T1);   // k4 在窗口外
assert.deepStrictEqual(Array.from(nm.newlyMastered, g => [g.kind, g.id, g.n]), [['concept', 'en-pp-fixed', 2], ['topic', 'en-tense', 1]]);
assert.strictEqual(nm.fallback, '');
// 三行对比；检验卷目标为 0 时不出这一行
const S6 = { dailyLimit: 10, practiceDays: 6, papersPerWeek: 1 };
assert.deepStrictEqual(Array.from(L.goalChecks(wr, S6), c => [c.key, c.ok]), [['days', false], ['papers', false], ['overdue', false]]);
assert.deepStrictEqual(Array.from(L.goalChecks(wr, { practiceDays: 4, papersPerWeek: 0 }), c => [c.key, c.ok]), [['days', true], ['overdue', false]]);
// 建议
const nameT = t => t.topic;
const okPlan = { clearOn: '2026-10-20', waiting: 2, needLimit: null };
let ch = L.goalChecks(wr, S6);
assert.deepStrictEqual(Array.from(L.weekTips(okPlan, wr, ch, S6, nameT)), [
  '1 question is overdue — do it first.',
  'Little and often: aim for 6 days a week — you practised on 4 of the last 7.',
  'Make a check paper on en-prep.']);                                    // 最多 3 条，④ 被挤掉
assert.deepStrictEqual(Array.from(L.weekTips({ clearOn: null, waiting: 65, needLimit: 30 }, wr, ch, S6, nameT)).slice(0, 1),
  ['65 questions are waiting. Doing 30 a day clears them in the next 7 days — change the daily limit in 设置.']);
assert.deepStrictEqual(Array.from(L.weekTips({ clearOn: null, waiting: 400, needLimit: null }, wr, ch, S6, nameT)).slice(0, 1),
  ['400 questions are waiting — do your redo every day, oldest first.']);
// 天数、检验卷都达到、没有过期：只剩 ④；错 3 次出 ④，2 次不出
const good = { practised: 6, papersDone: 1, overdue: 0, topWrong: { subject: 'english', topic: 'en-prep', n: 3 } };
ch = L.goalChecks(good, S6);
assert.deepStrictEqual(Array.from(L.weekTips(okPlan, good, ch, S6, nameT)), ['Read the Key idea again for en-prep before you redo it.']);
good.topWrong.n = 2;
assert.deepStrictEqual(Array.from(L.weekTips(okPlan, good, ch, S6, nameT)), ['Great week — keep the same rhythm!']);
// 检验卷没做够、最近 7 天没错：组混合专题
const noWrong = { practised: 6, papersDone: 0, overdue: 0, topWrong: null };
assert.deepStrictEqual(Array.from(L.weekTips(okPlan, noWrong, L.goalChecks(noWrong, S6), S6, nameT)), ['Make a check paper on mixed topics.']);
// 周一、最近 7 天没练、检验卷目标为 0、没有积压：不说 Great week
const idle = { practised: 0, papersDone: 0, overdue: 0, topWrong: null }, S0 = { dailyLimit: 10, practiceDays: 6, papersPerWeek: 0 };
assert.deepStrictEqual(Array.from(L.weekTips(okPlan, idle, L.goalChecks(idle, S0), S0, nameT)),
  ['Little and often: aim for 6 days a week — you practised on 0 of the last 7.']);
console.log('all logic tests passed');
