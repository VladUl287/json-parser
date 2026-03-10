import { JsonOptions } from "../types"
import { Metadata } from "../../metadata"
import { Result } from "../../result"

export type ParseContext = {
    bytes: Uint8Array<ArrayBuffer>
    metadata: Metadata | Metadata[]
    options: JsonOptions
    index: number
    depth: number
}

export type Converter = (ctx: ParseContext) => ConverterResult
export type ConverterResult = Result<[unknown, number], string>

export type ParseResult<T> = {
    value: T
    nextIndex: number
}