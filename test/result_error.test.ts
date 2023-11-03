import {describe, expect, it} from "vitest"
import {InvalidErrorPanic, Panic, ResultError, toStdError, StdError} from "../src"

describe.concurrent("ResultError and StdError", () => {
	it("returns instance with no args", () => {
		const error = new StdError()

		expect(error).toBeInstanceOf(ResultError)
		expect(error).toBeInstanceOf(StdError)

		expect(error.name).toEqual("ResultError")
		expect(error.tag).toEqual(StdError.tag)

		expect(error.message).toEqual("")
		expect(error.stack).toContain("StdError: ")
	})

	it("returns instance with message", () => {
		const msg = "msg"
		const error = new StdError(msg)

		expect(error).toBeInstanceOf(ResultError)
		expect(error).toBeInstanceOf(StdError)

		expect(error.name).toEqual("ResultError")
		expect(error.tag).toEqual(StdError.tag)

		expect(error.message).toEqual(msg)
		expect(error.stack).toContain(`StdError: ${msg}`)
	})

	it("returns instance with error", () => {
		const origin = new Error("msg")
		const error = new StdError(origin)

		expect(error).toBeInstanceOf(ResultError)
		expect(error).toBeInstanceOf(StdError)

		expect(error.name).toEqual("ResultError")
		expect(error.tag).toEqual(StdError.tag)

		expect(error.origin).toEqual(origin)
		expect(error.message).toEqual(origin.message)
		// @ts-expect-error
		expect(error._stack).toEqual(origin.stack)
		expect(error.stack).toContain(`StdError: ${origin.message}`)
	})
})

describe.concurrent("toStdError", () => {
	it("returns an StdError when given an Error", () => {
		class TestError extends Error {}
		const error = new TestError("Test error")
		const stdError = toStdError(error)
		expect(stdError).toBeInstanceOf(StdError)
		expect(stdError.origin).toEqual(error)
	})

	it("throws a Panic when given a Panic", () => {
		const msg = "Test panic"
		const panic = new Panic(msg)
		expect(() => toStdError(panic)).toThrow(panic)
	})

	it("throws a Panic when given an unknown value", () => {
		expect(() => toStdError(0)).toThrow(InvalidErrorPanic)
		expect(() => toStdError("")).toThrow(InvalidErrorPanic)
		expect(() => toStdError(true)).toThrow(InvalidErrorPanic)
		expect(() => toStdError(undefined)).toThrow(InvalidErrorPanic)
		expect(() => toStdError(null)).toThrow(InvalidErrorPanic)
		expect(() => toStdError({})).toThrow(InvalidErrorPanic)
		expect(() => toStdError([])).toThrow(InvalidErrorPanic)
	})
})
