# Deploy support contract

- **Journey or trigger** operator/0002
- **Operator and authorization** A user with Claude artifact access and separate authorization to publish.
- **Environment and dependencies** Accepted local page source and the target Claude artifact.

## Publish page

- **Prerequisites and scope** Confirm acceptance and explicit user authorization before publishing.
- **Success and failure** The published page loads and matches the accepted behavior; any difference is a failed deployment.
- **Verification and recovery** Open the published page and inspect the affected behavior. If it fails, keep the prior version and record the failure.
- **Implementation** Manual publication through the Claude artifact; no automated deploy tool is registered.
