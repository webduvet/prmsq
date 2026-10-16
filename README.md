# prmsq - Promise Queue

[![npm](https://img.shields.io/npm/v/prmsq.svg)](https://www.npmjs.com/package/prmsq)
[![CI](https://github.com/webduvet/prmsq/actions/workflows/ci.yml/badge.svg)](https://github.com/webduvet/prmsq/actions/workflows/ci.yml)
[![Weekly health check](https://github.com/webduvet/prmsq/actions/workflows/weekly.yml/badge.svg)](https://github.com/webduvet/prmsq/actions/workflows/weekly.yml)
[![types](https://img.shields.io/npm/types/prmsq.svg)](https://www.npmjs.com/package/prmsq)
[![install size](https://packagephobia.com/badge?p=prmsq)](https://packagephobia.com/result?p=prmsq)
[![license](https://img.shields.io/npm/l/prmsq.svg)](LICENSE)

Throttle a batch of asynchronous calls: space them out with a **call interval**
and cap how many may be **pending at once**. Built on
[deferable](https://github.com/webduvet/deferable).

```
fns: [ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ]  --interval 100ms, max 3 pending-->  promises: [ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ]
```

- You get all the promises back **immediately**, in the order of your functions
- Nothing runs until `start()`
- Failures never block the queue
- Typed (TypeScript definitions included), ESM, one small dependency

## Install

```sh
npm install prmsq
```

Requires Node.js 20.19+ (or a modern bundler/browser).

## Usage

```js
import { PrmsQ } from 'prmsq';

const urls = [/* ...50 urls... */];
const fns = urls.map((url) => () => fetch(url));

// at most one request per 100ms, never more than 5 in flight
const pq = new PrmsQ(fns, 100, 5);

pq.on('done', () => console.log('every request has been started'));

pq.start();

const results = await Promise.allSettled(pq.promises);
```

Run the full demo with `npm run example` (see [`examples/throttle.js`](examples/throttle.js)).

## API

### `new PrmsQ(fns, interval?, pendingLimit?)`

| Argument | Description |
| --- | --- |
| `fns` | Array of functions, each starting an operation and returning a promise (or value). |
| `interval` | Minimum delay in ms between starting two calls. Default `100`; `0` disables the delay. |
| `pendingLimit` | Max number of pending promises. Once reached, the next call waits until one settles. Default: unlimited. |

Invalid arguments throw `TypeError` / `RangeError`.

### `pq.promises`

One promise per function, same order as `fns`. They reject if the function
throws or rejects - attach handlers or use `Promise.allSettled`, otherwise Node
reports unhandled rejections.

### `pq.start()`

Starts scheduling.

### `pq.on(event, callback)` / `pq.off(event, callback)`

| Event | Fires |
| --- | --- |
| `start` | when `start()` is called |
| `done` | once, when every function has been **started** (not necessarily settled - use `Promise.allSettled(pq.promises)` for that) |

`on` returns an unsubscribe function. `off` needs the same callback reference.
Unknown events throw.

### TypeScript

```ts
const pq = new PrmsQ([() => fetch('/a').then((r) => r.json())], 100, 2);
pq.promises; // Promise<any>[]
```

## Development

```sh
npm ci
npm test            # node:test
npm run test:types
npm run coverage
npm run example
```

CI runs on Node 20, 22 and 24. A [weekly workflow](.github/workflows/weekly.yml)
re-tests on the newest Node and dependencies, audits them, and checks the
integration against the newest published `deferable`.

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [CHANGELOG](CHANGELOG.md).

## License

[MIT](LICENSE) © Andrej Bartko
