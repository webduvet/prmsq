import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PrmsQ } from '../src/index.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Builds `n` fns that record start times / concurrency. */
function tracker(n, { duration = 20, fail = () => false } = {}) {
	const t = { starts: [], active: 0, maxActive: 0 };
	t.fns = Array.from({ length: n }, (_, i) => async () => {
		t.starts.push(Date.now());
		t.active++;
		t.maxActive = Math.max(t.maxActive, t.active);
		await sleep(duration);
		t.active--;
		if (fail(i)) throw new Error(`fail ${i}`);
		return i;
	});
	return t;
}

describe('PrmsQ', () => {
	it('exposes one promise per function, in order', async () => {
		const t = tracker(5);
		const pq = new PrmsQ(t.fns, 1);
		assert.equal(pq.promises.length, 5);
		pq.start();
		assert.deepEqual(await Promise.all(pq.promises), [0, 1, 2, 3, 4]);
	});

	it('does nothing before start()', async () => {
		const t = tracker(3);
		new PrmsQ(t.fns, 1);
		await sleep(30);
		assert.equal(t.starts.length, 0);
	});

	it('never exceeds the pending limit', async () => {
		const t = tracker(8, { duration: 30 });
		const pq = new PrmsQ(t.fns, 1, 2);
		pq.start();
		await Promise.all(pq.promises);
		assert.equal(t.maxActive, 2);
		assert.equal(t.starts.length, 8);
	});

	it('runs everything concurrently when no limit is given', async () => {
		const t = tracker(5, { duration: 60 });
		const pq = new PrmsQ(t.fns, 1);
		pq.start();
		await Promise.all(pq.promises);
		assert.equal(t.maxActive, 5);
	});

	it('waits at least `interval` between calls', async () => {
		const t = tracker(4, { duration: 1 });
		const pq = new PrmsQ(t.fns, 50);
		pq.start();
		await Promise.all(pq.promises);
		for (let i = 1; i < t.starts.length; i++) {
			assert.ok(t.starts[i] - t.starts[i - 1] >= 45, `gap ${i} too small`);
		}
	});

	it('keeps going when functions reject or throw', async () => {
		const fns = [
			async () => 'a',
			() => {
				throw new Error('sync');
			},
			async () => {
				throw new Error('async');
			},
			async () => 'd',
		];
		const pq = new PrmsQ(fns, 1, 2);
		pq.start();
		const res = await Promise.allSettled(pq.promises);
		assert.deepEqual(
			res.map((r) => r.status),
			['fulfilled', 'rejected', 'rejected', 'fulfilled']
		);
	});

	it('emits start once when started', async () => {
		const pq = new PrmsQ(tracker(2).fns, 1);
		let starts = 0;
		pq.on('start', () => starts++);
		pq.start();
		await Promise.all(pq.promises);
		assert.equal(starts, 1);
	});

	it('emits done once, after every function has been started', async () => {
		const t = tracker(6, { duration: 20 });
		const pq = new PrmsQ(t.fns, 1, 2);
		let done = 0;
		let startedAtDone;
		pq.on('done', () => {
			done++;
			startedAtDone = t.starts.length;
		});
		pq.start();
		await Promise.all(pq.promises);
		await sleep(30);
		assert.equal(done, 1);
		assert.equal(startedAtDone, 6);
	});

	it('emits done once even when the pending limit is hit at the end', async () => {
		const t = tracker(10, { duration: 150 });
		const pq = new PrmsQ(t.fns, 50, 3);
		let done = 0;
		pq.on('done', () => done++);
		pq.start();
		await Promise.all(pq.promises);
		await sleep(30);
		assert.equal(done, 1);
	});

	it('emits done for an empty queue', () => {
		const pq = new PrmsQ([], 1);
		let done = false;
		pq.on('done', () => (done = true));
		pq.start();
		assert.equal(done, true);
	});

	it('on() returns an unsubscribe function; off() removes a callback', async () => {
		const pq = new PrmsQ(tracker(2).fns, 1);
		let a = 0;
		let b = 0;
		const offA = pq.on('start', () => a++);
		const cbB = () => b++;
		pq.on('start', cbB);
		offA();
		pq.off('start', cbB);
		pq.start();
		await Promise.all(pq.promises);
		assert.equal(a, 0);
		assert.equal(b, 0);
	});

	it('rejects unknown events', () => {
		const pq = new PrmsQ([], 1);
		assert.throws(() => pq.on('nope', () => {}), /not supported/);
		assert.throws(() => pq.off('nope', () => {}), /not supported/);
	});

	it('validates constructor arguments', () => {
		assert.throws(() => new PrmsQ('x'), TypeError);
		assert.throws(() => new PrmsQ([1]), TypeError);
		assert.throws(() => new PrmsQ([], -1), RangeError);
		assert.throws(() => new PrmsQ([], 10, 0), RangeError);
		assert.throws(() => new PrmsQ([], 10, 1.5), RangeError);
		assert.doesNotThrow(() => new PrmsQ([], 0));
		assert.doesNotThrow(() => new PrmsQ([], 10, Infinity));
	});
});
