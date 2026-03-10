import { Metadata } from "../metadata/metadata"
import { Result } from "../utils/result"
import { JsonOptions } from "../options/types"

export type ConvertState = {
    readonly bytes: Uint8Array<ArrayBuffer>
    readonly metadata: Metadata | Metadata[]
    readonly options: JsonOptions
    readonly convert: Converter<unknown>
    index: number
    depth: number
}

export type Converter<T> = (ctx: ConvertState) => Result<ConvertResult<T>, string>

export type ConvertResult<T> = {
    readonly value: T
    readonly nextIndex: number
}