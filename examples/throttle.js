import { PrmsQ } from '../src/index.js';

const started = Date.now();
const fakeCall = (i) => () =>
	new Promise((resolve) => {
		console.log(`+${Date.now() - started}ms start #${i}`);
		setTimeout(() => resolve(i), 300);
	});

// 10 calls, at most one every 100ms, never more than 3 pending at once
const pq = new PrmsQ(Array.from({ length: 10 }, (_, i) => fakeCall(i)), 100, 3);

pq.on('done', () => console.log('all calls have been started'));

pq.start();

const results = await Promise.allSettled(pq.promises);
console.log(`settled ${results.length} in ${Date.now() - started}ms`);
