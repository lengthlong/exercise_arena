# Legacy hubs and historical baselines (design-publish)

Read this only when a hub uses legacy Chinese header fields or its `design-base` commit predates earlier workspace layout renames.

## Legacy hub headers

- Read and update `目标`, `与目标` and `与设计` as equivalents of `target`, `target-base` and `design-base`.
- Treat `未发布`, `未对照` and `不同步` as equivalents of `unpublished`, `uncompared` and `unsynced`.
- Keep one header format per hub. Translating a header preserves its coordinate values and does not advance baselines.

## Historical baselines

Use `git log --follow` and commit diffs to trace prior paths on both the hub and design sides:

- Older hubs may predate `doc/`.
- Specifications moved into `design/spec/` before `design/` became `model/`.
- Domain `OVERVIEW.md` and architecture `CONTAINERS.md` were briefly named `README.md` in their own directories before the current `GLOSSARY.md`, `DOMAIN.md`, `CONTAINER.md`, `SCENARIO.md`, journey index and `SPEC.md` layout.
- Component files and their specifications later moved into owning container directories (`model/arch/<container>/`).
- Journeys moved from `model/journey/` into `journey/user/` and `journey/operator/`, and later flattened into `journey/` with `USER.md` and `OPERATOR.md`; compare the current indexes with prior indexes, including plans, renumbered IDs and dependencies.
- Operation contracts split from tooling READMEs into `model/operate/`; use historical content and diffs to reconstruct splits.

Preserve recorded baselines and report any ambiguous or lossy reconstruction before syncing.
