const fs = require('fs'), vm = require('vm'), assert = require('assert');
// 用法：node app/logic.test.js app/arena.html —— 抽出 arena.html 里 LOGIC:BEGIN 到 LOGIC:END 的纯函数断言；这些断言就是页面规则的规格。
const html = fs.readFileSync(process.argv[2], 'utf8');
const src = html.slice(html.indexOf('/* LOGIC:BEGIN'), html.indexOf('/* LOGIC:END */'));
const ctx = {}; vm.createContext(ctx); vm.runInContext(src + ';this.L={dailyBySubject,deriveState,judgeAuto,dailyList,drawPaper,paperLayout,matchShort,addDays,tally,localToday,paperAttempts,paperScore,mustUseCheck,parseList,parseExplanation,sortExercises,pageSlice,toYaml,exportData,streakInfo,masteredOn,dashboardData,helloStats,readSettings,weekStart,goalProgress,weekReview,dayRates,axisMax,reviewLine,keyIdeaTip,goalLines,weekPlan,ladderAt,weekLadders,topicSummary,dailyGroups,dueSplit,viewFor,ownedBy,attemptGroups,todayScope,isDaily,handedInAt,makeDailyPaper,openDailyPaper,visiblePapers,dueByDay,subjectBatch,dueNowIds,todayPapers,paperProgress,todayCounts,leftMix,ladderInput,ladderShares,subjectSummary,matchesQuery,filterPapers,sortPapers,runMarks,sheetMarks,unansweredNos,paperName,pagerSlots,coinsFor,paperCoins,maxExtra,stakeOf,roundPoints,scoreboard,entrants,liftRound,liftChances,podium,matchTotals,weekMatches};', ctx);
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
// mastered: a later wrong resets; right/partial keeps (deriveState sees only the ladder input, see ladderInput below)
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
// daily list: not mastered, due <= today, never-done first (no ladder-input attempt, by recorded time), then least recently used (last ladder-input attempt), capped
const da = (date, result, mode, at) => Object.assign({ by: 'uA', date, result, mode: mode || 'daily' }, at ? { at } : {});
const ex = [
  { id: 'a', due: '2026-10-14', createdAt: '2026-10-01', mastered: false, attempts: [da('2026-10-12', 'right', 'daily', '2026-10-12T09:00')] },
  { id: 'b', due: '2026-10-10', createdAt: '2026-10-02', mastered: false, attempts: [da('2026-10-09', 'wrong')] },
  { id: 'c', due: '2026-10-15', createdAt: '2026-10-03', mastered: false },
  { id: 'd', due: null, createdAt: '2026-10-03', mastered: true },
  { id: 'e', due: '2026-10-10', createdAt: '2026-10-01', mastered: false, attempts: [] },
  // 检验卷上做对的作答不算用过：键仍是 10-06
  { id: 'f', due: '2026-10-13', createdAt: '2026-10-01', mastered: false, attempts: [da('2026-10-06', 'right'), da('2026-10-13', 'right', 'paper')] },
  // 只有 date 的作答按当天 0 点：h（10-09 08:30）排在 b（10-09 00:00）之后
  { id: 'h', due: '2026-10-11', createdAt: '2026-10-01', mastered: false, attempts: [da('2026-10-09', 'partial', 'daily', '2026-10-09T08:30')] },
  // 没做过的取录入时刻：k 有 recordedAt（10-01 07:00），排在只有 createdAt、按当天 0 点算的 e 之后
  { id: 'k', due: '2026-10-14', createdAt: '2026-10-01', recordedAt: '2026-10-01T07:00', mastered: false },
  // 没做过的先出：n 10-13 才录入，晚于全部做过的题的最后作答，仍排在它们前面
  { id: 'n', due: '2026-10-14', createdAt: '2026-10-13', recordedAt: '2026-10-13T08:00', mastered: false },
  // 只在检验卷上做对过的算没做过：p 10-13 录入，也排在做过的题前面
  { id: 'p', due: '2026-10-14', createdAt: '2026-10-13', recordedAt: '2026-10-13T09:00', mastered: false, attempts: [da('2026-10-13', 'right', 'paper', '2026-10-13T20:00')] }];
assert.deepStrictEqual(ids(L.dailyList(ex, '2026-10-14', 10)), ['e', 'k', 'n', 'p', 'f', 'b', 'h', 'a']);
assert.deepStrictEqual(ids(L.dailyList(ex, '2026-10-14', 2)), ['e', 'k']);
// 检验卷上做错的作答算用过（推阶梯）：x 算做过，排在没做过的 y 后面（这一例按最久没用排也是同样结果）
assert.deepStrictEqual(ids(L.dailyList([
  { id: 'x', due: '2026-10-14', createdAt: '2026-10-01', mastered: false, attempts: [da('2026-10-13', 'wrong', 'paper')] },
  { id: 'y', due: '2026-10-14', createdAt: '2026-10-05', mastered: false }], '2026-10-14', 10)), ['y', 'x']);
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
  { id: 'q4', setId: 'S', setPos: 2, due: '2026-10-13', createdAt: '2026-10-01', mastered: false, attempts: [da('2026-10-11', 'right')] },
  { id: 'q2', setId: 'S', setPos: 1, due: '2026-10-14', createdAt: '2026-10-01', mastered: false, attempts: [da('2026-10-13', 'partial')] },
  { id: 'q5', setId: 'S', setPos: 3, due: '2026-10-16', createdAt: '2026-10-01', mastered: false, attempts: [da('2026-10-01', 'right')] },
  { id: 's2', due: '2026-10-14', createdAt: '2026-10-02', mastered: false },
  { id: 's3', due: '2026-10-14', createdAt: '2026-10-03', mastered: false, attempts: [da('2026-10-12', 'right', 'daily', '2026-10-12T08:00')] }];
// 逐题排：没做过的 s2（10-02）、s1（10-05），再按最后作答 q4（10-11）、s3（10-12）、q2（10-13）；q5 未到期不挑
// 挑中的同组题连排：q2 接在组内第一道挑中的 q4 的位置，组内按 setPos
assert.deepStrictEqual(ids(L.dailyList(g, '2026-10-14', 10)), ['s2', 's1', 'q2', 'q4', 's3']);
// 上限 3：逐题取前三道 s2、s1、q4，同组的 q2 等以后的批次
assert.deepStrictEqual(ids(L.dailyList(g, '2026-10-14', 3)), ['s2', 's1', 'q4']);
// 上限是确数：去掉 s1、s2 后上限 1 只挑 q4，不整组放入
assert.deepStrictEqual(ids(L.dailyList(g.filter(e => e.id !== 's1' && e.id !== 's2'), '2026-10-14', 1)), ['q4']);
// 排序键相同（同一分钟录入）时先按题组（独立题在前），组内按 setPos，再按 id：题组被上限切开时先出组内最前面的几道
const tieAt = '2026-10-10T09:00';
const tieSet = done => [['a1', 'T', 3], ['b1', 'U', 1], ['b2', 'U', 2], ['k', null, null], ['x1', 'T', 2], ['y1', 'T', 1]].map(([id, setId, setPos]) =>
  Object.assign({ id, due: '2026-10-14', createdAt: '2026-10-10', recordedAt: tieAt, mastered: false, attempts: done ? [da('2026-10-12', 'right', 'daily', '2026-10-12T08:00')] : [] }, setId ? { setId, setPos } : {}));
// 按 id 会挑 a1（T3）、b1、b2（U1、U2）；按新规则挑 k、T1、T2
assert.deepStrictEqual(ids(L.dailyList(tieSet(false), '2026-10-14', 3)), ['k', 'y1', 'x1']);
assert.deepStrictEqual(ids(L.dailyList(tieSet(false), '2026-10-14', 10)), ['k', 'y1', 'x1', 'a1', 'b1', 'b2']);
// 做过且作答时刻相同（同一张卷上一起交）时同样
assert.deepStrictEqual(ids(L.dailyList(tieSet(true), '2026-10-14', 3)), ['k', 'y1', 'x1']);
// setPos 按数值比：12 道一组，上限 3 挑 1、2、3（按字符串比会挑 1、10、11）
const big = Array.from({ length: 12 }, (_, i) => ({ id: 'g' + (i + 1), setId: 'B', setPos: i + 1, due: '2026-10-14', createdAt: '2026-10-10', recordedAt: tieAt, mastered: false }));
assert.deepStrictEqual(ids(L.dailyList(big, '2026-10-14', 3)), ['g1', 'g2', 'g3']);
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
const exd = L.exportData([{ id: 'x1', images: ['i1', 'i2'], attempts: [{ paperId: 'P1', result: 'right', by: 'uS' }, { paperId: 'P1', result: 'wrong', by: 'uA' }] }], [{ id: 's1', images: [] }],
  [{ id: 'P1', exerciseIds: ['x1'], owner: 'uS' }], { dailyLimit: 10 }, '2026-10-14T20:00', ['uS', 'uA']);
