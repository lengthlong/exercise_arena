---
name: design-publish
description: Publish design to a reader-facing document and sync both ways. Use to publish or update a design document, incorporate reader edits, or reconcile a hub with the design or external target.
---

# design-publish

The external publication is the target; its workspace counterpart is the hub in `doc/NNNN-<topic>.<ext>`. Use the integration skill enabled under `integrations` in `.discuss_design/config.yaml` for platform operations, and load `design-writing` for prose edits.

## Rules

1. Obtain user confirmation before writing to the external target. Preserve comments and formatting; explain any loss before requesting confirmation for full replacement.
2. Compare locally against committed inputs. Check relevant hub and design paths with `git status --porcelain --untracked-files=all -- <paths>`, listing staged, unstaged and untracked inputs for the user to handle or authorize committing. Ignore unrelated drafts and preserve working state.
3. Keep credentials in the platform tool's own configuration.

## Hub format

Use a unique chronological four-digit number. Keep only hubs and an optional `README.md` in `doc/`. The checker validates Markdown hubs.

```markdown
> target: <link>
> target-base: <revision, timestamp or hash> · <date>
> design-base: commit <X> · <date>
```

Use `unpublished` for both target fields before publication, `uncompared` for a design base pending first comparison, and `unsynced` for an independent document. Use one header format per hub. If a coordinate is missing, unrecognized, ambiguous or conflicting, stop before writing and report it. Save the initial fetched body with only the integration's declared transformations, preserve untouched paragraphs, and keep platform comments on the platform.

## Sync directions

- **Target to hub:** Compare the target baseline with the latest revision and merge reader changes into the hub.
- **Hub to target:** Publish first for an unpublished hub and populate its fields; otherwise patch changed blocks (using the target baseline as common ancestor when both sides changed). Refetch after writing, replace the hub body with the normalized readback and advance `target-base`.
- **Design to hub:** Compare changes from `design-base` to the current design and update the hub (no discussion required).
- **Hub to design:** Take substantive design changes through `design-discuss`, including the first full comparison or switching an independent document to sync. Check both directions before advancing `design-base`.

Target-to-hub and hub-to-target edits follow this workflow directly. Commit each completed direction separately. After changing `integrations` in `.discuss_design/config.yaml`, run `design-init` `link` and commit config and managed updates together.

## Integration capabilities

| Operation | Required | Fallback when absent |
|---|---|---|
| Create target and return link | Yes | — |
| Fetch current body | Yes | — |
| Get revision marker | Yes | — |
| Fetch historical body | No | Use the Git hub commit that last updated the target baseline as common ancestor |
| Patch changed blocks | No | Merge target changes first, disclose comment and formatting loss, and confirm whole-document replacement |
| Normalize reread content | No | Save as fetched |
| Validate diagrams | No | Skip and disclose in write-off |

| File | When to use |
|---|---|
| [references/legacy.md](references/legacy.md) | Hub uses legacy Chinese headers or its `design-base` predates earlier layout renames. |
