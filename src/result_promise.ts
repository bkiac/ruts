import type {Result} from "./result"

export class ResultPromise<T, E> implements PromiseLike<Result<T, E>> {
	constructor(
		readonly promise: Promise<Result<T, E>> | PromiseLike<Result<T, E>> | ResultPromise<T, E>,
	) {}

	then<A, B>(
		successCallback?: (res: Result<T, E>) => A | PromiseLike<A>,
		failureCallback?: (reason: unknown) => B | PromiseLike<B>,
	): PromiseLike<A | B> {
		return this.promise.then(successCallback, failureCallback)
	}

	catch<B>(rejectionCallback?: (reason: unknown) => B | PromiseLike<B>): PromiseLike<B> {
		return this.promise.then(undefined, rejectionCallback)
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

	and<U, F>(other: ResultPromise<U, F>): ResultPromise<U, E | F> {
		return new ResultPromise(
			this.then((result) => other.then((otherResult) => result.and(otherResult))),
		)
	}

	andThen<U, F>(f: (value: T) => Result<U, F>): ResultPromise<U, E | F> {
		return new ResultPromise(this.then((result) => result.andThen((value) => f(value))))
	}

	async expect(panic: string): Promise<T> {
		return (await this).expect(panic)
	}

	async expectErr(panic: string): Promise<E> {
		return (await this).expectErr(panic)
	}

	inspect(f: (value: T) => void): ResultPromise<T, E> {
		return new ResultPromise(this.then((result) => result.inspect(f)))
	}

	inspectErr(f: (error: E) => void): ResultPromise<T, E> {
		return new ResultPromise(this.then((result) => result.inspectErr(f)))
	}

	map<U>(f: (value: T) => U): ResultPromise<U, E> {
		return new ResultPromise(this.then((result) => result.map(f)))
	}

	mapErr<F>(f: (error: E) => F): ResultPromise<T, F> {
		return new ResultPromise(this.then((result) => result.mapErr(f)))
	}

	async mapOr<A, B>(defaultValue: A, f: (value: T) => B): Promise<A | B> {
		return (await this).mapOr(defaultValue, f)
	}

	async mapOrElse<A, B>(defaultValue: (error: E) => A, f: (value: T) => B): Promise<A | B> {
		return (await this).mapOrElse(defaultValue, f)
	}

	or<U, F>(other: ResultPromise<U, F>): ResultPromise<T | U, F> {
		return new ResultPromise(
			this.then((thisResult) => other.then((otherResult) => thisResult.or(otherResult))),
		)
	}

	orElse<U, F>(f: (error: E) => Result<U, F>): ResultPromise<T | U, F> {
		return new ResultPromise(this.then((thisResult) => thisResult.orElse((error) => f(error))))
	}

	async unwrap(): Promise<T> {
		return (await this).unwrap()
	}

	async unwrapErr(): Promise<E> {
		return (await this).unwrapErr()
	}

	async unwrapOr<U>(defaultValue: U): Promise<T | U> {
		return (await this).unwrapOr(defaultValue)
	}

	async unwrapOrElse<U>(defaultValue: (error: E) => U): Promise<T | U> {
		return (await this).unwrapOrElse(defaultValue)
	}

	async match<A, B>(ok: (value: T) => A, err: (error: E) => B): Promise<A | B> {
		return (await this).match(ok, err)
	}
}