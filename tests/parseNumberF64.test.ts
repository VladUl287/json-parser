import { parseNumberF64 } from "../src/converters/number";

describe('parseNumberF64', () => {
  it('should parse a simple floating point number', () => {
    const encoder = new TextEncoder()
    const bytes = encoder.encode("3.14")
    
    const result = parseNumberF64(bytes)
    
    expect(result).toEqual(3.14)
  })
})