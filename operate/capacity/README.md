# Shrink legacy oversized photos (runbook)

Tool for the one-off repair in [model/operate/capacity/SPEC.md](../../model/operate/capacity/SPEC.md). The contract is authoritative. This runbook only says how to carry out each stage.

`shrink-legacy.mjs` reads and writes local files only. The agent does every production read and write with the Claude `Artifact` and `ArtifactData` tools. The work folder lives under `backups/repairs/<name>/`, which git ignores, because it holds photos and the operation map.

**Prerequisites**
- Node.js and Google Chrome (or set `CHROME_PATH`). The tool drives Chrome directly and runs the page's own `shrinkPhoto` from `impl/arena.html`.
- Nobody uses the production app from stage 1 until stage 7 ends.

**Tests:** run `node operate/capacity/shrink-legacy.test.mjs`. It exits 0 when every test passes. `SKIP_CHROME=1` skips the Chrome case.

## Stages

Each command below is run from the repository root, with `W=backups/repairs/<name>`.

1. **Pre-repair snapshot.**
   - Take a backup with [backups/README.md](../../backups/README.md) and make sure `verify` passes.
   - When listing `exercises` and `sets`, save each list result's id/version text to `$W/versions/exercises.txt` and `$W/versions/sets.txt`.
   - Then run `node operate/capacity/shrink-legacy.mjs inventory <snapshot> $W`.
2. **Canary** (needs separate confirmation).
   - Pick one independent exercise from `inventory.json` and shrink only its photos: `node operate/capacity/shrink-legacy.mjs shrink $W --only <assetId>`.
   - Upload `$W/shrunk/<assetId>.jpg` with `Artifact` publish (`url`, `asset: true`, `file_path`).
   - Record `{"<oldId>": "<returned url or id>"}` in `$W/uploads.json`.
   - Run `node operate/capacity/shrink-legacy.mjs plan $W --only exercises/<docId>`.
   - Apply `batches-canary.json` with `ArtifactData batch`.
   - Open the page and check the photo, and saved-photo supplementation. `plan` stops if the upload is not a `/_blob/<32 hex>` id.
3. **Shrink and upload the rest.**
   - Run `node operate/capacity/shrink-legacy.mjs shrink $W`. It exits non-zero if any output fails the shrink rule.
   - Upload the outputs in calls of up to 25 files (`file_paths`), adding each old→new pair to `uploads.json`.
4. **Rewrite** (needs separate confirmation).
   - Run `node operate/capacity/shrink-legacy.mjs plan $W`.
   - Apply each entry of `batches-bulk.json` with `ArtifactData batch`. Every entry is an `images`-only `update` pinned with `if_version`.
   - On a version conflict, re-read that document, save the new version into `versions/`, re-plan and retry.
   - `map.json` is the operation map.
5. **Verify.**
   - Take a fresh snapshot of `exercises` and `sets`. The new assets must be in the local store: either download them, or copy `$W/shrunk/<old>.jpg` to `backups/assets/<new>.jpg` after the platform listing's count and byte totals equal the pre-repair totals plus the uploads exactly, every upload's reported size equals its local file, and a sample of listing sha256 values match.
   - Run `node operate/capacity/shrink-legacy.mjs verify $W <post-snapshot>`. Do not continue unless it prints `OK`.
6. **Delete** (needs separate confirmation).
   - Read `exercises` and `sets` again into a fresh snapshot.
   - Run `node operate/capacity/shrink-legacy.mjs deletion-set $W <fresh-snapshot>`.
   - Delete each id in `deletion.json` with `Artifact` delete (`url`, `path: <id>`). The platform asks for confirmation each time.
7. **Post-repair snapshot.** Take a backup and verify it. It is the new baseline.

**Dry runs:** `inventory ... --allow-missing` and `plan ... --dry-run` let you rehearse against an incomplete local snapshot. `plan` (without `--dry-run`) and `deletion-set` refuse an incomplete inventory.
