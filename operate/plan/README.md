# Build or re-plan a PSLE paper plan (runbook)

Tool for [model/operate/plan/SPEC.md](../../model/operate/plan/SPEC.md) (journey 0016). The contract is authoritative. This runbook only says how to carry out each step.

One Paper plan is shared by every user (`plans/<plan id>`, for example `psle-2027`); each user's progress is in `paperMarks`, which only the page writes outside a migration. `plan.mjs` reads and writes local files only. The agent reads sgexam.com and production, and applies the generated batches with `ArtifactData batch` after the user confirms. Keep the work folder under `backups/plans/<name>/`, which git ignores.

**Tests:** run `node operate/plan/plan.test.mjs`. It exits 0 when every test passes.

## Build (first plan)

Run each command from the repository root, with `W=backups/plans/<name>`.

1. **Catalogue.** Read the sgexam.com P6 listing pages for Maths, English and Science. Write `$W/catalog.json` as an array of `{ subject, school, short, year, kind, url }`:
   - `subject` is `math`, `english` or `science`; `kind` is `prelim`, `sa2`, `sa1`, `wa` or `other`.
   - Use full school names (for example "Anglo-Chinese School (Primary)", not "ACSP"), so the GEP-centre rule can match. Give `short` as the name shown in the grid (for example `NY`, `RGPS`).
   - Include enough years for the pool: about 2 papers per subject per week.
   - Before the first build, confirm the GEP-centre list in `plan.mjs` against MOE.
2. **Dry run.** Run `node operate/plan/plan.mjs build $W/catalog.json $W --plan psle-2027 --start <today> --psle <date>`.
   - It prints the weeks, paper count and any shortfall, and writes `$W/preview.txt`, `$W/writes/` and `$W/batches-build.json`.
   - Spot-check that the scheduled papers' links open.
3. **Show the user** `preview.txt`, the reserve size, any shortfall and the papers dated before the current syllabus reaches P6. Production writes wait for the user's confirmation.
4. **Write.** After the user confirms, apply each batch in `batches-build.json` with `ArtifactData batch`.
5. **Read back.** List `plans`, `schoolPapers` and `paperMarks` with `ArtifactData` into a folder laid out as `<dir>/plans/<id>.json`, `<dir>/schoolPapers/<id>.json` and `<dir>/paperMarks/<id>.json`. Then run `node operate/plan/plan.mjs check $W <dir> --plan psle-2027`. It exits non-zero on a gap.

## Re-plan

1. Take and verify a backup ([recover runbook](../recover/README.md)); its `db/` folder is the current state.
2. Refresh `$W/catalog.json` if the change needs new papers.
3. Run `node operate/plan/plan.mjs replan $W/catalog.json $W --plan psle-2027 --current <snapshot>/db --from <this Monday> [--per-week n] [--psle <date>]`.
   - Papers of weeks before `--from` keep their week. Existing papers only get `week`/`rank` updates, and papers new to the pool are `set`. Paper marks are never written and nothing is deleted.
   - It writes `$W/changes.json`, `$W/preview.txt` and `$W/batches-replan.json`.
4. Show the user `changes.json` and `preview.txt`. After they confirm, apply the batches.
5. Read back, then run `node operate/plan/plan.mjs check $W <readback-dir> --plan psle-2027 --before <snapshot>/db --from <this Monday>`. This also fails if a past-week paper moved or any Paper mark changed.

## Migrate a per-user plan to the shared shape

Each numbered step needs the user's own confirmation before its production writes.

1. Take and verify a backup. Count legacy papers with `doneOn` set (`grep -l '"doneOn": "' <snapshot>/db/schoolPapers/*.json | wc -l`).
2. Run `node operate/plan/plan.mjs migrate $W --current <snapshot>/db --user <legacy user id> --plan psle-2027`. It writes `batches-migrate-shared.json` (shared papers, then the plan), `batches-migrate-marks.json` and `batches-migrate-delete.json`. Apply the shared batches, then the marks batches. The released page that reads `for` ignores the shared documents.
3. Read back and run `node operate/plan/plan.mjs check-migration <readback-dir> --user <legacy user id> --plan psle-2027`.
4. After the page that reads the shared shape is released, take a fresh read and run `migrate ... --marks-only`; apply any marks it lists, then run `check-migration` again.
5. Only on the user's confirmation of the deletion, apply `batches-migrate-delete.json` (the legacy papers and `plans/<legacy user id>`).

## Recovery

- **A part-way failure:** re-run the same batches. Document ids are fixed, so nothing is duplicated.
- **A bad re-plan:** restore `week` and `rank` from the pre-re-plan backup under the recover contract's restore authorization.
- **A bad migration:** before step 5 the legacy documents are untouched; delete nothing and restore from the backup under the recover contract.
