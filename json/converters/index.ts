import { TypeName } from "../../metadata"
import { Converter } from "./types"
import { parseNumber } from "./number"
import { parseString } from "./string"
import { parseObject } from "./object"

type ConvertersMap = Map<TypeName, Converter<unknown>>

export const createConverters = (): ConvertersMap =>
    new Map<TypeName, Converter<unknown>>([
        ["number", parseNumber],
        ["string", parseString],
        ["object", parseObject]
    ])

export const extendConverters = (base: ConvertersMap, extensions: ConvertersMap): ConvertersMap =>
    new Map([...base, ...extensions])
