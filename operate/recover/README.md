# Backups

Local backups of the production Exercise Arena artifact
(`https://claude.ai/artifact/626tqFyFmmfXKdMHYnbJAh`): every `db` document and every uploaded
asset (photos), plus the published page source.

This runbook and `backup.mjs` live in `operate/recover/` and are committed. Local backup data
lives under `backups/` at the repository root and is git-ignored: it holds a child's homework
photos and family usage data (~400 MB) and stays on this machine. Copy `backups/` somewhere else
(an external disk or private cloud storage) to keep an off-machine copy.

## Layout

```
operate/recover/
  README.md                  this runbook
  backup.mjs                 need / finalize / verify (Node built-ins only)

backups/                     git-ignored local backup data
  assets/<assetId>.<ext>     shared photo store keyed by asset id (checked against sha256 hashes in each manifest); grows incrementally; never prune an asset a retained snapshot lists
  snapshots/<YYYYMMDD>/      one full db snapshot per run (add -2, -3 for more runs on one day)
    db/<collection>/<docId>.json   exercises, sets, papers, users, settings, matches
    page/index.html          published page source at backup time
    manifest.json            counts, hashes, asset references, server listing totals
```

The backup is **full for the db and incremental for assets**. The db is small (~6 MB), so each
snapshot holds a complete, self-contained copy. Asset ids are immutable uploads, so an asset
is downloaded once into `backups/assets/` and every later snapshot reuses it. The contract is
[model/operate/recover/SPEC.md](../../model/operate/recover/SPEC.md) (journey 0014); it governs retention and restore. `manifest.json` lists every
asset with its sha256, so you can check any snapshot against the shared store.

## Taking a backup (agent procedure)

Download with Claude Code's `ArtifactData` / `Artifact` tools. They read as the owner, so no
credentials go on disk. Use `S` = today's `YYYYMMDD`.

1. **DB**: for each collection in `exercises sets papers users settings matches`, call
   `ArtifactData list` with `query.limit: 1000` and `out_dir: backups/snapshots/S/db`.
   If a result has a `next_cursor`, keep paging until none is left.
2. **Page**: `Artifact read` with `path: "index.html"`, `out_dir: backups/snapshots/S/page`.
3. **Asset listing**: `Artifact list` with `scope: "assets"`. Page through with `after` until
   nothing follows, and note the header totals (`N files, B bytes`) and every `/_blob/<id>`.
   Put the ids in a scratch file, one per line.
4. **What's new**: `node operate/recover/backup.mjs need S <ids-file>` prints the ids not yet stored.
5. **Download** each printed id with `Artifact read`, `path: <id>`, `out_dir: backups/assets`.
   This takes one call per asset. Multi-path reads do not fetch assets.
6. **Finalize**: `node operate/recover/backup.mjs finalize S --artifact <url> --listed-count N --listed-bytes B --ids <ids-file>`.
   It fails if any referenced asset is missing. Expect `matchesServerListing: true`.
   `--ids` (the platform's asset ids from step 3) is needed once any asset was ever deleted on the platform:
   the local store is never pruned, so only the listed ids belong in this snapshot's manifest.
7. **Verify**: `node operate/recover/backup.mjs verify S`.

Reads only. Never write to the production `db` or delete assets as part of a backup.

## Restoring

There is no automated restore. A restore writes production data, so it needs its own explicit
authorization (`CLAUDE.md` rule: production data repair is never implied).

- Documents: `ArtifactData batch` `set` from `snapshots/S/db/<collection>/<id>.json` (≤50 per batch).
- Assets: these keep their ids only on the original artifact. Re-uploading creates **new** ids, so
  `images` arrays would need remapping.
- Page: `page/index.html` is the published source at backup time. Compare it with `impl/arena.html`
  before republishing.

## History

| Snapshot | Docs | Assets (stored / referenced) | Notes |
|---|---|---|---|
| 20261122 | 1479 (975 exercises, 120 sets, 211 papers, 163 matches, 5 users, 5 settings) | 346 / 302, 412,096,799 bytes, matches server listing | First backup. 44 stored assets are unreferenced. Live page ≠ repo `impl/arena.html`. |
| 20261122-2 | 1479 | 346 / 302, matches listing | Pre-repair snapshot for the legacy photo repair; retained indefinitely. |
| 20261122-3-postrewrite, 20261122-4-predelete | exercises + sets only | — | Repair checkpoints (stage 5 verify, stage 6 deletion guard). |
| 20261122-5-postrepair | 1479 | 302 / 302, 197,493,834 bytes, matches listing (`--ids`) | Post-repair baseline: 114 originals replaced by shrunk copies, 158 assets deleted. |
