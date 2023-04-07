import {
	fakeCall
} from '../helpers/utils.js';

import {
	PromiseQ
} from '../code/pq.js'

console.log('**** PromiseQ ****')

// test array of 50 fake calls returning promise
const test = new Array(...new Array(50)).map(() => fakeCall());

const rl = new PromiseQ(test, 100, 5)


rl.on('_qClosed', function() {
	console.log('_qClosed')
	console.log(rl._pending)
})

rl.on('_qOpen', function() {
	console.log('_qOpen')
})

Promise.allSettled(rl.promises)
	.then(values => {
		console.log(values)
	})

rl.start()
