# Shrink legacy oversized photos: tool and runbook

> status: completed (2026-11-22)
> location: branch `develop`, commits `66df996..1337315`

## Upstream
<!-- upstream -->

- 0044 #1 no-implementation Journey 0014 is served by the existing `backups/` tool; nothing else to build.
- 0044 #2 implemented `backups/README.md` links the recover contract and states retention; the wording "content-addressed" is corrected; `operate/README.md` lists the recover tool.
- 0044 #3 implemented `operate/capacity/shrink-legacy.mjs`, its tests and runbook; `CLAUDE.md` map row `operate/capacity/`; `.gitignore` ignores `backups/repairs/`.
- 0044 #4 no-implementation Index text only.
- 0044 #5 no-implementation The page already shrinks new photos and keeps the decode-failure fallback; no page change.
- 0044 #6 no-implementation The page never deleted assets; wording only.
- 0044 #7 no-implementation Map row already updated at write-off.
- 0044 #8 no-implementation Journey wording only.
- 0044 #9 no-implementation Acceptance policy wording only; the capacity and recover tools change no page behavior.
- 0044 #10 no-implementation Deploy contract wording only.

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|
| None | The capacity and recover operations are verified by their own contracts, not by slice acceptance (`model/verify/SPEC.md`) | 0014 1–5 (unchanged tool) |

## Implementation choices

- Shrink parity: the tool extracts `PHOTO_MAX_SIDE`, `fitSize` and `shrinkPhoto` verbatim from `impl/arena.html` and runs them in headless Google Chrome via the DevTools protocol over Node's built-in WebSocket. It adds no playwright or other dependency. The tool refuses to run if the page's limit differs from its own 2400.
- Shrink-rule check: Node parses JPEG headers for the oriented size, APP1/EXIF/GPS presence and the ICC profile name. Chrome's canvas JPEG embeds an sRGB profile, so "sRGB" is judged by profile name (absent or named sRGB), not by profile absence.
- Pinned versions: taken from the `ArtifactData` list output saved as text under `<work>/versions/`, because documents saved with `out_dir` carry no version.
- Verification uses the page's own `photoGroups` from the `LOGIC` block via `vm`, restricted to pre-repair documents.
- An upload result is accepted only as a `/_blob/<32 hex>` id, which gives the canary its stop condition.
- Dry runs: `inventory --allow-missing` and `plan --dry-run`. `plan` without `--dry-run`, and `deletion-set`, refuse an incomplete inventory.

## Tests and checks

- `node operate/capacity/shrink-legacy.test.mjs`: 9 passed. They cover page parity, header parsing, the shrink rule, inventory, plan, verify, the deletion set and the Chrome case: an orientation-6 photo with GPS comes out upright at 1600×2400, with no EXIF, verified by pixel colour.
- `./check.sh`: exit 0, with the existing advisory about the top-level `backups/`.
- `node impl/logic.test.js impl/arena.html`: all passed.
- Dry run on snapshot `20261122` (`--allow-missing`, in `backups/repairs/dryrun-20261122/`, not committed):
  - 114/114 referenced oversized photos shrunk and checked; 220.1 MiB became 62.6 MiB.
  - One rotated output inspected by eye: upright and legible.
  - Simulated plan: 125 `images`-only updates in 3 batches.
  - Simulated verify over all `exercises` and `sets`: 0 problems; photo groups preserved.
  - Simulated deletion set: 158.
- Not covered:
  - Real uploads through the Artifact tool and their id shape (the canary covers this).
  - Real pinned writes and version conflicts.
  - Display in the live page.
  - Snapshot `20261122` itself no longer verifies: two unreferenced thumbnails were removed locally. The real run needs a fresh verified snapshot.
