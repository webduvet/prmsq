import {
	Defer
} from 'deferable';

//this is one burst
export class PromiseQ {

	_pendingLimit = undefined

	_pending = []

	// default interval 100mls
	_int=100

	// Q if pendingLimit is reached
	_q = []

	_subscribers = {
		// not used now
		data: [],
		empty: [],
		start: [],
		// once the there no more promises to schedule
		// it does not mean that all promises are settled
		done: [],
		// qOpen signals to trigger another burst
		// it is _emitted either when q is not full anymore
		// or at the end of interval
		_qOpen: [], //internal
		_qClosed: [], // internal
		_qFull: false, // internal
	}

	/**
	 * @desc
	 * takes an array of functions that return promises
	 * which can be later scheduled
	 * if the pendingLimit is reach the next promise is scheduled
	 * right after at least one promise is settled
	 *
	 * @param {Array} fns - array of functions that return promises
	 * @param {Number} interval between individual function calls in mls
	 * @param {Number} pendingLimit - max number of pending promises
	 */
	constructor(fns, interval, pendingLimit) {
		this._int = interval || this._int;
		this._pendingLimit = pendingLimit;
		this._index = 0;
		this._q = [];

		this._deferred = fns.map(fn => Defer(fn));
		this._promises = this._deferred.map(d => d.promise);

		this.on('_qOpen', function() {
			if (this._index < this._deferred.length) {
				this._scheduleNext();
			} else {
				this._emit('done')
			}
		}.bind(this))
	}

	_isQueueFull() {
		if (!this._pendingLimit) {
			return false;
		}
		//console.log(`Q size: ${this._pending.length}`)
		//console.log(`Q full: ${this._pendingLimit === this._pending.length}`)
		return this._pending.length === this._pendingLimit;
	}

	_emit(ev, args) {
		this._subscribers[ev].forEach(handler => {
			if (!args) {
				handler();
			} else {
				handler(...args)
			}
		})
	}

	/**
	 * @desc
	 * subscribe to events ['start', 'done']
	 * start is emitted when the first promise is scheduled
	 * done is emitted when all promises are scheduled or settled
	 *
	 * @param {String} event
	 * @param {Function} cb - callback in the form () => any
	 * @return {Function} unsubscribe function
	 */
	on(event, cb) {
		if (Object.keys(this._subscribers).indexOf(event) < 0) {
			throw Error(`event "${event}" is not supported.`)
		}
		this._subscribers[event].push(cb);

		const opIndex = this._subscribers[event].length - 1;

		// return convenient unsubscribe function
		return () => {
			this.off(event, cb);
		};
	}

	/**
	 * @desc
	 * unsubscribe from events
	 *
	 * @param {String} event
	 * @param {Function} cb - previously subscribed callback
	 */
	off(event, cb) {
		if (Object.keys(this._subscribers).indexOf(event) < 0) {
			throw Error(`event "${event}" is not supported.`)
		}
		const opIndex = this._subscribers[event].indexOf(cb);
		if (opIndex > -1) {
			this._subscribers[event] = [
				...this._subscribers[event].slice(0,opIndex),
				...this._subscribers[event].slice(opIndex + 1),
			]
		}
	}

	_addToQueue(opIndex) {
		// verify if _q is empty and available
		// it shoud be
		if (this._q.length > 0) {
			throw Error('Q is expected to be empty')
			return;
		}
		this._q.push(opIndex);
		//console.log(this._q)
		this._processQ();
	}

	_addPending(opIndex) {
		this._pending.push(opIndex);
		if (this._pendingLimit === this._pending.length) {
			this._emit('_qClosed')
		}
	}

	_removePending(opIndex) {
		const pos = this._pending.indexOf(opIndex);
		//console.log(`removing opIndex ${opIndex} at at ${pos}`)
		const pendingMax = this._pendingLimit === this._pending.length;
		if (pos > -1) {
			this._pending = [
				...this._pending.slice(0,pos),
				...this._pending.slice(pos + 1),
			];

			// open queue again if removing from full buffer
			// last request might have made buffer full
			// but the check is for it is deffered by interval _int
			// if it is in deffered state than we must not _emit the event now, but
			// wait for the defferement to finish.
			if (pendingMax && !this._isDeffered) {
				this._emit('_qOpen')
			}
		} else {
			throw Error("operation Index not in pending Q")
		}

	}

	_scheduleNext() {
		//this._addToQueue(this._index);
		if (this._q.length > 0) {
			throw Error('Q is expected to be empty')
			return;
		}

		if (this._pending.length === this._pendingLimit) {
			throw Error('Pending limit reached enexpectidly')
		}

		this._q.push(this._index);

		//console.log(this._q)

		this._index += 1;

		this._processQ();
	}

	_processQ(opIndex) {
		// if nothing to process then schedule
		const operationIndex = this._q.pop();
		if (typeof operationIndex === 'undefined') {
			this._scheduleNext();
			return;
		}

		//console.log('operation Index:', operationIndex)

		// open drawer with _deferred refered by index
		const d = this._deferred[operationIndex];

		this._addPending(operationIndex);

		d.trigger()
			.finally(() => {
				this._removePending(operationIndex);
			})

		// we have a limit how often the request can go
		// so deffering the next one
		this._deffer()
	}

	_deffer() {
		this._isDeffered = true;
		setTimeout(() => {
			if (!this._isQueueFull()) {
				this._emit('_qOpen')
			}
			this._isDeffered = false;
		}, this._int);
	}

	start() {
		// emiting _qOpen event for internal use
		this._emit('_qOpen');
		// emiting start event for eventual subscribers
		this._emit('start');
	}

	/**
	 * @desc
	 * returns the array of promises in the same order as the fns
	 *
	 * @return {Array<Promise>}
	 */
	get promises() {
		return this._promises;
	}
}
