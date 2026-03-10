import { Converter } from "./converters/types"
import { TypeName } from "../metadata"

export type JsonOptions = {
    readonly encoder?: TextEncoder
    readonly decoder?: TextDecoder
    readonly converters?: Map<TypeName, Converter>
    readonly maxDepth?: number
    readonly allowTrailingCommas?: boolean,
    readonly fieldCaseInsensitive?: boolean
    readonly allowDuplicateProperties?: boolean
}
