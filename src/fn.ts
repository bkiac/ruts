import {type Result} from "./result"
import {ResultPromise} from "./result_promise"
import {run, runAsync} from "./run"
import type {InferErr, InferOk} from "./util"

/**
 * Wraps a function that returns any shape of `Result<any, any>` and infers its return type as `Result<T, E>`.
 *
 * **Examples**
 *
 * ```
 * // (a: number, b: number) => Err<string> | Ok<number>
 * const divide = (a: number, b: number) => b === 0 ? Err("division by zero") : Ok(a / b)
 *
 * // (a: number, b: number) => Result<number, string>
 * const wrapped = fn(divide)
 * ```
 */
export function fn<A extends any[], R extends Result<any, any>>(
	f: (...args: A) => R,
): (...args: A) => Result<InferOk<R>, InferErr<R>> {
	return f
}

/**
 * Wraps a function that returns any shape of `Promise<Result<any, any>>` and wraps the return value in a `ResultPromise`.
 *
 * **Examples**
 *
 * ```
 * // (a: number, b: number) => Promise<Err<string> | Ok<number>>
 * const divide = async (a: number, b: number) => b === 0 ? Err("division by zero") : Ok(a / b)
 *
 * // (a: number, b: number) => ResultPromise<number, string>
 * const wrapped = asyncFn(divide)
 * // now you can do this:
 * const result = await wrapped(1, 2) // => Result<number, string>
 * ```
 */
export function asyncFn<A extends any[], R extends ResultPromise<any, any>>(
	f: (...args: A) => R,
): (...args: A) => ResultPromise<InferOk<Awaited<R>>, InferErr<Awaited<R>>>
export function asyncFn<A extends any[], R extends Promise<Result<any, any>>>(
	f: (...args: A) => R,
): (...args: A) => ResultPromise<InferOk<Awaited<R>>, InferErr<Awaited<R>>>
export function asyncFn(f: any): any {
	return function (...args: any[]) {
		return new ResultPromise(f(...args))
	}
}

/**
 * Wraps a generator function that returns a `Result` and infers its return type as `Result<T, E>`.
 *
 * `yield*` must be used to yield the result of a `Result`.
 *
 * **Examples**
 *
 * ```ts
 * // $ExpectType (arg: number) => Result<number, string>
 * const fn = genFn(function* (arg: number) {
 *   const a = yield* Ok(1)
 *   if (Math.random() > 0.5) {
 *     yield* Err("error")
 *   }
 *   return a + arg
 * })
 * ```
 */
export function genFn<A extends any[], R extends Result<any, any>, T>(
	fn: (...args: A) => Generator<R, T, any>,
): (...args: A) => Result<T, InferErr<R>> {
	return function (...args: any[]) {
		return run(() => fn(...(args as A)))
	}
}

/**
 * Wraps an async generator function that returns a `Result` and infers its return type as `ResultPromise<T, E>`.
 *
 * `yield*` must be used to yield the result of a `Result`.
 *
 * **Examples**
 *
 * ```ts
 * // $ExpectType (arg: number) => ResultPromise<number, string>
 * const fn = asyncGenFn(async function* (arg: number) {
 *   const a = yield* Ok(1)
 *   if (Math.random() > 0.5) {
 *    yield* Err("error")
 *   }
 *   return a + arg
 * })
 * ```
 */
export function asyncGenFn<
	A extends any[],
	R extends ResultPromise<any, any> | Result<any, any>,
	T,
>(
	fn: (...args: A) => AsyncGenerator<R, T, any>,
): (...args: A) => ResultPromise<T, InferErr<Awaited<R>>> {
	return function (...args: any[]) {
		return runAsync(() => fn(...(args as A)))
	}
}
