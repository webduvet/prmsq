import {
	PrmsQ,
} from '../code/pq.js'

import {
    fakeCall
} from '../helpers/utils.js'

import {
	assert,
} from 'chai'

import {
	spy
} from 'sinon'

describe('PrmsQ: ', function() {
	describe('get promises', function(done) {
		it('should return an array of promises', function() {
			// 50 fake calls returning promise each
			const test = new Array(...new Array(10))
				.map(() => new Promise((resolve, reject) => {}));
			const pq = new PrmsQ(test, 100, 5)
			assert.isArray(pq.promises)
			Promise.allSettled(pq.promises).then(done)
		})
	})

	describe('start', function() {
		it('should start the promise settlement', function(done) {
			const test = new Array(...new Array(10))
				.map(() => fakeCall({ fold: 100 }));
			const pq = new PrmsQ(test, 100, 5);
			let spied = spy();
			pq.on('_qOpen', spied);
			pq.start();
			Promise.allSettled(pq.promises).then(() => {
				assert.isTrue(spied.calledOnce)
			}).then(() => { console.log('all settled...') }).finally(done)
		})
	})

	describe('on', function() {
		it('should add an event listener', function(done) {
			this.timeout(10000);
			const test = new Array(...new Array(10))
				.map(() => fakeCall({ fold: 100 }));
			const pq = new PrmsQ(test, 100, 5)
			let spied = spy();
			pq.on('start', spied)
			pq.start()
			Promise.allSettled(pq.promises).then(() => {
				assert.isTrue(spied.calledOnce)
			}).finally(done)
		})
	})

	describe('off', function() {
		it('should remove an event listener', function(done) {
			this.timeout(10000);
			const test = new Array(...new Array(10))
				.map(() => fakeCall({ fold: 100 }));
			const pq = new PrmsQ(test, 100, 5)
			let spiedOn = spy();
			const unsubscribe = pq.on('_qOpen', spiedOn)
			//pq.off('_qOpen', spy)
			unsubscribe();
			pq.start()
			Promise.allSettled(pq.promises).then(() => {
				assert.isFalse(spiedOn.called)
				done()
			}).catch(done)
		})
	})

	describe('Throttle the queue', function() {
		it("should throttle the queue if it's jammed", function(done) {
			this.timeout(10000);
			const fakeConfig = {
				randomReject: true,
				successRate: 0.9,
				fold: 1000,
				randomDuration: false,
				duration: 1000,
			}
			const test = new Array(...new Array(5))
				.map(() => fakeCall(fakeConfig));
			// 0.1s interval, 2 concurrent to make it jammed
			const pq = new PrmsQ(test, 100, 2)
			let spiedOnClosed = spy();
			pq.on('_qClosed', spiedOnClosed)
			pq.start()
			Promise.allSettled(pq.promises).then(() => {
				assert.isTrue(spiedOnClosed.called)
				done()
			}).catch(done)
		});

		it("shouldn't throttle the queue if it is not jammed", function(done) {
			this.timeout(10000);
			const fakeConfig = {
				randomReject: true,
				successRate: 0.9,
				fold: 1000,
				randomDuration: false,
				duration: 10,
			}
			const test = new Array(...new Array(5))
				.map(() => fakeCall(fakeConfig));
			const pq = new PrmsQ(test, 50, 2)
			let spiedOnClosed = spy();
			pq.on('_qClosed', spiedOnClosed)
			let spiedOnOpen = spy();
			pq.on('_qOpen', spiedOnOpen)
			pq.start()
			Promise.allSettled(pq.promises).then(() => {
				assert.isTrue(spiedOnOpen.called)
				assert.isFalse(spiedOnClosed.called)
				done();
			}).catch(done)
		});
		it("shouldn't throttle the queue if no pendingLimit is set", function(done) {
			this.timeout(10000);
			const fakeConfig = {
				randomReject: true,
				successRate: 0.9,
				fold: 1000,
				randomDuration: false,
				duration: 10,
			}
			const test = new Array(...new Array(5))
				.map(() => fakeCall(fakeConfig));
			const pq = new PrmsQ(test, 500)
			let spiedOnClosed = spy();
			pq.on('_qClosed', spiedOnClosed)
			let spiedOnOpen = spy();
			pq.on('_qOpen', spiedOnOpen)
			pq.start()
			Promise.allSettled(pq.promises).then(() => {
				assert.isTrue(spiedOnOpen.called)
				assert.isFalse(spiedOnClosed.called)
				done();
			}).catch(done)
		});
	})

})
