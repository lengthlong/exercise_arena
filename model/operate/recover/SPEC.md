# Recover support contract

- **Journey or trigger** [0014](../../../journey/0014-back-up-production-library.md) steps 1–5: the operator's own schedule, and immediately before any authorized production repair.
- **Operator and authorization** Operator with owner access to the production Artifact. Backup reads production only and writes only local files. Restore writes production, so it needs its own explicit authorization.
- **Environment and dependencies** Local checkout, Node.js, and the Claude Artifact tools reading as the owner (no credentials stored on disk). The asset tool fetches one asset per call.

## Take a backup

- **Prerequisites and scope**
  - Objects: every document in `exercises`, `sets`, `papers`, `users`, `settings` and `matches`; the published page; every platform asset.
  - Allowed actions: reads of production, and writes to the local backup folder only.
- **Layout**
  - A dated snapshot holds a full copy of every collection, the page source and a manifest.
  - Assets live in one shared local store keyed by asset id, fetched incrementally and checked against sha256 hashes in the manifest.
  - The manifest records document counts and hashes, stored-asset hashes, referenced assets and the platform listing's count and bytes.
- **Success** Every collection read completely; stored asset count and bytes equal the platform listing; every referenced asset is stored; the snapshot verifies.
- **Failure and stop**
  - A partial read, a failed download or a count or byte mismatch stops finalization.
  - A snapshot that fails verification is not a backup. Take a new one.
  - A referenced asset missing on the platform is recorded as a finding, not repaired.
- **Verification** Re-hash every document and stored asset against the manifest and check every referenced asset is stored.

## Retention

- Backup data is child material and family usage data. It stays local, outside the repository, and is never committed.
- Never prune an asset that a retained snapshot lists.
- A snapshot taken before a production repair is the pre-repair snapshot and is retained indefinitely.
- An off-machine copy is recommended but not required. The operator has accepted that a single local copy can be lost with the machine.

## Restore

- **Authorization** Restore writes production, so it is never part of a backup and needs its own explicit authorization and scope.
- **Limits**
  - A re-uploaded asset gets a new id. Restoring a photo means uploading it again and rewriting the referencing `images`.
  - Writing a whole document back from a snapshot drops every attempt made after the snapshot. Prefer field-scoped reverse writes, such as the `images`-only reversal in the [capacity contract](../capacity/SPEC.md).
- **Implementation** No restore tool exists.

## Implementation

The `operate/recover/` tool and procedure (with local git-ignored backup data under `backups/`); see the workspace map in `CLAUDE.md`.