// 原文档导出：全部作答都在；卷子不附得分
assert.deepStrictEqual([exd.exportedAt, exd.exercises[0].images, exd.exercises[0].attempts.length, exd.sets[0].images, 'score' in exd.papers[0], exd.papers[0].owner, exd.settings.dailyLimit, Array.from(exd.users)],
  ['2026-10-14T20:00', 2, 2, 0, false, 'uS', 10, ['uS', 'uA']]);
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
// 看板数据
const dex = [mA, mB, mC, { attempts: [at('2026-10-20', 'partial'), at('2026-10-07', 'wrong')], mastered: false, step: 2 }, { attempts: [], mastered: false, step: 1 }];
mA.step = 4; mB.step = 4;
const dd = L.dashboardData(dex, dex, T0);
assert.deepStrictEqual([dd.total, dd.mastered, dd.newMastered7, dd.newMasteredToday], [5, 2, 2, 0]);
assert.deepStrictEqual([dd.days.length, dd.days[0].date, dd.days[13].date], [14, '2026-10-07', '2026-10-20']);
assert.deepStrictEqual({ ...dd.days[0] }, { date: '2026-10-07', right: 3, partial: 0, wrong: 1 });   // 含边界第 1 天
assert.deepStrictEqual({ ...dd.days[13] }, { date: '2026-10-20', right: 0, partial: 1, wrong: 0 });
assert.deepStrictEqual({ ...dd.ladder }, { 1: 2, 2: 1, 3: 0, 4: 0, mastered: 2 });
// 问候行的今天对了几题只数每日重做，检验卷不算
const dEnc = L.dashboardData([], [{ id: 'z', createdAt: '2026-10-01', attempts: [{ date: T0, result: 'right', mode: 'daily' }, { date: T0, result: 'wrong', mode: 'daily' }, { date: T0, result: 'right', mode: 'paper' }] }], T0);
assert.strictEqual(dEnc.todayRight, 1);
// 问候统计：顺序、隐藏零新掌握、保留零对题数与连续天数、连续一天
assert.deepStrictEqual(Array.from(L.helloStats({ todayRight: 30, newMasteredToday: 2, streak: 3 })), ['✅ 30 right today', '🏅 2 mastered today', '🔥 3-day streak']);
assert.deepStrictEqual(Array.from(L.helloStats({ todayRight: 5, newMasteredToday: 0, streak: 2 })), ['✅ 5 right today', '🔥 2-day streak']);
assert.deepStrictEqual(Array.from(L.helloStats({ todayRight: 0, newMasteredToday: 0, streak: 0 })), ['✅ 0 right today', '🔥 0-day streak']);
assert.deepStrictEqual(Array.from(L.helloStats({ todayRight: 1, newMasteredToday: 1, streak: 1 })), ['✅ 1 right today', '🏅 1 mastered today', '🔥 1-day streak']);
// 问候行加余额与本周的星：有新掌握时五项、没有时四项；星可以是半颗；单复数
assert.deepStrictEqual(Array.from(L.helloStats({ todayRight: 4, newMasteredToday: 1, streak: 2 }, { coins: 54, stars: 3 })), ['✅ 4 right today', '🏅 1 mastered today', '🔥 2-day streak', '🪙 54 coins', '⭐ 3 stars']);
assert.deepStrictEqual(Array.from(L.helloStats({ todayRight: 0, newMasteredToday: 0, streak: 0 }, { coins: 1, stars: 1.5 })), ['✅ 0 right today', '🔥 0-day streak', '🪙 1 coin', '⭐ 1.5 stars']);
assert.deepStrictEqual(Array.from(L.helloStats({ todayRight: 0, newMasteredToday: 0, streak: 0 }, { coins: 0, stars: 1 })).slice(2), ['🪙 0 coins', '⭐ 1 star']);
// todo 与 done 分开：掌握进度与阶梯分布只看 todo；作答、连续天数看 done
const ds = L.dashboardData([dex[4]], dex, T0);
assert.deepStrictEqual([ds.total, ds.mastered, { ...ds.ladder }, ds.streak, ds.newMastered7], [1, 0, { 1: 1, 2: 0, 3: 0, 4: 0, mastered: 0 }, 2, 2]);
// 设置：缺字段与非数按默认，超出范围收紧，0 保留
assert.deepStrictEqual({ ...L.readSettings(null) }, { dailyLimit: 10, practiceDays: 6, papersPerWeek: 1, defaultOwner: null });
assert.deepStrictEqual({ ...L.readSettings({ dailyLimit: 18 }) }, { dailyLimit: 18, practiceDays: 6, papersPerWeek: 1, defaultOwner: null });
assert.deepStrictEqual({ ...L.readSettings({ dailyLimit: 0, practiceDays: 9, papersPerWeek: 0 }) }, { dailyLimit: 1, practiceDays: 7, papersPerWeek: 0, defaultOwner: null });
assert.deepStrictEqual({ ...L.readSettings({ dailyLimit: 'x', practiceDays: -2, papersPerWeek: 5 }) }, { dailyLimit: 10, practiceDays: 1, papersPerWeek: 3, defaultOwner: null });
// 默认归属人：用户 id 照读；缺省、空串、非字符串、null 都读成本人
assert.strictEqual(L.readSettings({ defaultOwner: 'u_S' }, 'u_me').defaultOwner, 'u_S');
assert.strictEqual(L.readSettings(null, 'u_me').defaultOwner, 'u_me');
assert.strictEqual(L.readSettings({ defaultOwner: '' }, 'u_me').defaultOwner, 'u_me');
assert.strictEqual(L.readSettings({ defaultOwner: 7 }, 'u_me').defaultOwner, 'u_me');
assert.strictEqual(L.readSettings({ defaultOwner: null }, 'u_me').defaultOwner, 'u_me');
// 未来 7 天每天的题数：今天一格是今天做过（每日重做）与此刻到期的并集；其后各天按「到期的题都在到期那天做对」推算：
// 过期的算今天，做对后升一级、隔 1、2、4、7 天再来，第 4 次重做后不再出现；已掌握、没有 due 的不算（今天做过的除外）
const q = (id, due, extra) => Object.assign({ id, due, createdAt: '2026-10-01', mastered: false }, extra || {});
const dbd = L.dueByDay([q('o', '2026-10-13'), q('t', '2026-10-15'), q('a', '2026-10-16'), q('b', '2026-10-16'), q('z', '2026-10-21'), q('far', '2026-10-30'), q('m', '2026-10-15', { mastered: true }), q('n', null), q('s4', '2026-10-16', { step: 4 })], '2026-10-15');
// o、t：今天做对 → 17（隔 2 天）→ 21（隔 4 天）；a、b：16 → 18 → 22（超出）；z：21；s4：16 之后掌握，不再出现
assert.deepStrictEqual(Array.from(dbd, d => [d.date.slice(8), d.count]), [['15', 2], ['16', 3], ['17', 2], ['18', 2], ['19', 0], ['20', 0], ['21', 3]]);
// Today 说明行：过期与今天到期各几题，已掌握的不算
assert.deepStrictEqual({ ...L.dueSplit([q('o', '2026-10-13'), q('t', '2026-10-15'), q('a', '2026-10-16'), q('m', '2026-10-12', { mastered: true }), q('n', null)], '2026-10-15') }, { overdue: 1, today: 1 });
// 今天一格：算进今天做过、已不到期的题与今天做到掌握的题；仍到期的只算一次；只在检验卷上做过的不算；等于 Today 的「一共」
const DD = (id, due, atts, extra) => Object.assign({ id, subject: 'english', due, mastered: false, attempts: atts }, extra || {});
const dd2 = [DD('due', '2026-10-15', []), DD('doneMoved', '2026-10-17', [{ by: 'uA', date: '2026-10-15', result: 'right', mode: 'daily' }]), DD('doneStill', '2026-10-15', [{ by: 'uA', date: '2026-10-15', result: 'partial', mode: 'daily' }]),
  DD('doneMastered', null, [{ by: 'uA', date: '2026-10-15', result: 'right', mode: 'daily' }], { mastered: true }), DD('paperOnly', '2026-10-16', [{ by: 'uA', date: '2026-10-15', result: 'wrong', mode: 'paper', paperId: 'PX' }]), DD('later', '2026-10-17', [])];
assert.deepStrictEqual(Array.from(L.dueNowIds(dd2, '2026-10-15')), ['due', 'doneStill']);
assert.deepStrictEqual([L.dueByDay(dd2, '2026-10-15')[0].count, L.dueByDay(dd2, '2026-10-15')[2].count], [4, 4]);   // 17 号：due、doneStill 今天做对后到，doneMoved、later 本来就在
assert.strictEqual(L.dueByDay(dd2, '2026-10-15')[0].count, L.todayCounts(dd2, '2026-10-15', L.dueNowIds(dd2, '2026-10-15')).total.all);
// 一科的一批：只在这一科里装，每科各算一批
const sb = [q('e1', '2026-10-14', { subject: 'english' }), q('e2', '2026-10-15', { subject: 'english' }), q('e3', '2026-10-15', { subject: 'english' }), q('m1', '2026-10-15', { subject: 'math' }), q('e4', '2026-10-16', { subject: 'english' })];
assert.deepStrictEqual([ids(L.subjectBatch(sb, '2026-10-15', 2, 'english')), ids(L.subjectBatch(sb, '2026-10-15', 2, 'math')), ids(L.subjectBatch(sb, '2026-10-15', 2, 'science'))], [['e1', 'e2'], ['m1'], []]);
// 本周的周一
assert.strictEqual(L.weekStart('2026-10-12'), '2026-10-12');   // 周一
assert.strictEqual(L.weekStart('2026-10-18'), '2026-10-12');   // 周日
assert.strictEqual(L.weekStart('2026-11-01'), '2026-10-26');   // 跨月
// 目标进度：有作答的天数、我做完的检验卷（完成日取本卷作答最晚的 at，没有 at 取 date；没做的不算）
const pa = (paperId, date, atT) => Object.assign({ date, result: 'right', mode: 'paper', paperId }, atT ? { at: atT } : {});
const gx = [{ attempts: [at('2026-10-12', 'right'), at('2026-10-13', 'wrong'), pa('G1', '2026-10-14', '2026-10-14T19:00'), pa('G2', '2026-10-12'), pa('G4', '2026-10-11', '2026-10-11T08:00')] },
  { attempts: [at('2026-10-13', 'right'), at('2026-10-11', 'right'), pa('G1', '2026-10-14', '2026-10-14T19:05')] }];
const gp = [{ id: 'G1' }, { id: 'G2' }, { id: 'G3' }, { id: 'G4' }];
assert.deepStrictEqual({ ...L.goalProgress(gx, gp, '2026-10-12', '2026-10-18', 'uS') }, { days: 3, papers: 2 });
// 回顾：按区间（含两端）；这里取最近 7 天（含今天）
const T1 = '2026-10-20';
const rx = [
  { id: 'r1', subject: 'english', topic: 'en-prep', concept: 'en-pp-fixed', step: 2, mastered: false, due: '2026-10-22',
    attempts: [at('2026-10-13', 'wrong'), at('2026-10-14', 'wrong'), at('2026-10-19', 'right'), at('2026-10-20', 'wrong')] },
  { id: 'r2', subject: 'english', topic: 'en-prep', concept: 'en-pp-fixed', step: 1, mastered: false, due: '2026-10-19',
    attempts: [at('2026-10-18', 'wrong'), at('2026-10-18', 'wrong')] },
  { id: 'r3', subject: 'science', topic: 'S-elec', concept: null, step: 4, mastered: false, due: '2026-10-25', attempts: [] }];
