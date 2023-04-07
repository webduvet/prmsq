
const defaultConfig = {
	randomReject: true,
	successRate: 0.9,
	fold: 1000,
	randomDuration: true,
	duration: 500,
}
/**
 * @desc
 * 	fakeCall is a function that returns a promise that resolves or rejects
 *
 * 	@param {Boolean} randomReject - whether to reject the promise or not
 * 	@param {Number} successRate - the probability of the promise resolving
 * 	@param {Number} fold - the duration of the promise
 */
export function fakeCall(config) {
	config = { ...defaultConfig, ...config };
	const { randomReject, successRate, fold, randomDuration } = config;
	const duration = randomDuration ? Math.floor(fold * Math.random()) + 200 : config.duration;

	return () => new Promise((resolve, reject) => {
		setTimeout(() => {
			if (randomReject && Math.floor(Math.random() > successRate)) {
				reject('rejected')
			} else {
				resolve('resolved')
			}
		}, duration)
	})
}
