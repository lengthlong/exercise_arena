# Plan support contract

- **Journey or trigger** [0016](../../../journey/0016-build-paper-plan.md) steps 1–7: a user asks for a Paper plan, a different weekly amount, a new PSLE date or a replacement paper. Nothing runs on a schedule.
- **Operator and authorization** An agent acting on the user's request, reading and writing as the Artifact owner with the Claude Artifact tools. Building and dry-running the selection is authorized by the request. Every production write (first build and each re-plan) needs the user's separate confirmation after they have seen the rows.
- **Environment and dependencies**
  - Local checkout, Node.js and the Claude Artifact tools; read access to sgexam.com.
  - For a re-plan: a verified [0014](../../../journey/0014-back-up-production-library.md) snapshot taken immediately before ([recover contract](../recover/SPEC.md)).
- **Data** Shapes, ids and the page's write limits are owned by `DATA.md` (`plans`, `schoolPapers`). This contract writes only those two collections.

## Select the pool

- **Source** The sgexam.com Primary 6 listing pages for Maths, English and Science.
- **Ranking key** per subject, in order:
  1. Prelim papers before any other kind.
  2. Newer year before older.
  3. Within a year, a Gifted Education Programme (GEP) centre school before other schools: Anglo-Chinese School (Primary), Catholic High (Primary), Henry Park, Nan Hua, Nanyang, Raffles Girls', Rosyth, St. Hilda's and Tao Nan. Confirm the list against MOE before the first build.
  4. School name, A to Z.
- **Pool size** Enough for 2 papers per subject per week over the plan's weeks (about 86 per subject for a 43-week plan). If prelims cannot fill it, continue with other kinds by the same key and report the shortfall.
- **Syllabus note** Report which planned papers are dated before the current primary syllabuses reach P6 (Maths 2021 and Science 2023 syllabuses; confirm the first P6 year against MOE).
- **Link check** Spot-check that each selected paper page opens; replace one that does not with the next ranked paper.

## Build a plan

- **Weeks** Monday-to-Sunday weeks from the start week through the last full week before `psleDate` (the first written PSLE paper). Until SEAB publishes the date, use the estimate 2027-09-23 and say it is an estimate.
- **Schedule** Take the first `perWeek × weeks` papers of each subject by rank and assign them so that older papers come first and the newest come last, `perWeek` per subject per week. The rest are reserve (`week` null).
- **Writes** `set` `plans/<user>` and every School paper with its fixed id.
- **Success** Reading back gives, per subject, `perWeek` papers in every planned week and the expected reserve count; the plan's start and last week match what the user saw.

## Re-plan

- **Triggers** New `psleDate`, new `perWeek`, a replacement paper, or a new start week.
- **Rules**
  - Done papers keep their week, done date and score.
  - Unfinished and reserve papers are spread again from the current week by the Schedule rule; papers that no longer fit move to reserve.
  - Existing School papers get an `update` of `week` and `rank` only; only papers new to the pool are `set`.
  - Never delete a School paper; never write `doneOn`, `score` or `total`.
- **Before writing** Take and verify a backup, then show the user every document that will change.
- **Success** Read-back as for a build, and every done mark equals the backup's.

## Failure, stop and recovery

- **Stop** The user declines; the backup does not verify; read-back does not match.
- **Part-way failure** Re-run the same operation. Fixed ids make it complete the plan without duplicates.
- **Recovery** Restore `week` and `rank` from the pre-re-plan backup under the recover contract's restore authorization. A first build that must be undone is removed only with the user's explicit confirmation of each deletion.
- **Retention** Paper lists and read-back reports stay in the conversation or local files outside the repository; the plan lives in production `db` and its backups.
