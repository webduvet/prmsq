import {
	PromiseQ,
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

describe('PromiseQ: ', function(done) {
	describe('get promises', function() {
		it('should return an array of promises', function() {
			// 50 fake calls returning promise each
			const test = new Array(...new Array(50)).map(() => new Promise((resolve, reject) => {}));
			const pq = new PromiseQ(test, 100, 10)
			assert.isArray(pq.promises)
			Promise.allSettled(pq.promises).then(done)
		})
	})

	describe('start', function(done) {
		it('should start the promise settlement', function() {
			const test = new Array(...new Array(10)).map(() => Promise.resolve(1));
			const pq = new PromiseQ(test, 100, 5);
			let spied = spy();
			pq.start();
			Promise.allSettled(pq.promises).then(() => {
				assert.isTrue(spied.calledOnce)
			}).then(done)
		})
	})

	describe('on', function() {
		it('should add an event listener', function(done) {
			const test = new Array(...new Array(50)).map(() => fakeCall);
			const pq = new PromiseQ(test, 100, 10)
			const spy = pq.on('_qOpen', () => {})
			pq.start()
			Promise.allSettled(pq.promises).then(() => {
				assert.isTrue(spy.called)
			}).then(done)
		})
	})

	describe('off', function() {
		it('should remove an event listener', function(done) {
			const test = new Array(...new Array(50)).map(() => fakeCall);
			const pq = new PromiseQ(test, 100, 10)
			const spy = pq.on('_qOpen', () => {})
			pq.off('_qOpen', spy)
			pq.start()
			Promise.allSettled(pq.promises).then(() => {
				assert.isFalse(spy.called)
			}).then(done)
		})
	})

})
