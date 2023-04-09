import {
	fakeCall
} from '../helpers/utils.js';

import {
	PrmsQ
} from '../code/pq.js'

console.log('**** PrmsQ ****')

// test array of 50 fake calls returning promise
const test = new Array(...new Array(50)).map(() => fakeCall());

const pq = new PrmsQ(test, 100, 5)


pq.on('_qClosed', function() {
	console.log('_qClosed')
	console.log(pq._pending)
})

pq.on('_qOpen', function() {
	console.log('_qOpen')
})

Promise.allSettled(pq.promises)
	.then(values => {
		console.log(values)
	})

pq.start()
