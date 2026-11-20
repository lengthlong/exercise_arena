# Exercise Arena acceptance contract

Acceptance verifies that the page still satisfies the journey success conditions after a change.

## Journeys served

- user/0001–0006
- operator/0001–0002

## Environments and substitutes

| Environment or dependency | How provided | Real or substitute |
|---|---|---|
| Workspace checks | `./check.sh` | Real |
| Page logic | `node impl/logic.test.js impl/arena.html` | Real |
| Published page | Manual inspection in Claude artifact | Real |

## Entries and coverage

| Acceptance entry | Steps or scenarios | Criterion |
|---|---|---|
| Local checks | All journeys | Checker and logic tests pass |
| Manual page walkthrough | Changed journeys | Observed behavior matches the journey and model |

## Sizing by change

Use the affected journeys and model files to select the smallest walkthrough that covers the change.

## External writes and confirmation

- Publishing the Claude artifact requires separate user authorization.

## Changes without implementation records

- None.
