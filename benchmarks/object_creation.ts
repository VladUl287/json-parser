import { Bench } from 'tinybench'
import { createObjectBuilder } from '../src/metadata/metadata'

const suite = new Bench({ name: 'object_creation', warmupIterations: 200 })

const date = new Date()

const properties: [string, any][] = [
    ["id", 1],
    ["name", "test"],
    ["fullName", "test test"],
    ["createdAt", date],
    ["updatedAt", date],
]

const template = {
    id: null,
    name: null,
    fullName: null,
    createdAt: null,
    updatedAt: null
}

const templatePrototype = Object.getPrototypeOf(template)

function createFromTemplate(properties) {
    const obj = Object.create(templatePrototype)

    for (const [key, value] of properties) {
        obj[key] = value
    }

    return obj
}

const fastCreator = createObjectBuilder(properties)

suite
    .add('codeGen', () => fastCreator(properties))
    .add('fromTemplate', () => createFromTemplate(properties))
    .add('manually', () => {
        return {
            id: 1,
            name: "test",
            fullName: "test test",
            createdAt: date,
            updatedAt: date
        }
    })
    .add('fromEntries', () => Object.fromEntries(properties))
    .add('reduce', () => properties.reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
    }, {}))
    .add('for', () => {
        const obj = {}
        for (const [key, value] of properties) {
            obj[key] = value
        }
        return obj
    })
    .add('assign', () => Object.assign({}, ...properties.map(([k, v]) => ({ [k]: v }))))

suite.run().then(() => {
    console.log(suite.name)
    console.table(suite.table())
})
