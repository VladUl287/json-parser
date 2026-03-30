import { convertNumber } from '../src/converters/number'
import { convertObject } from '../src/converters/object'
import { convertString } from '../src/converters/string'
import { Converter } from '../src/converters/types'
import { TypeName } from '../src/metadata/metadata'
import { add, complete, cycle, suite } from 'benny'

const converters = new Map<TypeName, Converter<unknown>>([
    ["number", convertNumber],
    ["string", convertString],
    ["object", convertObject]
])

const convertersObj = {
    number: convertNumber,
    string: convertString,
    object: convertObject
}

const convertersNumbers = new Map<number, Converter<unknown>>([
    [1, convertNumber],
    [2, convertString],
    [3, convertObject]
])

enum TypeN {
    number = 1,
    string = 2,
    object = 3
}

const convertersEnum = new Map<TypeN, Converter<unknown>>([
    [TypeN.number, convertNumber],
    [TypeN.string, convertString],
    [TypeN.object, convertObject]
])

const converter = "object"
const converterNum = 3

suite(
    'resolve_convertes',

    add('converters_obj', () => convertersObj[converter].prototype),
    add('converters', () => converters.get(converter).prototype),
    add('convertersNumbers', () => convertersNumbers.get(converterNum).prototype),
    add('convertersEnum', () => convertersEnum.get(converterNum).prototype),

    cycle(),
    complete(),
)
