import { Metadata } from "../../metadata"
import { Result } from "../../result"
import { JsonOptions } from "../options/types"

export type ParseContext = {
    readonly bytes: Uint8Array<ArrayBuffer>
    readonly metadata: Metadata | Metadata[]
    readonly options: JsonOptions
    index: number
    depth: number
}

export type Converter = (ctx: ParseContext) => ConverterResult
export type ConverterResult = Result<[unknown, number], string>

export type ParseResult<T> = {
    readonly value: T
    readonly nextIndex: number
}