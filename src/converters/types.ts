import { Metadata } from "../metadata/metadata"
import { JsonOptions } from "../options/types"

export type ConvertState = {
    readonly bytes: Uint8Array<ArrayBuffer>
    readonly options: JsonOptions
    readonly convert: Converter<unknown>
}

export type ConvertMeta = Metadata | Metadata[]

export type Converter<T> = (ctx: ConvertState, meta: ConvertMeta, index: number, depth: number) => ConvertResult<T>

export type ConvertResult<T> = {
    readonly value?: T
    readonly nextIndex?: number
    readonly error?: string
}