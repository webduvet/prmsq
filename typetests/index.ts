// Compile-time checks only: run with `npm run test:types`.
import { PrmsQ } from '../src/index.js';

const pq = new PrmsQ([() => Promise.resolve(1), () => 2], 100, 5);
const ps: Promise<number>[] = pq.promises;
const off: () => void = pq.on('done', () => {});
pq.off('start', () => {});
pq.start();

// @ts-expect-error - unknown event
pq.on('nope', () => {});
// @ts-expect-error - fns must be functions
new PrmsQ([Promise.resolve(1)]);

export { ps, off };
