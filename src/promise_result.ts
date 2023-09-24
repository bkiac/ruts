import {Result} from "./result"
import {type Panic} from "./panic"

interface MethodsAsync<T, E> {
	expect(panic: Panic | string): Promise<T>
	expectErr(panic: Panic | string): Promise<E>
	map<U>(f: (value: T) => U): PromiseResult<U, E>
	mapErr<F>(f: (error: E) => F): PromiseResult<T, F>
	mapOr<U>(defaultValue: U, f: (value: T) => U): Promise<U>
	mapOrElse<U>(defaultValue: (error: E) => U, f: (value: T) => U): Promise<U>
	unwrap(): Promise<T>
	unwrapErr(): Promise<E>
	unwrapOr<U>(defaultValue: U): Promise<T | U>
	unwrapOrElse<U>(defaultValue: (error: E) => U): Promise<T | U>
	match<A, B>(ok: (value: T) => A, err: (error: E) => B): Promise<A | B>
	tap(): Promise<T>
}

export class PromiseResult<T, E> implements PromiseLike<Result<T, E>>, MethodsAsync<T, E> {
	constructor(readonly promise: Promise<Result<T, E>> | PromiseLike<Result<T, E>>) {}

	then<A, B>(
		successCallback?: (res: Result<T, E>) => A | PromiseLike<A>,
		failureCallback?: (reason: unknown) => B | PromiseLike<B>,
	): PromiseLike<A | B> {
		return this.promise.then(successCallback, failureCallback)
	}

	catch<B>(rejectionCallback?: (reason: unknown) => B | PromiseLike<B>): PromiseLike<B> {
		return this.promise.then(null, rejectionCallback)
	}

	finally(callback: () => void): PromiseLike<Result<T, E>> {
		return this.then(
			(value) => {
				callback()
				return value
			},
			(reason) => {
				callback()
				throw reason
			},
		)
	}

	async expect(panic: Panic | string) {
		return (await this).expect(panic)
	}

	async expectErr(panic: Panic | string) {
		return (await this).expectErr(panic)
	}

	map<U>(f: (value: T) => U): PromiseResult<U, E> {
		return new PromiseResult(this.then((result) => result.map(f)))
	}

	mapErr<F>(f: (error: E) => F) {
		return new PromiseResult<T, F>(this.then((result) => result.mapErr(f)))
	}

	async mapOr<U>(defaultValue: U, f: (value: T) => U) {
		return (await this).mapOr(defaultValue, f)
	}

	async mapOrElse<U>(defaultValue: (error: E) => U, f: (value: T) => U) {
		return (await this).mapOrElse(defaultValue, f)
	}

	async unwrap() {
		return (await this).unwrap()
	}

	async unwrapErr() {
		return (await this).unwrapErr()
	}

	async unwrapOr<U>(defaultValue: U) {
		return (await this).unwrapOr(defaultValue)
	}

	async unwrapOrElse<U>(defaultValue: (error: E) => U) {
		return (await this).unwrapOrElse(defaultValue)
	}

	async match<A, B>(ok: (value: T) => A, err: (error: E) => B) {
		return (await this).match(ok, err)
	}

	async tap() {
		return (await this).tap()
	}
}