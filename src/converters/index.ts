import { TypeName } from "../metadata/metadata"
import { Converter } from "./types"
import { convertNumber } from "./number"
import { convertString } from "./string"
import { convertObject } from "./object"

type ConverterMap = Map<TypeName, Converter<unknown>>

export const createConverters = (): ConverterMap =>
    new Map<TypeName, Converter<unknown>>([
        ["number", convertNumber],
        ["string", convertString],
        ["object", convertObject]
    ])

export const extendConverters = (base: ConverterMap, extensions: ConverterMap): ConverterMap =>
    new Map([...base, ...extensions])
