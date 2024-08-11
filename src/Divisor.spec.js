import { Divisor } from './Divisor.js'

describe('Divisor identifiers lookup', () => {
  it('extracts called object', () => {
    const actual = Divisor.parse('f.y()', (ast) => ast.body)
    expect(actual.identifiers().raws()).toEqual(['f'])
  })
})
