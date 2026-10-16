const fs = require('fs'), vm = require('vm'), assert = require('assert');
// 用法：node app/logic.test.js app/arena.html —— 抽出 arena.html 里 LOGIC:BEGIN 到 LOGIC:END 的纯函数断言；这些断言就是页面规则的规格。
const html = fs.readFileSync(process.argv[2], 'utf8');
const src = html.slice(html.indexOf('/* LOGIC:BEGIN'), html.indexOf('/* LOGIC:END */'));
const ctx = {}; vm.createContext(ctx); vm.runInContext(src + ';this.L={dailyBySubject,deriveState,judgeAuto,dailyList,drawPaper,paperLayout,matchShort,addDays,tally,localToday,paperAttempts,paperScore,mustUseCheck,parseList,parseExplanation,sortExercises,pageSlice,toYaml,exportData,streakInfo,masteredOn,dashboardData,helloStats,readSettings,weekStart,goalProgress,weekReview,reviewLine,keyIdeaTip,paperTry,dueSplit,viewFor,ownedBy,attemptGroups,todayScope,isDaily,handedInAt,makeDailyPaper,openDailyPaper,visiblePapers,dueByDay,subjectBatch,dueNowIds,todayPapers,paperProgress,todayCounts,leftMix,ladderInput,ladderShares,subjectSummary,matchesQuery,filterPapers,sortPapers};', ctx);
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
assert.deepStrictEqual(Array.from(L.helloStats({ todayRight: 30, newMasteredToday: 2, streak: 3 })), ['✅ 30 right today', '⭐ 2 mastered today', '🔥 3-day streak']);
assert.deepStrictEqual(Array.from(L.helloStats({ todayRight: 5, newMasteredToday: 0, streak: 2 })), ['✅ 5 right today', '🔥 2-day streak']);
assert.deepStrictEqual(Array.from(L.helloStats({ todayRight: 0, newMasteredToday: 0, streak: 0 })), ['✅ 0 right today', '🔥 0-day streak']);
assert.deepStrictEqual(Array.from(L.helloStats({ todayRight: 1, newMasteredToday: 1, streak: 1 })), ['✅ 1 right today', '⭐ 1 mastered today', '🔥 1-day streak']);
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
// Next 7 days：今天一格是今天做过（每日重做）与此刻到期的并集；其后各天按「到期的题都在到期那天做对」推算：
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
// 回顾：最近 7 天（含今天）
const T1 = '2026-10-20';
const rx = [
  { id: 'r1', subject: 'english', topic: 'en-prep', concept: 'en-pp-fixed', step: 2, mastered: false, due: '2026-10-22',
    attempts: [at('2026-10-13', 'wrong'), at('2026-10-14', 'wrong'), at('2026-10-19', 'right'), at('2026-10-20', 'wrong')] },
  { id: 'r2', subject: 'english', topic: 'en-prep', concept: 'en-pp-fixed', step: 1, mastered: false, due: '2026-10-19',
    attempts: [at('2026-10-18', 'wrong'), at('2026-10-18', 'wrong')] },
  { id: 'r3', subject: 'science', topic: 'S-elec', concept: null, step: 4, mastered: false, due: '2026-10-25', attempts: [] }];
let wr = L.weekReview(rx, [], T1);
assert.deepStrictEqual([wr.from, wr.questions, wr.answers, wr.right, wr.partial, wr.wrong, wr.practised, wr.moved],
  ['2026-10-14', 2, 5, 1, 0, 4, 4, 1]);                                   // 13 号不在窗口；14 号在；r1 19 号做对而升级
