import { Metadata } from "../../metadata"
import { Result } from "../../result"
import { JsonOptions } from "../options/types"

export type ConvertState = {
    readonly bytes: Uint8Array<ArrayBuffer>
    readonly metadata: Metadata | Metadata[]
    readonly options: JsonOptions
    index: number
    depth: number
}

export type Converter<T> = (ctx: ConvertState) => Result<ConvertResult<T>, string>

export type ConvertResult<T> = {
    readonly value: T
    readonly nextIndex: number
}