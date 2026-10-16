export type PrmsQEvent = 'start' | 'done';

/**
 * Runs promise-returning functions with a delay between calls and an optional
 * cap on how many may be pending at once.
 */
export class PrmsQ<T = unknown> {
  /**
   * @param fns functions that each start an operation and return a promise
   * @param interval minimum delay in ms between starting two calls (default 100)
   * @param pendingLimit max number of pending promises (default: unlimited)
   */
  constructor(
    fns: Array<() => T | PromiseLike<T>>,
    interval?: number,
    pendingLimit?: number
  );

  /** One promise per function, in the same order as `fns`. */
  readonly promises: Promise<Awaited<T>>[];

  /** Starts scheduling the functions. */
  start(): void;

  /**
   * Subscribes to an event:
   * - `start`: `start()` was called
   * - `done`: every function has been started (not necessarily settled)
   *
   * @returns a function that unsubscribes the callback
   */
  on(event: PrmsQEvent, callback: () => void): () => void;

  /** Unsubscribes a callback; pass the same reference used with `on`. */
  off(event: PrmsQEvent, callback: () => void): void;
}