assert.deepStrictEqual([wr.days.length, wr.days[0].date, { ...wr.days[6] }], [7, '2026-10-14', { date: '2026-10-20', right: 0, partial: 0, wrong: 1 }]);
assert.deepStrictEqual({ ...wr.topWrong }, { subject: 'english', topic: 'en-prep', n: 4 });
assert.strictEqual(wr.newlyMastered.length, 0);
assert.strictEqual(L.weekReview(rx.slice(1), [], T1).moved, 0);
// 统计行：升级的题数为 0 时不出那一项
assert.strictEqual(L.reviewLine(wr), '5 answers: 1 right · 0 partly · 4 wrong · 1 moved up · practised on 4 of 7 days');
assert.strictEqual(L.reviewLine({ answers: 1, right: 1, partial: 0, wrong: 0, moved: 0, practised: 1 }), '1 answer: 1 right · 0 partly · 0 wrong · practised on 1 of 7 days');
// 新掌握按概念分组，没填概念的按专题
const mm = (id, concept, topic, d) => ({ id, subject: 'english', topic, concept, mastered: true, step: 4, due: null, attempts: four(d) });
const nmx = [mm('k1', 'en-pp-fixed', 'en-prep', ['2026-10-05', '2026-10-06', '2026-10-08', '2026-10-15']),
  mm('k2', 'en-pp-fixed', 'en-prep', ['2026-10-05', '2026-10-06', '2026-10-08', '2026-10-14']),
  mm('k3', null, 'en-tense', ['2026-10-05', '2026-10-06', '2026-10-08', '2026-10-20']),
  mm('k4', 'en-c-coord', 'en-conj', ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-13'])];
const nm = L.weekReview(nmx, [], T1);   // k4 在窗口外
assert.deepStrictEqual(Array.from(nm.newlyMastered, g => [g.kind, g.id, g.n]), [['concept', 'en-pp-fixed', 2], ['topic', 'en-tense', 1]]);
// Today 的重读讲解：最近 7 天某专题错 3 次以上才出，2 次不出
const nameT = t => t.topic;
assert.strictEqual(L.keyIdeaTip(wr, nameT), 'Read the Key idea again for en-prep before you redo it.');
assert.strictEqual(L.keyIdeaTip({ topWrong: { subject: 'english', topic: 'en-prep', n: 2 } }, nameT), '');
assert.strictEqual(L.keyIdeaTip({ topWrong: null }, nameT), '');
// 本周检验卷没达到时接在目标行后：错得最多的专题；最近 7 天没错时混合专题
assert.strictEqual(L.paperTry(wr, nameT), ' — try one on en-prep');
assert.strictEqual(L.paperTry({ topWrong: null }, nameT), ' — try one on mixed topics');
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
// 按题组装出的清单再按科目分，组内的题仍连在一起
const bsl = L.dailyBySubject(L.dailyList([
  { id: 'm1', subject: 'math', due: '2026-10-10', createdAt: '2026-10-01', mastered: false },
  { id: 'g1', subject: 'english', setId: 'G', setPos: 1, due: '2026-10-11', createdAt: '2026-10-02', mastered: false },
  { id: 'e1', subject: 'english', due: '2026-10-12', createdAt: '2026-10-03', mastered: false },
  { id: 'g2', subject: 'english', setId: 'G', setPos: 2, due: '2026-10-13', createdAt: '2026-10-02', mastered: false }], '2026-10-14', 10));
assert.deepStrictEqual(Array.from(bsl, x => [x[0], ids(x[1])]), [['english', ['g1', 'g2', 'e1']], ['math', ['m1']]]);
assert.ok(L.isDaily(dpx) && !L.isDaily(PX));
// 接着用的每日卷：今天、给我、我没交过；昨天的、别人的、交过的都不取
const T16 = '2026-10-16';
const dOld = { id: 'dO', kind: 'daily', for: 'uA', createdAt: '2026-10-15', exerciseIds: [] };
const dOther = { id: 'dX', kind: 'daily', for: 'uS', createdAt: T16, exerciseIds: [] };
const dDone = { id: 'dD', kind: 'daily', for: 'uA', createdAt: T16, exerciseIds: [], handedIn: { uA: '2026-10-16T08:00' } };
const dOpen = { id: 'dN', kind: 'daily', for: 'uA', createdAt: T16, exerciseIds: [] };
const en = d => Object.assign({}, d, { id: d.id + 'e', subject: 'english' });
assert.strictEqual(L.openDailyPaper([en(dOld), en(dOther), en(dDone)], pwA, 'uA', T16, 'english'), null);   // 昨天的、别人的、交过的都不取
// 按科目取：别的科目、旧式混合卷都不被取到
const dEn = { id: 'dE', kind: 'daily', for: 'uA', createdAt: T16, subject: 'english', exerciseIds: [] };
const dSc = { id: 'dS', kind: 'daily', for: 'uA', createdAt: T16, subject: 'science', exerciseIds: [] };
assert.strictEqual(L.openDailyPaper([dOpen, dSc, dEn], pwA, 'uA', T16, 'english').id, 'dE');
assert.strictEqual(L.openDailyPaper([dOpen, dSc], pwA, 'uA', T16, 'english'), null);
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
// Last 7 days：检验卷做对不算「升级」，作答照数
const wp = L.viewFor([{ id: 'w', subject: 'english', topic: 'en-tense', createdAt: '2026-10-10', attempts: [PA('2026-10-18', 'right')] }], 'uA');
const wpr = L.weekReview(wp, [], T1);
assert.deepStrictEqual([wpr.answers, wpr.right, wpr.questions, wpr.moved], [1, 1, 1, 0]);
// Ladders 的环形图：五段题数与百分比，百分比按最大余数补足到 100；总数为 0 时全为 0
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
console.log('all logic tests passed');
