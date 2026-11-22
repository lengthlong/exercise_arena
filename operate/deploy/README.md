# Deploy tools

Use the authoritative contract in [model/operate/deploy/SPEC.md](../../model/operate/deploy/SPEC.md). Everything here is manual; no automated deploy or rollback tool is registered.

## Identify the candidate

Record the git commit and a content hash of the page source before any upload:

```sh
git rev-parse HEAD
sha256sum impl/arena.html
```

## Supply an acceptance candidate (0013 step 3)

Needed only when touched `on-touch` manual platform boundaries are in scope (or widened by the user) under [model/verify/SPEC.md](../../model/verify/SPEC.md). Upload the identified `impl/arena.html` only to an authorized **test** Artifact with named synthetic `test: true` data, never to the production Artifact to obtain acceptance evidence. If no test Artifact or test data scope is authorized, those manual platform boundaries remain `unverified`. Cleanup of test data needs its own explicit authorization.

## Publish an accepted page (0012)

Only after matching completed `scope: integration` acceptance evidence (zero `fail`, with mandatory automated simulated-runtime checks passed) for the same candidate, disclosure of all `unverified` boundaries, and explicit publication authorization:

1. Re-check the candidate commit and hash against the integration acceptance record and confirm all mandatory automated judgments are `pass`.
2. Disclose every remaining `unverified` boundary (untouched or user-skipped manual checks) to the user and confirm explicit publication authorization.
3. Note the intended production target from the source header and what prior source is available for restoration; the old version is not assumed to survive an upload.
4. Publish `impl/arena.html` through the Claude Artifact entry.
5. Open the actual target and check identity, loading and the affected journeys against the acceptance baseline.
6. Record candidate, target, authority, checks, disclosed unverified boundaries and outcome under `record/release/`.

Publishing the page does not authorize production data repair or ownership migration.
