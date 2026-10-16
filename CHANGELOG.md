# Changelog

## Unreleased (proposed 0.1.0)

### Breaking
- Native ESM source, no Babel build; entry is `src/index.js` (was `dist/pq.js`).
  Minimum Node.js is 20.19.
- Package name in the README is now correct: `prmsq` (docs said `promise-q`).

### Fixed
- `done` could fire more than once; it now fires exactly once.
- A function throwing synchronously (or returning a plain value) now rejects /
  resolves its promise instead of breaking the queue.

### Added
- Constructor validation (`TypeError` / `RangeError`); `interval: 0` is honoured.
- Real TypeScript definitions with type tests.
- Behavioural tests (ordering, concurrency cap, interval, errors, events) on
  `node:test`; coverage script.
- CI matrix (Node 20/22/24), weekly health check incl. integration with the
  newest `deferable`, Dependabot, npm provenance on publish, CONTRIBUTING.
- README rewritten with API reference and example.
