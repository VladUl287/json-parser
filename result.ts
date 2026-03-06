class Success<T> {
    readonly success = true
    constructor(public readonly value: T) { }

    map<U>(fn: (value: T) => U): Result<U, never> {
        return new Success(fn(this.value))
    }

    onSuccess(fn: (value: T) => void): this {
        fn(this.value)
        return this
    }
}

class Err<E> {
    readonly success = false
    constructor(public readonly error: E) { }

    map<U>(fn: (value: never) => U): Result<U, E> {
        return this as any
    }

    onErr(fn: (error: E) => void): this {
        fn(this.error)
        return this
    }
}

export type Result<T, E> = Success<T> | Err<E>

export function ok<T, E = never>(value: T): Result<T, E> {
    return new Success(value)
}

export function err<T = never, E = Error>(error: E): Result<T, E> {
    return new Err(error)
}