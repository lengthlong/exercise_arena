# Capacity support contract

- **Journey or trigger** One-off, user-authorized repair: shrink the photos stored before the page's 2400 px limit took effect, relink them and delete superseded and unreferenced assets. A later oversized photo needs a new decision; the page's own handling of such photos is outside this contract.
- **Operator and authorization** Operator with owner access to the production Artifact. Design confirmation authorizes building and dry-running the tool. Three production steps each need separate explicit confirmation: the canary, the bulk `images` rewrite, and the asset deletion. The platform also asks the person to confirm every asset delete.
- **Environment and dependencies**
  - Local checkout, Node.js, a local image tool and the Claude Artifact tools.
  - A verified [0014](../../../journey/0014-back-up-production-library.md) snapshot taken immediately before the repair ([recover contract](../recover/SPEC.md)).
  - Nobody uses the production app from the pre-repair snapshot until the post-repair snapshot; the users have agreed to stay out.

## Shrink legacy oversized photos

- **Scope**
  - Oversized: a stored photo whose long edge exceeds 2400 px.
  - Rewrite every `exercises` and `sets` document that references an oversized photo. Unresolved legacy sets (no `owner`) are included; their `owner` is never written or inferred.
  - Delete the superseded originals and every asset that the pre-repair snapshot lists as referenced by no document.
- **Shrink rule** Each output must match what the page's canvas shrink would produce, checked on every output:
  - Pixels upright; orientation tag absent or normal.
  - Aspect equal to the correctly oriented original; long edge = min(2400, oriented long edge).
  - No EXIF or location metadata; sRGB colour.
  - JPEG quality 0.85 on a white background.
- **Stages and stop points**
  1. Take the pre-repair snapshot and verify it.
  2. Canary: shrink one photo of one independent exercise, upload it, rewrite that exercise, and check it displays in the page and in saved-photo supplementation. Stop if the uploaded id shape or display differs from page uploads. Keep the original until stage 6.
  3. Shrink and upload every remaining oversized photo before any further document write.
  4. Rewrite each document with an `images`-only update pinned to the version read. Keep the order, and map old to new ids one-to-one so shared photos stay shared. Re-read and retry on a version conflict.
  5. Verify, for every pre-repair document:
     - every reference resolves to a stored asset that passes the shrink rule;
     - its pre-repair attempts are a prefix of its current attempts;
     - every field except `images` is unchanged;
     - photo groupings over current documents, restricted to pre-repair documents, equal those of the pre-repair documents with ids mapped.
  6. Delete the deletion set: superseded ids plus the snapshot's unreferenced ids, minus every id referenced in a fresh full read of `exercises` and `sets` taken just before deletion. Never delete an asset absent from the pre-repair snapshot. A document still holding an old id is rewritten and read again first.
  7. Take a post-repair snapshot and verify it; it is the new baseline.
- **Operation map** Kept locally outside the repository with the backup: per document its id, old `images`, new `images` and the version written, plus old→new asset ids.
- **Success** Every referenced photo is within 2400 px and upright; all verification in stage 5 holds; the deletion set is gone; the post-repair snapshot verifies.
- **Failure and stop**
  - Any failure before stage 6 leaves production readable, because old ids still resolve.
  - An unused new upload left by a stop is removed in stage 6 if it is in the deletion set, or otherwise left as an unreferenced asset.
  - A verification failure stops before deletion.
- **Recovery**
  - Before stage 6: rewrite `images` back from the operation map.
  - After stage 6: re-upload originals from the pre-repair snapshot and rewrite only `images` from the operation map. Never restore a whole document, which would drop later attempts.
- **Implementation** Pending; see the workspace map in `CLAUDE.md` once the tool exists.
