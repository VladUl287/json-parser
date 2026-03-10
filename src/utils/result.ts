class Success<T> {
    readonly success = true
    constructor(public readonly value: T) { }

    map<U>(fn: (value: T) => U): Result<U, never> {
        return new Success(fn(this.value))
    }

    getOrElse(defaultValue: T): T {
        return this.value
    }
}

class Err<E> {
    readonly success = false
    constructor(public readonly error: E) { }

    map<U>(fn: (value: never) => U): Result<U, E> {
        return this as any
    }

    getOrElse<U>(defaultValue: U): U {
        return defaultValue
    }
}

export type Result<T, E> = Success<T> | Err<E>

export function success<T, E = never>(value: T): Result<T, E> {
    return new Success(value)
}

export function error<T = never, E = Error>(error: E): Result<T, E> {
    return new Err(error)
}