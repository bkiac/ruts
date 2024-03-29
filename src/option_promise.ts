import {ResultPromise} from "."
import type {Option, OptionMatch} from "./option"

/**
 * A promise that resolves to an `Option`.
 *
 * This class is useful for chaining multiple asynchronous operations that return an `Option`.
 */
export class OptionPromise<T> implements PromiseLike<Option<T>> {
	constructor(readonly promise: Promise<Option<T>> | PromiseLike<Option<T>>) {}

	then<A, B>(
		successCallback?: (res: Option<T>) => A | PromiseLike<A>,
		failureCallback?: (reason: unknown) => B | PromiseLike<B>,
	): PromiseLike<A | B> {
		return this.promise.then(successCallback, failureCallback)
	}

	catch<B>(rejectionCallback?: (reason: unknown) => B | PromiseLike<B>): PromiseLike<B> {
		return this.promise.then(null, rejectionCallback)
	}

	finally(callback: () => void): PromiseLike<Option<T>> {
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

	/**
	 * Async version of `Option#okOr`.
	 */
	okOr<E>(err: E): ResultPromise<T, E> {
		return new ResultPromise(this.then((option) => option.okOr(err)))
	}

	/**
	 * Async version of `Option#okOrElse`.
	 */
	okOrElse<E>(err: () => E): ResultPromise<T, E> {
		return new ResultPromise(this.then((option) => option.okOrElse(err)))
	}

	/**
	 * Async version of `Option#and`.
	 */
	and<U>(other: OptionPromise<U>): OptionPromise<U> {
		return new OptionPromise(
			this.then((option) => other.then((otherOption) => option.and(otherOption))),
		)
	}

	/**
	 * Async version of `Option#andThen`.
	 */
	andThen<U>(f: (value: T) => Option<U>): OptionPromise<U> {
		return new OptionPromise(this.then((option) => option.andThen((value) => f(value))))
	}

	/**
	 * Async version of `Option#inspect`.
	 */
	inspect(f: (value: T) => void): OptionPromise<T> {
		return new OptionPromise(this.then((option) => option.inspect(f)))
	}

	/**
	 * Async version of `Option#expect`.
	 */
	async expect(message: string): Promise<T> {
		return (await this).expect(message)
	}

	/**
	 * Async version of `Option#filter`.
	 */
	filter(f: (value: T) => boolean): OptionPromise<T> {
		return new OptionPromise(this.then((option) => option.filter(f)))
	}

	/**
	 * Async version of `Option#flatten`.
	 */
	flatten<U>(this: OptionPromise<Option<U>>): OptionPromise<U> {
		return new OptionPromise(this.then((option) => option.flatten()))
	}

	/**
	 * Async version of `Option#map`.
	 */
	map<U>(f: (value: T) => U): OptionPromise<U> {
		return new OptionPromise(this.then((option) => option.map(f)))
	}

	/**
	 * Async version of `Option#mapOr`.
	 */
	async mapOr<A, B>(defaultValue: A, f: (value: T) => B): Promise<A | B> {
		return (await this).mapOr(defaultValue, f)
	}

	/**
	 * Async version of `Option#mapOrElse`.
	 */
	async mapOrElse<A, B>(defaultValue: () => A, f: (value: T) => B): Promise<A | B> {
		return (await this).mapOrElse(defaultValue, f)
	}

	/**
	 * Async version of `Option#or`.
	 */
	or<U>(other: OptionPromise<U>): OptionPromise<T | U> {
		return new OptionPromise(
			this.then((thisOption) => other.then((otherOption) => thisOption.or(otherOption))),
		)
	}

	/**
	 * Async version of `Option#orElse`.
	 */
	orElse<U>(f: () => Option<U>): OptionPromise<T | U> {
		return new OptionPromise(this.then((thisOption) => thisOption.orElse(() => f())))
	}

	/**
	 * Async version of `Option#unwrap`.
	 */
	async unwrap(): Promise<T> {
		return (await this).unwrap()
	}

	/**
	 * Async version of `Option#unwrapOr`.
	 */
	async unwrapOr<U>(defaultValue: U): Promise<T | U> {
		return (await this).unwrapOr(defaultValue)
	}

	/**
	 * Async version of `Option#unwrapOrElse`.
	 */
	async unwrapOrElse<U>(f: () => U): Promise<T | U> {
		return (await this).unwrapOrElse(f)
	}

	/**
	 * Async version of `Option#xor`.
	 */
	xor<U>(other: OptionPromise<U>): OptionPromise<T | U> {
		return new OptionPromise(
			this.then((thisOption) => other.then((otherOption) => thisOption.xor(otherOption))),
		)
	}

	/**
	 * Async version of `Option#match`.
	 */
	async match<A, B>(matcher: OptionMatch<T, A, B>): Promise<A | B> {
		return (await this).match(matcher)
	}
}
