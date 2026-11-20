# Deploy tools

Use the authoritative contract in [model/operate/deploy/SPEC.md](../../model/operate/deploy/SPEC.md). Everything here is manual; no automated deploy or rollback tool is registered.

## Identify the candidate

Record the git commit and a content hash of the page source before any upload:

```sh
git rev-parse HEAD
sha256sum impl/arena.html
```

## Supply an acceptance candidate (operator/0003 step 3)

Upload the identified `impl/arena.html` only to an authorized **test** Artifact with named test data, never to the production Artifact to obtain acceptance evidence. If no test Artifact or test data scope exists, runtime acceptance stays unverified. Cleanup of test data needs its own explicit authorization.

## Publish an accepted page (operator/0002)

Only after matching acceptance evidence for the same candidate and explicit publication authorization:

1. Re-check the candidate commit and hash against the acceptance record.
2. Note the intended production target from the source header and what prior source is available for restoration; the old version is not assumed to survive an upload.
3. Publish `impl/arena.html` through the Claude Artifact entry.
4. Open the actual target and check identity, loading and the affected journeys against the acceptance baseline.
5. Record candidate, target, authority, checks and outcome under `record/deliver/`.

Publishing the page does not authorize production data repair or ownership migration.