let wr = L.weekReview(rx, [], L.addDays(T1, -6), T1);
assert.deepStrictEqual([wr.from, wr.to, wr.questions, wr.answers, wr.right, wr.partial, wr.wrong, wr.practised, 'moved' in wr],
  ['2026-10-14', T1, 2, 5, 1, 0, 4, 4, false]);                            // 13 号不在窗口；14 号在；不再数升级
assert.deepStrictEqual([wr.days.length, wr.days[0].date, { ...wr.days[6] }], [7, '2026-10-14', { date: '2026-10-20', right: 0, partial: 0, wrong: 1 }]);
assert.deepStrictEqual({ ...wr.topWrong }, { subject: 'english', topic: 'en-prep', n: 4 });
assert.strictEqual(wr.newlyMastered.length, 0);
// 区间里今天以后的天为 0（This week 用本周一到本周日）
const wk = L.weekReview(rx, [], '2026-10-19', '2026-10-25');
assert.deepStrictEqual([wk.days.length, wk.answers, { ...wk.days[1] }, { ...wk.days[6] }], [7, 2, { date: '2026-10-20', right: 0, partial: 0, wrong: 1 }, { date: '2026-10-25', right: 0, partial: 0, wrong: 0 }]);
// 统计行：不再写升级
assert.strictEqual(L.reviewLine(wr), '5 answers: 1 right · 0 partly · 4 wrong · practised on 4 of 7 days');
assert.strictEqual(L.reviewLine({ answers: 1, right: 1, partial: 0, wrong: 0, practised: 1 }), '1 answer: 1 right · 0 partly · 0 wrong · practised on 1 of 7 days');
// 新掌握按概念分组，没填概念的按专题
const mm = (id, concept, topic, d) => ({ id, subject: 'english', topic, concept, mastered: true, step: 4, due: null, attempts: four(d) });
const nmx = [mm('k1', 'en-pp-fixed', 'en-prep', ['2026-10-05', '2026-10-06', '2026-10-08', '2026-10-15']),
  mm('k2', 'en-pp-fixed', 'en-prep', ['2026-10-05', '2026-10-06', '2026-10-08', '2026-10-14']),
  mm('k3', null, 'en-tense', ['2026-10-05', '2026-10-06', '2026-10-08', '2026-10-20']),
  mm('k4', 'en-c-coord', 'en-conj', ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-13'])];
const nm = L.weekReview(nmx, [], L.addDays(T1, -6), T1);   // k4 在窗口外
assert.deepStrictEqual(Array.from(nm.newlyMastered, g => [g.kind, g.id, g.n]), [['concept', 'en-pp-fixed', 2], ['topic', 'en-tense', 1]]);
// Today 的重读讲解：最近 7 天某专题错 3 次以上才出，2 次不出
const nameT = t => t.topic;
assert.strictEqual(L.keyIdeaTip(wr, nameT), 'Read the Key idea again for en-prep before you redo it.');
assert.strictEqual(L.keyIdeaTip({ topWrong: { subject: 'english', topic: 'en-prep', n: 2 } }, nameT), '');
assert.strictEqual(L.keyIdeaTip({ topWrong: null }, nameT), '');
// This week 的目标句：达到；来得及（0 天、非 0 天）；来不及（0 天、非 0 天）；检验卷达到、没达到（没有专题时 mixed topics）；每周 0 张时没有检验卷一行
const GL = (g, st, today, pt, topic) => Array.from(L.goalLines(g, st, today, '2026-10-25', pt, topic), x => [x.ok, x.text]);
const st6 = { practiceDays: 6, papersPerWeek: 1 };
assert.deepStrictEqual(GL({ days: 6, papers: 1 }, st6, '2026-10-24', true, 'en-prep'), [[true, '🎉 6 practice days — goal reached!'], [true, '✓ 1 check paper done — nice work!']]);
assert.deepStrictEqual(GL({ days: 0, papers: 0 }, st6, '2026-10-20', false, 'en-prep'), [[false, 'New week, fresh start — practise on 6 days to reach your goal.'], [false, "A check paper shows what you've mastered — try one on en-prep."]]);
assert.deepStrictEqual(GL({ days: 3, papers: 0 }, st6, '2026-10-22', true, ''), [[false, '3 days done — 3 more to reach 6. Keep going!'], [false, "A check paper shows what you've mastered — try one on mixed topics."]]);
assert.deepStrictEqual(GL({ days: 3, papers: 2 }, { practiceDays: 6, papersPerWeek: 2 }, '2026-10-23', false, '')[0], [false, '3 days done — 3 more to reach 6. Keep going!']);   // 23 号没练：23、24、25 三天
assert.deepStrictEqual(GL({ days: 3, papers: 2 }, { practiceDays: 6, papersPerWeek: 2 }, '2026-10-23', false, '')[1], [true, '✓ 2 check papers done — nice work!']);
assert.deepStrictEqual(GL({ days: 1, papers: 0 }, st6, '2026-10-24', true, '')[0], [false, '1 day done this week — every day counts!']);
assert.deepStrictEqual(GL({ days: 0, papers: 0 }, st6, '2026-10-24', false, '')[0], [false, 'Every day counts — start today!']);
assert.strictEqual(L.goalLines({ days: 2, papers: 0 }, { practiceDays: 3, papersPerWeek: 0 }, '2026-10-22', true, '').length, 1);
// 按用户：视图只留本人作答、阶梯各算各的；没有作答时为起点
const by = (u, date, result, extra) => Object.assign({ by: u, date, result, mode: 'daily' }, extra || {});
const shared = [
  { id: 'v1', createdAt: '2026-10-12', owner: 'uS', subject: 'science', topic: 'C-water', attempts: [by('uS', '2026-10-13', 'right'), by('uA', '2026-10-13', 'wrong')] },
  { id: 'v2', createdAt: '2026-10-12', subject: 'science', topic: 'C-water', attempts: [by('uS', '2026-10-13', 'wrong'), by('uS', '2026-10-14', 'wrong')] },
  { id: 'v3', createdAt: '2026-10-12', owner: null, subject: 'science', topic: 'C-water', attempts: [] }];
const vS = L.viewFor(shared, 'uS'), vA = L.viewFor(shared, 'uA'), vX = L.viewFor(shared, 'uX');
assert.deepStrictEqual([vS[0].step, vS[0].due, vA[0].step, vA[0].due, vA[0].wrongCount], [2, '2026-10-15', 1, '2026-10-14', 2]);
assert.deepStrictEqual([vS[0].attempts.length, vS[0].allAttempts.length, shared[0].attempts.length], [1, 2, 2]);   // 原文档不动
assert.deepStrictEqual([vX[1].step, vX[1].due, vX[1].wrongCount, vX[1].lastAttemptAt, vX[1].mastered], [1, '2026-10-13', 1, null, false]);   // 起点
// 归属人：按 id 筛；没有归属人的错题不属于任何人
assert.deepStrictEqual(ids(L.ownedBy(shared, 'uS')), ['v1']);
assert.deepStrictEqual(ids(L.ownedBy(shared, 'uA')), []);
// Today 的范围：todo 只含默认归属人的错题，done 含全部
let sc = L.todayScope(shared, 'uA', 'uS');
assert.deepStrictEqual([ids(sc.todo), ids(sc.done), sc.todo[0].step], [['v1'], ['v1', 'v2', 'v3'], 1]);
// 作答按人分组，我在最前，下标指原数组
const ag = L.attemptGroups(vA[0], 'uA');
assert.deepStrictEqual(Array.from(ag, g => [g.by, Array.from(g.items, x => x.i)]), [['uA', [1]], ['uS', [0]]]);
assert.deepStrictEqual(Array.from(L.attemptGroups(vS[0], 'uS'), g => g.by), ['uS', 'uA']);
// 检验卷按人：完成时刻取本人作答最晚的 at，没有 at 取 date；没做为 null
const PX = { id: 'PX', owner: 'uS', exerciseIds: ['w1', 'w2'] }, PY = { id: 'PY', owner: 'uS', exerciseIds: ['w1'] }, PZ = { id: 'PZ', exerciseIds: ['w2'] };
const pw = [
  { id: 'w1', createdAt: '2026-10-10', attempts: [by('uS', '2026-10-14', 'right', { mode: 'paper', paperId: 'PX', at: '2026-10-14T19:40' }), by('uS', '2026-10-15', 'right', { mode: 'paper', paperId: 'PY' })] },
  { id: 'w2', createdAt: '2026-10-10', attempts: [by('uS', '2026-10-14', 'wrong', { mode: 'paper', paperId: 'PX', at: '2026-10-14T19:42' }), by('uA', '2026-10-16', 'right', { mode: 'paper', paperId: 'PX', at: '2026-10-16T08:00' })] }];
const pwS = L.viewFor(pw, 'uS'), pwA = L.viewFor(pw, 'uA');
assert.deepStrictEqual([L.handedInAt(PX, pwS, 'uS'), L.handedInAt(PY, pwS, 'uS'), L.handedInAt(PX, pwA, 'uA'), L.handedInAt(PY, pwA, 'uA')], ['2026-10-14T19:42', '2026-10-15', '2026-10-16T08:00', null]);
// 有 handedIn 时以它为准：全是主观题、交卷后没自评（没有作答）也算交过；没记我的就是没交
const PH = { id: 'PH', owner: 'uS', exerciseIds: ['w1'], handedIn: { uA: '2026-10-17T09:00' } };
assert.deepStrictEqual([L.handedInAt(PH, pwA, 'uA'), L.handedInAt(PH, pwS, 'uS')], ['2026-10-17T09:00', null]);
// 两人得分分开
assert.deepStrictEqual([{ ...L.paperScore(PX, pwS) }, { ...L.paperScore(PX, pwA) }], [{ right: 1, partial: 0, wrong: 1, total: 2 }, { right: 1, partial: 0, wrong: 0, total: 2 }]);
// 待做的卷：归属人等于我的默认归属人、我还没做
const PD = { id: 'PD', kind: 'daily', for: 'uA', owner: 'uS', createdAt: '2026-10-16', exerciseIds: ['w1'] };
assert.deepStrictEqual(ids(L.todayPapers([PX, PY, PZ, PD], pwA, 'uS', 'uA', '2026-10-17')), ['PY']);   // 每日卷不在其中；PX 不是今天交的
assert.deepStrictEqual(ids(L.todayPapers([PX, PY, PZ, PD], pwA, 'uS', 'uA', '2026-10-16')), ['PY', 'PX']);   // 今天交的列在没交的后面
assert.deepStrictEqual(ids(L.todayPapers([PX, PY, PZ], pwS, 'uS', 'uS', '2026-10-16')), []);
assert.deepStrictEqual(ids(L.todayPapers([PX, PY, PH], pwA, 'uS', 'uA', '2026-10-17')), ['PY', 'PH']);      // PH 已记 uA 今天交过
const PH2 = Object.assign({}, PH, { id: 'PH2', handedIn: { uA: '2026-10-16T07:00' } });
const PY2 = Object.assign({}, PY, { id: 'PY2', createdAt: '2026-10-15' });
const PY1 = Object.assign({}, PY, { id: 'PY1', createdAt: '2026-10-14' });
assert.deepStrictEqual(ids(L.todayPapers([PX, PH2, PY1, PY2], pwA, 'uS', 'uA', '2026-10-16')), ['PY2', 'PY1', 'PH2', 'PX']);   // 没交的组卷新的在前；交过的交卷早的在前
// 卷上的进度：卷上仍在的题数，与其中我有作答的题数
assert.deepStrictEqual([{ ...L.paperProgress(PX, pwA) }, { ...L.paperProgress(PY, pwA) }, { ...L.paperProgress(Object.assign({}, PX, { exerciseIds: ['w1', 'w2', 'gone'] }), pwA) }],
  [{ done: 1, total: 2 }, { done: 0, total: 1 }, { done: 1, total: 2 }]);
// 目标进度只数我做完的卷
assert.deepStrictEqual([L.goalProgress(pwS, [PX, PY], '2026-10-12', '2026-10-18', 'uS').papers, L.goalProgress(pwA, [PX, PY], '2026-10-12', '2026-10-18', 'uA').papers], [2, 1]);
// 每日卷不算每周检验卷目标，哪怕交过
const PD2 = Object.assign({}, PD, { handedIn: { uA: '2026-10-16T10:00' } });
assert.strictEqual(L.goalProgress(pwA, [PX, PD2], '2026-10-12', '2026-10-18', 'uA').papers, 1);
// 组卷排序：按卷子归属人的阶梯
assert.deepStrictEqual(ids(L.drawPaper(L.viewFor(shared, 'uS'), { subject: 'science', topics: [], count: 1 })), ['v2']);   // Sophia 在 v2 错 3 次
// 每日卷：按清单顺序生成，只给本人
const dpx = L.makeDailyPaper([{ id: 'q2' }, { id: 'q4' }, { id: 's1' }], 'uA', 'uS', '2026-10-16', d => 'D' + d.slice(8), 'english', '2026-10-16T07:30');
assert.strictEqual(dpx.madeAt, '2026-10-16T07:30');
assert.deepStrictEqual([dpx.kind, dpx.for, dpx.owner, dpx.title, dpx.createdAt, dpx.subject, dpx.topics.length, dpx.count, Array.from(dpx.exerciseIds)],
  ['daily', 'uA', 'uS', 'English redo · D16', '2026-10-16', 'english', 0, 3, ['q2', 'q4', 's1']]);
// 按科目分开：按 SUBJECTS 顺序（英文、数学、科学），组内保持清单顺序，题组不拆，空科目不出，各科之和等于清单
const bsx = [{ id: 'k1', subject: 'science' }, { id: 'k2', subject: 'english', setId: 'G' }, { id: 'k3', subject: 'english', setId: 'G' }, { id: 'k4', subject: 'science' }, { id: 'k5', subject: 'english' }];
const bs = L.dailyBySubject(bsx);
assert.deepStrictEqual(Array.from(bs, x => [x[0], ids(x[1])]), [['english', ['k2', 'k3', 'k5']], ['science', ['k1', 'k4']]]);
assert.strictEqual(bs.reduce((n, x) => n + x[1].length, 0), bsx.length);
assert.deepStrictEqual(Array.from(L.dailyBySubject([])), []);
// 逐题挑选、同组连排的清单再按科目分，组内的题仍连在一起：g2 录入晚于 e1，靠 paperLayout 接在 g1 后面
const bsl = L.dailyBySubject(L.dailyList([
  { id: 'm1', subject: 'math', due: '2026-10-10', createdAt: '2026-10-01', mastered: false },
  { id: 'g1', subject: 'english', setId: 'G', setPos: 1, due: '2026-10-11', createdAt: '2026-10-02', mastered: false },
  { id: 'e1', subject: 'english', due: '2026-10-12', createdAt: '2026-10-03', mastered: false },
  { id: 'g2', subject: 'english', setId: 'G', setPos: 2, due: '2026-10-13', createdAt: '2026-10-04', recordedAt: '2026-10-04T08:00', mastered: false }], '2026-10-14', 10));
assert.deepStrictEqual(Array.from(bsl, x => [x[0], ids(x[1])]), [['english', ['g1', 'g2', 'e1']], ['math', ['m1']]]);
assert.ok(L.isDaily(dpx) && !L.isDaily(PX));
// 新每日卷从哪张带回答：这一科、给我、我没交过的最新一张（不限日期）；别人的、交过的、别的科目、旧式混合卷都不取
const T16 = '2026-10-16';
const dOld = { id: 'dO', kind: 'daily', for: 'uA', createdAt: '2026-10-15', exerciseIds: [] };
const dOther = { id: 'dX', kind: 'daily', for: 'uS', createdAt: T16, exerciseIds: [] };
const dDone = { id: 'dD', kind: 'daily', for: 'uA', createdAt: T16, exerciseIds: [], handedIn: { uA: '2026-10-16T08:00' } };
const dOpen = { id: 'dN', kind: 'daily', for: 'uA', createdAt: T16, exerciseIds: [] };
const en = d => Object.assign({}, d, { id: d.id + 'e', subject: 'english' });
assert.strictEqual(L.openDailyPaper([en(dOther), en(dDone)], pwA, 'uA', 'english'), null);   // 别人的、交过的都不取
assert.strictEqual(L.openDailyPaper([en(dOld)], pwA, 'uA', 'english').id, 'dOe');                // 昨天没交的也取
assert.strictEqual(L.openDailyPaper([en(dOld), en(dOpen), Object.assign(en(dOld), { id: 'dO2', madeAt: '2026-10-15T09:00' })], pwA, 'uA', 'english').id, 'dNe');   // 取最新的一张
// 按科目取：别的科目、旧式混合卷都不被取到
const dEn = { id: 'dE', kind: 'daily', for: 'uA', createdAt: T16, subject: 'english', exerciseIds: [] };
const dSc = { id: 'dS', kind: 'daily', for: 'uA', createdAt: T16, subject: 'science', exerciseIds: [] };
assert.strictEqual(L.openDailyPaper([dOpen, dSc, dEn], pwA, 'uA', 'english').id, 'dE');
assert.strictEqual(L.openDailyPaper([dOpen, dSc], pwA, 'uA', 'english'), null);
// 列表：全部检验卷 + 我交过的每日卷；没交的（含今天的）、别人的不列
assert.deepStrictEqual(ids(L.visiblePapers([PX, dOther, dOpen, PZ, dOld, dDone, Object.assign({}, dOld, { id: 'dOH', handedIn: { uA: '2026-10-15T20:00' } })], pwA, 'uA')), ['PX', 'PZ', 'dD', 'dOH']);
// Today 的「已做/一共」：只数每日重做上今天做过的题，一题一次；检验卷、昨天的、别人的不算；还要做的与已做取并集；不在 todo 的不计；科目按 SUBJECTS 顺序，空科目不出
const tcx = L.viewFor([
  { id: 't1', subject: 'science', createdAt: '2026-10-10', attempts: [by('uA', T16, 'right', { mode: 'daily' }), by('uA', T16, 'wrong', { mode: 'paper', paperId: 'PX' })] },
  { id: 't2', subject: 'english', createdAt: '2026-10-10', attempts: [by('uA', T16, 'right', { mode: 'paper', paperId: 'PX' })] },
  { id: 't3', subject: 'english', createdAt: '2026-10-10', attempts: [by('uA', '2026-10-15', 'right', { mode: 'daily' })] },
  { id: 't4', subject: 'english', createdAt: '2026-10-10', attempts: [by('uS', T16, 'right', { mode: 'daily' })] },
  { id: 't5', subject: 'math', createdAt: '2026-10-10', attempts: [] }], 'uA');
const tc = L.todayCounts(tcx, T16, ['t2', 't3', 't4', 'zz']);
assert.deepStrictEqual(JSON.parse(JSON.stringify(tc)), { total: { done: 1, all: 4 }, bySubject: [['english', { done: 0, all: 3 }], ['science', { done: 1, all: 1 }]] });   // t2 只在检验卷上做过，不算已做
assert.deepStrictEqual(JSON.parse(JSON.stringify(L.todayCounts(tcx, T16, []))).total, { done: 1, all: 1 });
assert.deepStrictEqual(JSON.parse(JSON.stringify(L.todayCounts([], T16, ['t1']))), { total: { done: 0, all: 0 }, bySubject: [] });
// 还要做的题主要是哪些专题：不在 todo、重复的 id 不计；按题数多到少，并列按首次出现
const lmx = L.leftMix(L.viewFor([
  { id: 'l1', subject: 'english', topic: 'en-tense', createdAt: '2026-10-10', attempts: [] },
  { id: 'l2', subject: 'english', topic: 'en-vocab', createdAt: '2026-10-10', attempts: [by('uA', '2026-10-14', 'right'), by('uA', '2026-10-15', 'wrong')] },
  { id: 'l3', subject: 'english', topic: 'en-vocab', createdAt: '2026-10-10', attempts: [by('uA', '2026-10-14', 'partial'), by('uS', '2026-10-15', 'wrong')] },
  { id: 'l4', subject: 'math', topic: 'F-frac', createdAt: '2026-10-10', attempts: [by('uS', '2026-10-14', 'wrong')] }], 'uA'), ['l1', 'l2', 'l3', 'l4', 'l2', 'zz']);
assert.deepStrictEqual(JSON.parse(JSON.stringify(lmx)), { topics: [{ subject: 'english', topic: 'en-vocab', n: 2 }, { subject: 'english', topic: 'en-tense', n: 1 }, { subject: 'math', topic: 'F-frac', n: 1 }] });
// 检验卷：做对、部分对不改阶梯（不升级、不改到期、不改上次作答日）；做错与每日重做做错一样（回第 1 级、次日到期、错的次数加一、上次作答日为那天）
const PA = (d, r) => by('uA', d, r, { mode: 'paper', paperId: 'PX' });
const lad = atts => L.viewFor([{ id: 'x', createdAt: '2026-10-12', attempts: atts }], 'uA')[0];
assert.deepStrictEqual(Array.from(L.ladderInput([by('uA', '2026-10-13', 'right'), PA('2026-10-14', 'right'), PA('2026-10-14', 'partial'), PA('2026-10-15', 'wrong')]), a => a.date + a.result),
  ['2026-10-13right', '2026-10-15wrong']);
let lx = lad([by('uA', '2026-10-13', 'right'), PA('2026-10-14', 'right'), PA('2026-10-14', 'partial')]);
assert.deepStrictEqual([lx.step, lx.due, lx.wrongCount, lx.lastAttemptAt, lx.attempts.length], [2, '2026-10-15', 1, '2026-10-13', 3]);   // 全部作答仍留在 attempts
lx = lad([by('uA', '2026-10-13', 'right'), PA('2026-10-14', 'wrong')]);
assert.deepStrictEqual([lx.step, lx.due, lx.wrongCount, lx.lastAttemptAt], [1, '2026-10-15', 2, '2026-10-14']);
// 已掌握的题：检验卷做错失去掌握，做对仍掌握；检验卷上第 4 级做对不算掌握
const four4 = ['2026-10-13', '2026-10-15', '2026-10-19', '2026-10-26'].map(d => by('uA', d, 'right'));
assert.strictEqual(lad(four4.concat([PA('2026-11-01', 'right')])).mastered, true);
lx = lad(four4.concat([PA('2026-11-01', 'wrong')]));
assert.deepStrictEqual([lx.mastered, lx.step, lx.due], [false, 1, '2026-11-02']);
lx = lad(four4.slice(0, 3).concat([PA('2026-10-26', 'right')]));
assert.deepStrictEqual([lx.mastered, lx.step, L.masteredOn(lx)], [false, 4, null]);
assert.strictEqual(L.masteredOn(lad(four4)), '2026-10-26');
// 组合图的正确率线：做对的作答占当天作答的百分比，部分对不算对，取整；没有作答的那天为 null
assert.deepStrictEqual(Array.from(L.dayRates([{ right: 4, partial: 0, wrong: 6 }, { right: 0, partial: 0, wrong: 0 }, { right: 1, partial: 1, wrong: 1 }, { right: 0, partial: 2, wrong: 0 }, { right: 5, partial: 0, wrong: 0 }])), [40, null, 33, 0, 100]);
// 组合图左轴的顶：不小于最多一天的作答次数，一半也是整数
assert.deepStrictEqual([1, 2, 3, 9, 10, 11, 45, 81, 101, 1001].map(L.axisMax), [2, 2, 4, 10, 10, 20, 50, 100, 150, 2000]);
// 回顾：检验卷上的作答照数
const wp = L.viewFor([{ id: 'w', subject: 'english', topic: 'en-tense', createdAt: '2026-10-10', attempts: [PA('2026-10-18', 'right')] }], 'uA');
const wpr = L.weekReview(wp, [], L.addDays(T1, -6), T1);
assert.deepStrictEqual([wpr.answers, wpr.right, wpr.questions], [1, 1, 1]);
// 梯子各级的百分比：五项题数与百分比，百分比按最大余数补足到 100；总数为 0 时全为 0
const shr = L.ladderShares({ 1: 108, 2: 13, 3: 0, 4: 0, mastered: 0 });
assert.deepStrictEqual(Array.from(shr, x => [x.key, x.n, x.pct]), [[1, 108, 89], [2, 13, 11], [3, 0, 0], [4, 0, 0], ['mastered', 0, 0]]);
assert.strictEqual(L.ladderShares({ 1: 1, 2: 1, 3: 1, 4: 0, mastered: 0 }).reduce((t, x) => t + x.pct, 0), 100);
assert.deepStrictEqual(Array.from(L.ladderShares({ 1: 0, 2: 0, 3: 0, 4: 0, mastered: 0 }), x => x.pct), [0, 0, 0, 0, 0]);
// Exercises 的每科小结：按 SUBJECTS 顺序、没有错题的科目不出；到期、掌握、阶梯、平均错次；专题前三与错因按多到少、并列按 id 字母序，错因只含出现过的
const smx = L.viewFor([
  { id: 'm1', subject: 'science', topic: 'C-water', cause: 'concept', createdAt: '2026-10-14', attempts: [] },
  { id: 'm2', subject: 'english', topic: 'en-vocab', cause: 'concept', createdAt: '2026-10-14', attempts: [] },
  { id: 'm3', subject: 'english', topic: 'en-vocab', cause: 'careless', createdAt: '2026-10-14', attempts: [by('uA', '2026-10-15', 'right')] },
  { id: 'm4', subject: 'english', topic: 'en-prep', cause: 'careless', createdAt: '2026-10-14', attempts: [by('uA', '2026-10-15', 'wrong')] },
  { id: 'm5', subject: 'english', topic: 'en-adj', cause: 'misread', createdAt: '2026-10-14', attempts: [] },
  { id: 'm6', subject: 'english', topic: 'en-tense', cause: 'concept', createdAt: '2026-10-14', attempts: four4 }], 'uA');   // 已掌握
const sm = JSON.parse(JSON.stringify(L.subjectSummary(smx, T16)));
assert.deepStrictEqual(sm.map(x => x.subject), ['english', 'science']);
assert.deepStrictEqual([sm[0].n, sm[0].due, sm[0].mastered, sm[0].steps], [5, 3, 1, [3, 1, 0, 0]]);   // m3 在第 2 级、10-17 到期；m4 做错、10-16 到期
assert.strictEqual(sm[0].wrongAvg, 6 / 5);   // m4 错 2 次，其余 1 次
assert.deepStrictEqual(sm[0].topics, [{ topic: 'en-vocab', n: 2 }, { topic: 'en-adj', n: 1 }, { topic: 'en-prep', n: 1 }]);
assert.deepStrictEqual(sm[0].causes, [['careless', 2], ['concept', 2], ['misread', 1]]);
assert.deepStrictEqual(sm[1].causes, [['concept', 1]]);
assert.deepStrictEqual(Array.from(L.subjectSummary([], T16)), []);
// Exercises 的搜索：空词都算；忽略大小写；题组材料正文也算；[[ ]] 标记去掉后再比
assert.strictEqual(L.matchesQuery({ stem: 'Which is a fern?' }, null, '  '), true);
assert.strictEqual(L.matchesQuery({ stem: 'Which is a FERN?' }, null, 'fern'), true);
assert.strictEqual(L.matchesQuery({ stem: '(3) blank' }, { text: 'The school carnival flyer' }, 'Carnival'), true);
assert.strictEqual(L.matchesQuery({ stem: 'I [[recieve]] it' }, null, 'recieve it'), true);
assert.strictEqual(L.matchesQuery({ stem: 'Which is a fern?' }, null, 'moss'), false);
// 卷子列表：筛选（归属人、类型、科目、我交没交，空值不筛）与排序（四种键、升降、空值在后、并列按 created 新的在前再按 id）
const pv = L.viewFor([
  { id: 'e1', subject: 'english', createdAt: '2026-10-10', attempts: [by('uA', '2026-10-15', 'right', { paperId: 'D1' }), by('uA', '2026-10-14', 'right', { mode: 'paper', paperId: 'C1' })] },
  { id: 'e2', subject: 'english', createdAt: '2026-10-10', attempts: [by('uA', '2026-10-15', 'wrong', { paperId: 'D1' }), by('uA', '2026-10-14', 'right', { mode: 'paper', paperId: 'C1' })] },
  { id: 'e3', subject: 'science', createdAt: '2026-10-10', attempts: [] }], 'uA');
const pps = [
  { id: 'D1', kind: 'daily', for: 'uA', owner: 'uS', subject: 'english', createdAt: '2026-10-15', madeAt: '2026-10-15T20:00', exerciseIds: ['e1', 'e2'], handedIn: { uA: '2026-10-15T20:10' } },
  { id: 'C1', owner: 'uS', subject: 'english', createdAt: '2026-10-14', madeAt: '2026-10-14T09:00', exerciseIds: ['e1', 'e2', 'gone'], handedIn: { uA: '2026-10-14T09:30' } },
  { id: 'C2', owner: 'uS', subject: 'science', createdAt: '2026-10-16', madeAt: '2026-10-16T08:00', exerciseIds: ['e3'], handedIn: {} },
  { id: 'C3', owner: 'uB', subject: 'science', createdAt: '2026-10-13', exerciseIds: ['e3', 'e1', 'e2'] }];
const fp = f => ids(L.filterPapers(pps, f, pv, 'uA'));
assert.deepStrictEqual(fp({}), ['D1', 'C1', 'C2', 'C3']);
assert.deepStrictEqual(fp({ kind: 'daily' }), ['D1']);
assert.deepStrictEqual(fp({ kind: 'check', subject: 'science' }), ['C2', 'C3']);
assert.deepStrictEqual(fp({ owner: 'uB' }), ['C3']);
assert.deepStrictEqual(fp({ status: 'done' }), ['D1', 'C1']);
assert.deepStrictEqual(fp({ status: 'todo', owner: 'uS' }), ['C2']);
const sp = (k, d) => ids(L.sortPapers(pps, k, d, pv, 'uA'));
assert.deepStrictEqual(sp('created', 'desc'), ['C2', 'D1', 'C1', 'C3']);
assert.deepStrictEqual(sp('created', 'asc'), ['C3', 'C1', 'D1', 'C2']);
assert.deepStrictEqual(sp('done', 'desc'), ['D1', 'C1', 'C2', 'C3']);   // 没交的在后，按 created 新的在前
assert.deepStrictEqual(sp('score', 'desc'), ['C1', 'D1', 'C2', 'C3']);  // C1 2/2，D1 1/2；没交的没有分数
assert.deepStrictEqual(sp('score', 'asc'), ['D1', 'C1', 'C2', 'C3']);
assert.deepStrictEqual(sp('questions', 'desc'), ['C3', 'D1', 'C1', 'C2']);   // 题数只算卷上仍在的题：C3 3、D1 2、C1 2、C2 1；并列按 created 新的在前
// 卡片翻页条：交卷前空白算没答；交卷后主观题未自评为 tomark、客观题按结果；没答的题号从 1 起
const rmx = [{ id: 'r1', format: 'mcq' }, { id: 'r2', format: 'short' }, { id: 'r3', format: 'open' }, { id: 'r4', format: 'open' }];
assert.deepStrictEqual(Array.from(L.runMarks(rmx, 'answer', { r1: 'B', r2: '  ', r4: 'It melts.' }, {}, {})), ['answered', 'todo', 'todo', 'answered']);
assert.deepStrictEqual(Array.from(L.unansweredNos(L.runMarks(rmx, 'answer', { r1: 'B', r2: '  ', r4: 'It melts.' }, {}, {}))), [2, 3]);
assert.deepStrictEqual(Array.from(L.runMarks(rmx, 'review', {}, { r1: 'right', r2: 'wrong', r4: 'partial' }, { r4: true })), ['right', 'wrong', 'tomark', 'partial']);
assert.deepStrictEqual(Array.from(L.sheetMarks([{ ex: null }, { ex: {}, attempt: null }, { ex: {}, attempt: { result: 'partial' } }])), ['gone', 'none', 'partial']);
// 卷子短名字：检验卷为组卷人加前两个专题（多的 +N），没有 madeBy 为 Someone；每日卷同一人同一天跨科目按 madeAt 编 Batch，没交的不占号，正在做的排最后，别人的卷不计
const pnm = id => ({ uA: 'Aaron', uS: 'Sophia' })[id] || 'Someone', tn = (s, t) => t.toUpperCase();
const pn = (p, ps) => L.paperName(p, ps || [], [], 'uS', pnm, tn);
assert.strictEqual(pn({ id: 'c1', madeBy: 'uA', subject: 'english', topics: [] }), 'Aaron');
assert.strictEqual(pn({ id: 'c2', subject: 'english', topics: ['a', 'b'] }), 'Someone · A, B');
assert.strictEqual(pn({ id: 'c3', madeBy: 'uA', subject: 'english', topics: ['a', 'b', 'c', 'd'] }), 'Aaron · A, B +2');
const dps = [
  { id: 'd3', kind: 'daily', for: 'uS', subject: 'science', createdAt: T16, madeAt: T16 + 'T10:00', handedIn: { uS: T16 + 'T10:20' } },
  { id: 'd1', kind: 'daily', for: 'uS', subject: 'english', createdAt: T16, madeAt: T16 + 'T08:00', handedIn: { uS: T16 + 'T08:30' } },
  { id: 'd2', kind: 'daily', for: 'uS', subject: 'english', createdAt: T16, madeAt: T16 + 'T09:00', handedIn: {} },
  { id: 'd4', kind: 'daily', for: 'uS', subject: 'english', createdAt: T16, madeAt: T16 + 'T11:00', handedIn: {} },
  { id: 'd0', kind: 'daily', for: 'uS', subject: 'english', createdAt: '2026-10-15', madeAt: '2026-10-15T20:00', handedIn: { uS: '2026-10-15T20:30' } },
  { id: 'dx', kind: 'daily', for: 'uA', subject: 'english', createdAt: T16, madeAt: T16 + 'T07:00', handedIn: { uA: T16 + 'T07:30' } }];
assert.deepStrictEqual(['d1', 'd3', 'd4', 'd0', 'dx'].map(id => pn(dps.find(x => x.id === id), dps)), ['Batch 1', 'Batch 2', 'Batch 3', 'Batch 1', 'Batch 1']);
// 翻页条位置：题数不超过 max（不少于 7）时全列；否则首、尾与当前题附近一段，空缺为省略号；靠近首或尾时那一头不留省略号
const ps = (n, i, m) => Array.from(L.pagerSlots(n, i, m), x => x === null ? '…' : x + 1).join(' ');
assert.strictEqual(ps(7, 3), '1 2 3 4 5 6 7');
assert.strictEqual(ps(24, 3, 30), Array.from({ length: 24 }, (_, i) => i + 1).join(' '));
assert.strictEqual(ps(24, 0), '1 2 3 4 5 … 24');
assert.strictEqual(ps(24, 3), '1 2 3 4 5 … 24');
assert.strictEqual(ps(24, 4), '1 … 4 5 6 … 24');
assert.strictEqual(ps(24, 11), '1 … 11 12 13 … 24');
assert.strictEqual(ps(24, 23), '1 … 20 21 22 23 24');
assert.strictEqual(ps(24, 11, 9), '1 … 10 11 12 13 14 … 24');
assert.strictEqual(ps(10, 1, 3), '1 2 3 4 5 … 10');   // max 不足 7 时按 7
// 金币：本周（周一到今天）每日重做的作答；做对得进入的那一级的数（2、3、4），掌握 5；部分对、做错 1 枚，每道题每周一次；检验卷不给；只数本人
const CD = '2026-10-16', ca = (date, result, mode, by, paperId) => ({ date, result, mode: mode || 'daily', by: by || 'uS', paperId: paperId || null });   // 2026-10-16 是周五，本周从 10-12 起
const coin = (attempts, uid, matches) => { const c = L.coinsFor([{ id: 'c', createdAt: '2026-09-01', attempts }], matches || [], uid || 'uS', CD); return { up: [c.up[2], c.up[3], c.up[4]], mastered: c.mastered, tried: c.tried, total: c.coins }; };
assert.deepStrictEqual(coin([ca('2026-10-12', 'right'), ca(CD, 'right')]), { up: [1, 1, 0], mastered: 0, tried: 0, total: 5 });   // 周一算：升到 2 级 2 枚、3 级 3 枚
assert.deepStrictEqual(coin([ca('2026-10-11', 'right')]), { up: [0, 0, 0], mastered: 0, tried: 0, total: 0 });   // 上周日不算
assert.deepStrictEqual(coin([ca('2026-10-11', 'right'), ca('2026-10-12', 'right')]), { up: [0, 1, 0], mastered: 0, tried: 0, total: 3 });   // 本周之前的升级仍推阶梯
assert.deepStrictEqual(coin([ca(CD, 'right', 'paper'), ca(CD, 'partial', 'paper'), ca(CD, 'wrong', 'paper')]), { up: [0, 0, 0], mastered: 0, tried: 0, total: 0 });   // 检验卷不给
assert.deepStrictEqual(coin([ca('2026-10-13', 'partial')]), { up: [0, 0, 0], mastered: 0, tried: 1, total: 1 });
// 部分对、做错每道题每周只给一次；检验卷上做错不给、也不占这一次
assert.deepStrictEqual(coin([ca('2026-10-12', 'wrong'), ca('2026-10-13', 'wrong'), ca('2026-10-14', 'partial')]), { up: [0, 0, 0], mastered: 0, tried: 1, total: 1 });
assert.deepStrictEqual(coin([ca('2026-10-10', 'wrong'), ca('2026-10-13', 'wrong', 'paper'), ca('2026-10-14', 'wrong')]), { up: [0, 0, 0], mastered: 0, tried: 1, total: 1 });
// 检验卷上做错让阶梯回到第 1 级，之后的升级从 2 级重新算
assert.deepStrictEqual(coin([ca('2026-10-12', 'right'), ca('2026-10-13', 'wrong', 'paper'), ca('2026-10-14', 'right')]), { up: [2, 0, 0], mastered: 0, tried: 0, total: 4 });
// 升到 2、3、4 级各 2、3、4 枚；第 4 级再做对即掌握：5 枚
const m4 = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15'].map(d => ca(d, 'right'));
assert.deepStrictEqual(coin(m4), { up: [1, 1, 1], mastered: 1, tried: 0, total: 14 });
assert.deepStrictEqual(coin(m4.concat([ca(CD, 'right'), ca(CD, 'partial')])), { up: [1, 1, 1], mastered: 1, tried: 0, total: 14 });   // 掌握后做对、部分对：0
assert.deepStrictEqual(coin(m4.concat([ca(CD, 'wrong')])), { up: [1, 1, 1], mastered: 1, tried: 1, total: 15 });   // 掌握后做错：按做错给，回到第 1 级
assert.deepStrictEqual(coin([ca(CD, 'right', 'daily', 'uA')]).total, 0);
assert.deepStrictEqual(coin([ca(CD, 'right', 'daily', 'uA')], 'uA').total, 2);
// 一张卷挣的金币：按本人这道题的全部历史重放，只加带本卷 paperId 的；同一周里已给过「做了」的，卷上做错不再给
const pc = (exs, pid) => JSON.stringify(L.paperCoins(exs, 'uS', pid));
const pcEx = [
  { id: 'e1', attempts: [ca('2026-10-12', 'right'), ca('2026-10-14', 'right', 'daily', 'uS', 'P')] },              // 2 → 3 级：3 枚
  { id: 'e2', attempts: [ca('2026-10-13', 'wrong'), ca('2026-10-14', 'wrong', 'daily', 'uS', 'P')] },              // 本周已给过「做了」：0
  { id: 'e3', attempts: [ca('2026-10-14', 'partial', 'daily', 'uS', 'P'), ca('2026-10-14', 'right', 'daily', 'uA', 'P')] },   // 1 枚；别人的不算
  { id: 'e4', attempts: [ca('2026-10-14', 'right', 'daily', 'uS', 'Q')] }];
assert.strictEqual(pc(pcEx, 'P'), JSON.stringify({ coins: 4, up: 1, mastered: 0, tried: 1 }));
assert.strictEqual(pc(pcEx, 'Q'), JSON.stringify({ coins: 2, up: 1, mastered: 0, tried: 0 }));
assert.strictEqual(pc(pcEx, 'Z'), JSON.stringify({ coins: 0, up: 0, mastered: 0, tried: 0 }));
// 余额：金币减去本周开赛、本人参赛的各场里本人的投入；有 stakes 时按它，旧比赛按 rounds × 10；上周开赛的不扣；不在 players 里的不扣；可为负
const bal = (matches, uid) => { const c = L.coinsFor([{ id: 'c', createdAt: '2026-09-01', attempts: m4 }], matches, uid || 'uS', CD); return [c.coins, c.spent, c.balance].join(); };
assert.strictEqual(bal([]), '14,0,14');
assert.strictEqual(bal([{ players: ['uA', 'uS'], rounds: 1, at: '2026-10-12T08:00', points: [{ uA: 1, uS: 0 }] }]), '14,10,4');   // 旧比赛：rounds × 10
assert.strictEqual(bal([{ players: ['uS', 'uA'], rounds: 1, stakes: { uS: 17, uA: 10 }, at: '2026-10-15T20:00', points: [] }]), '14,17,-3');   // 按 stakes；中途离开也扣；可为负
assert.strictEqual(bal([{ players: ['uA', 'uS'], rounds: 1, stakes: { uA: 20, uS: 10 }, at: '2026-10-15T20:00', points: [] }]), '14,10,4');   // 别人多投的不算我的
assert.strictEqual(bal([{ players: ['uS', 'uA'], rounds: 5, at: '2026-10-11T23:55', points: [] }]), '14,0,14');   // 上周日开赛的不扣
assert.strictEqual(bal([{ players: ['uA', 'uB'], rounds: 1, at: CD + 'T09:00', points: [] }]), '14,0,14');
assert.strictEqual(L.stakeOf({ rounds: 1, stakes: { uS: 15 } }, 'uS'), 15);
assert.strictEqual(L.stakeOf({ rounds: 1, stakes: { uS: 15 } }, 'uA'), 10);
// 开赛人最多多投：0–10，且余额要够付 10 + 多投
assert.deepStrictEqual([5, 10, 15, 19.5, 20, 50].map(L.maxExtra), [0, 0, 5, 9, 10, 10]);
// 参赛者：默认归属人与开赛人的相同、余额够付 10（开赛人够付 10 + 多投）；开赛人在最前；开赛人不够或不到两人时为空
const own = { uS: 'uS', uA: 'uS', uB: 'uS' };   // uC 没有设置：默认归属人是自己
const balOf = { uS: 39, uA: 156, uB: 0, uC: 80 }, U = ['uS', 'uA', 'uB', 'uC'];
assert.deepStrictEqual(Array.from(L.entrants(U, own, balOf, 'uA', 10)), ['uA', 'uS']);
assert.deepStrictEqual(Array.from(L.entrants(U, own, balOf, 'uS', 0)), ['uS', 'uA']);
assert.deepStrictEqual(Array.from(L.entrants(U, own, Object.assign({}, balOf, { uB: 10 }), 'uS', 10)), ['uS', 'uA', 'uB']);   // 开赛人多投不改别人的门槛
assert.deepStrictEqual(Array.from(L.entrants(U, own, Object.assign({}, balOf, { uS: 15 }), 'uS', 6)), []);   // 15 不够 10 + 6
assert.deepStrictEqual(Array.from(L.entrants(U, own, Object.assign({}, balOf, { uS: 15 }), 'uS', 5)), ['uS', 'uA']);
assert.deepStrictEqual(Array.from(L.entrants(U, own, Object.assign({}, balOf, { uS: 9 }), 'uS', 0)), []);   // 开赛人不够 10
assert.deepStrictEqual(Array.from(L.entrants(U, own, Object.assign({}, balOf, { uS: 0 }), 'uA', 0)), []);   // 只剩 uA 一人
assert.deepStrictEqual(Array.from(L.entrants(U, own, balOf, 'uC', 0)), []);   // 一人成组
// 举重一局：幸运数 1.0、1.1 … 10.0 等可能（rand 取 0 为 1.0，取近 1 为 10.0）；重量 = 投入 × 幸运数，保留一位小数；同重同名次
const lr = (st, r) => { const x = L.liftRound(st, () => r); return JSON.stringify([x.kg, x.luck, x.places]); };
assert.strictEqual(lr({ uS: 10, uA: 20 }, 0), JSON.stringify([{ uS: 10, uA: 20 }, { uS: 1, uA: 1 }, { uS: 2, uA: 1 }]));
assert.strictEqual(lr({ uS: 10, uA: 20 }, 0.9999999), JSON.stringify([{ uS: 100, uA: 200 }, { uS: 10, uA: 10 }, { uS: 2, uA: 1 }]));
assert.strictEqual(lr({ uS: 15 }, 31.5 / 91), JSON.stringify([{ uS: 61.5 }, { uS: 4.1 }, { uS: 1 }]));   // 15 × 4.1 = 61.5，不是 61 或 62
// 一局没有并列：同重的几人重抽，没同重的不重抽
const seq = q => () => q.shift();
const tie = L.liftRound({ a: 10, b: 20 }, seq([10.5 / 91, 0, 40.5 / 91, 0.5 / 91]));   // 先 10 × 2.0 与 20 × 1.0 同重，重抽后 10 × 5.0 = 50、20 × 1.0 = 20
assert.deepStrictEqual([tie.luck.a, tie.luck.b, tie.kg.a, tie.kg.b, tie.places.a, tie.places.b], [5, 1, 50, 20, 1, 2]);
const tie3 = L.liftRound({ a: 10, b: 10, c: 20 }, seq([0.5 / 91, 0.5 / 91, 90.5 / 91, 30.5 / 91, 20.5 / 91]));   // a、b 同为 10 kg，c 200 kg 不重抽；a、b 重抽为 40、30
assert.deepStrictEqual([tie3.kg.a, tie3.kg.b, tie3.kg.c, tie3.places.a, tie3.places.b, tie3.places.c], [40, 30, 200, 2, 3, 1]);
const stuck = L.liftRound({ a: 10, b: 10 }, () => 0);   // 一直同重：重抽 50 次后按键顺序定先后
assert.deepStrictEqual([stuck.places.a, stuck.places.b], [1, 2]);
assert.deepStrictEqual({ ...L.roundPoints(stuck.places) }, { a: 1, b: 0 });
assert.deepStrictEqual({ ...L.roundPoints({ a: 1, b: 1 }) }, { a: 0.5, b: 0.5 });   // 旧比赛里的并列照旧平分
// 赢的机会：独赢 + 并列平分；投入多只让机会大，不保证赢
const pct = st => JSON.stringify(Object.fromEntries(Object.entries(L.liftChances(st)).map(([k, v]) => [k, Math.round(v * 100)])));
assert.strictEqual(pct({ a: 10, b: 10 }), JSON.stringify({ a: 50, b: 50 }));
assert.strictEqual(pct({ a: 20, b: 10 }), JSON.stringify({ a: 80, b: 20 }));
assert.strictEqual(pct({ a: 10, b: 10, c: 10 }), JSON.stringify({ a: 33, b: 33, c: 33 }));
assert.ok(L.liftChances({ a: 20, b: 10 }).b > 0.15);
const sumCh = st => Object.values(L.liftChances(st)).reduce((x, y) => x + y, 0);
assert.ok(Math.abs(sumCh({ a: 20, b: 10 }) - 1) < 1e-9 && Math.abs(sumCh({ a: 13, b: 10, c: 10 }) - 1) < 0.01);
// 一场各人的星与本场冠军
assert.deepStrictEqual(JSON.parse(JSON.stringify(L.matchTotals([{ a: 1, b: 0 }, { a: 0, b: 1 }, { a: 1, b: 0 }]))), { totals: { a: 2, b: 1 }, champions: ['a'] });
assert.deepStrictEqual(Array.from(L.matchTotals([{ a: 1.5, b: 1.5, c: 0 }]).champions), ['a', 'b']);
// 一局的星：打败的人数；并列平分所占名次的星之和
assert.deepStrictEqual({ ...L.roundPoints({ a: 1, b: 2 }) }, { a: 1, b: 0 });
assert.deepStrictEqual({ ...L.roundPoints({ a: 2, b: 1, c: 3 }) }, { a: 1, b: 2, c: 0 });
assert.deepStrictEqual({ ...L.roundPoints({ a: 1, b: 2, c: 3, d: 4 }) }, { a: 3, b: 2, c: 1, d: 0 });
assert.deepStrictEqual({ ...L.roundPoints({ a: 1, b: 1, c: 3 }) }, { a: 1.5, b: 1.5, c: 0 });
assert.deepStrictEqual({ ...L.roundPoints({ a: 1, b: 2, c: 2, d: 4 }) }, { a: 3, b: 1.5, c: 1.5, d: 0 });
assert.deepStrictEqual({ ...L.roundPoints({ a: 1, b: 1 }) }, { a: 0.5, b: 0.5 });
// 星榜：本周（周一到周日）或全部；整场计入开赛日；没得星的人列 0；没有并列：同星比本周挣的金币，再比谁先拿到这个星数（最后一次得星的开赛时刻早），再按 id
const sbm = [
  { at: '2026-10-12T18:00', points: [{ uS: 1, uA: 0 }, { uS: 0, uA: 1 }] },   // 周一
  { at: '2026-10-11T23:55', points: [{ uS: 2, uA: 1, uB: 0 }] },           // 上周日开赛，即使比到周一也算上周
  { at: '2026-10-16T09:00', points: [{ uA: 1, uB: 0 }] }];
const board = (period, uids, coins) => Array.from(L.scoreboard(sbm, uids || ['uS', 'uA', 'uB', 'uC'], CD, period, coins), r => [r.id, r.points, r.rank].join(':')).join(' ');
assert.strictEqual(board('week'), 'uA:2:1 uS:1:2 uB:0:3 uC:0:4');   // uB、uC 都是 0 星 0 金币：按 id
assert.strictEqual(board('week', null, { uC: 5 }), 'uA:2:1 uS:1:2 uC:0:3 uB:0:4');   // 同星比金币
assert.strictEqual(board('all'), 'uS:3:1 uA:3:2 uB:0:3 uC:0:4');   // 同星同金币：uS 10-12 拿到 3 星，uA 10-16 才拿到
assert.strictEqual(board('all', null, { uA: 9, uS: 5 }), 'uA:3:1 uS:3:2 uB:0:3 uC:0:4');   // 金币先于谁先拿到
assert.strictEqual(board('week', ['uS', 'uB']), 'uS:1:1 uB:0:2');   // 只列名单（本组）里的人
// 领奖台：星榜的前三名各站一级
const pod = rows => JSON.stringify(L.podium(rows));
const U4 = ['uS', 'uA', 'uB', 'uC'];
assert.strictEqual(pod(L.scoreboard(sbm, U4, CD, 'week')), JSON.stringify([['uA'], ['uS'], ['uB']]));
assert.strictEqual(pod(L.scoreboard([], ['uS', 'uA'], CD, 'week', { uS: 39, uA: 156 })), JSON.stringify([['uA'], ['uS'], []]));   // 没比赛时按金币
assert.strictEqual(Array.from(L.scoreboard([], ['uS'], CD, 'week'), r => r.points).join(), '0');
// 本周历史：开赛日期在本周、参赛者与本组有交集；按开赛时刻新的在前
const wm = [{ id: 'm1', at: '2026-10-12T08:00', players: ['uS', 'uA'] }, { id: 'm2', at: '2026-10-11T23:55', players: ['uS', 'uA'] },
  { id: 'm3', at: CD + 'T09:00', players: ['uA', 'uS'] }, { id: 'm4', at: CD + 'T10:00', players: ['uC', 'uD'] }];
assert.strictEqual(Array.from(L.weekMatches(wm, ['uS', 'uA', 'uB'], CD), m => m.id).join(), 'm3,m1');
assert.strictEqual(L.weekMatches([], ['uS'], CD).length, 0);
// This week 的计划柱：今天以前 0；今天为此刻到期的题数；以后同 dueByDay
const wpq = (id, due, x) => Object.assign({ id, subject: 'english', due, step: 1, mastered: false, createdAt: '2026-10-10', attempts: [] }, x || {});
const wpx = [wpq('o', '2026-10-20'), wpq('t', '2026-10-22'), wpq('f', '2026-10-24'), wpq('m', '2026-10-21', { mastered: true })];
const wpl = L.weekPlan(wpx, '2026-10-22', '2026-10-19'), dbx = L.dueByDay(wpx, '2026-10-22');
assert.deepStrictEqual(Array.from(wpl, x => x.date), ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
assert.deepStrictEqual(Array.from(wpl, x => x.planned).slice(0, 4), [0, 0, 0, 2]);
assert.deepStrictEqual(Array.from(wpl, x => x.planned).slice(4), [dbx[1].count, dbx[2].count, dbx[3].count]);
// 某一天结束时在阶梯哪一级：还没录为 null；做对升级；第 4 级做对掌握（5）；做错回 1；检验卷上做对不升、做错回 1
const la = (atts, c) => ({ createdAt: c || '2026-10-01', attempts: atts });
assert.strictEqual(L.ladderAt(la([], '2026-10-05'), '2026-10-04'), null);
assert.strictEqual(L.ladderAt(la([]), '2026-10-04'), 1);
assert.strictEqual(L.ladderAt(la([at('2026-10-02', 'right'), at('2026-10-04', 'right'), at('2026-10-08', 'right')]), '2026-10-04'), 3);   // 8 号的不算
assert.strictEqual(L.ladderAt(la(four(['2026-10-02', '2026-10-04', '2026-10-08', '2026-10-15'])), '2026-10-15'), 5);
assert.strictEqual(L.ladderAt(la([at('2026-10-02', 'right'), at('2026-10-04', 'wrong')]), '2026-10-04'), 1);
assert.strictEqual(L.ladderAt(la([at('2026-10-02', 'right'), PA('2026-10-04', 'right')]), '2026-10-04'), 2);
assert.strictEqual(L.ladderAt(la([at('2026-10-02', 'right'), PA('2026-10-04', 'wrong')]), '2026-10-04'), 1);
// 一周的两架梯子：周内新录算左梯 1 级（fresh）；跨两级只算一次（up 按到达的级）；下降计 down；
// 周初掌握、仍掌握的两架都不放；周初掌握、之后做错的记左梯 1 级并算下降；左梯的掌握一项恒为 0；to 之后才录的不算
const W0 = '2026-10-19', W1 = '2026-10-25';
const wlx = [
  la([at('2026-10-20', 'right')], '2026-10-18'),                                                   // 1 → 2
  la([at('2026-10-20', 'right'), at('2026-10-22', 'right')], '2026-10-21'),                        // 新录，1 → 3
  la([at('2026-10-14', 'right'), at('2026-10-16', 'right'), at('2026-10-21', 'wrong')]),           // 3 → 1
  la([at('2026-10-14', 'right'), at('2026-10-16', 'right'), at('2026-10-21', 'wrong'), at('2026-10-22', 'right')]),   // 3 → 2：下降
  la(four(['2026-10-02', '2026-10-04', '2026-10-08', '2026-10-15'])),                              // 周初掌握、仍掌握
  la(four(['2026-10-02', '2026-10-04', '2026-10-08', '2026-10-15']).concat([at('2026-10-20', 'wrong')])),   // 周初掌握、做错
  la(four(['2026-10-12', '2026-10-14', '2026-10-17', '2026-10-21'])),                              // 4 → 掌握
  la([], '2026-10-26')];                                                                            // 下周才录
const wl = L.weekLadders(wlx, W0, W1);
assert.deepStrictEqual([Array.from(wl.left), Array.from(wl.right)], [[3, 0, 2, 1, 0], [2, 2, 1, 0, 1]]);
assert.deepStrictEqual([wl.fresh, wl.masteredBefore, wl.down, { ...wl.up }], [1, 1, 3, { 2: 1, 3: 1, 4: 0, 5: 1 }]);
assert.deepStrictEqual(Array.from(wl.flows, f => [f.from, f.to, f.n]), [[1, 2, 1], [1, 3, 1], [4, 5, 1]]);
// Exercises 一科的小结：专题按题数多到少；最近 7 天作答不到 5 次正确率为 null；stronger 取高的三个，weaker 取其余里低的三个，不重复
const tsq = (topic, step, atts, x) => Object.assign({ subject: 'english', topic, step, mastered: false, attempts: atts }, x || {});
const r5 = (k, d) => Array.from({ length: 5 }, (_, i) => at(d || '2026-10-20', i < k ? 'right' : 'wrong'));
const tsx = [tsq('a', 1, r5(5)), tsq('a', 2, []), tsq('b', 1, r5(4)), tsq('c', 3, r5(3)), tsq('d', 1, r5(2)), tsq('e', 1, r5(1)), tsq('f', 1, r5(5, '2026-10-10')),
  tsq('g', 4, [], { mastered: true }), tsq('h', 1, r5(3), { subject: 'science' })];
const ts = L.topicSummary(tsx, 'english', '2026-10-22');
assert.deepStrictEqual(Array.from(ts.topics, t => [t.topic, t.n, t.rate]), [['a', 2, 100], ['b', 1, 80], ['c', 1, 60], ['d', 1, 40], ['e', 1, 20], ['f', 1, null], ['g', 1, null]]);
assert.deepStrictEqual([Array.from(ts.topics[0].steps), Array.from(ts.topics[6].steps), ts.topics[1].wrong], [[1, 1, 0, 0, 0], [0, 0, 0, 0, 1], 1]);
assert.deepStrictEqual([Array.from(ts.stronger, t => t.topic), Array.from(ts.weaker, t => t.topic)], [['a', 'b', 'c'], ['e', 'd']]);
// Papers 的 Daily 子标签：只取每日卷；默认只取 from 以后的，按天分组、新的在前，组内按 madeAt 新的在前；older 是没列出的张数
const dgx = [{ id: 'a', kind: 'daily', createdAt: '2026-10-22', madeAt: '2026-10-22T08:00' }, { id: 'b', kind: 'daily', createdAt: '2026-10-22', madeAt: '2026-10-22T19:00' },
  { id: 'c', kind: 'daily', createdAt: '2026-10-20' }, { id: 'd', kind: 'daily', createdAt: '2026-10-10' }, { id: 'P' }];
const dg = L.dailyGroups(dgx, '2026-10-16', false);
assert.deepStrictEqual([Array.from(dg.groups, g => [g.date, ids(g.papers).join()]), dg.older], [[['2026-10-22', 'b,a'], ['2026-10-20', 'c']], 1]);
const dga = L.dailyGroups(dgx, '2026-10-16', true);
assert.deepStrictEqual([dga.groups.length, dga.older], [3, 0]);
console.log('all logic tests passed');
