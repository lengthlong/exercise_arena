# Maintain tools

Use the authoritative contract in [model/operate/maintain/SPEC.md](../../model/operate/maintain/SPEC.md).

## Run checks

Run both from the repository root; both must exit 0 after the final change:

```sh
./check.sh
node impl/logic.test.js impl/arena.html
```

- `./check.sh` verifies workspace structure, links and the managed block. It needs an `awk` that supports regex interval expressions (`{0,3}`): GNU awk works; mawk 1.3.4 fails with `REcompile() - panic` and "Broken link scan failed". On Debian/Ubuntu install `gawk` (observed 2026-11-20 on a mawk-only container).
- `node impl/logic.test.js impl/arena.html` runs the page's pure helpers in a VM. It does not run DOM handlers, platform writes, AI, uploads or publication.

## Record the result

Write the baseline, changed pairs, tests and remaining gaps under `record/implement/` before handing the candidate to acceptance. Passing these checks is maintenance evidence, not integrated acceptance or permission to publish.
