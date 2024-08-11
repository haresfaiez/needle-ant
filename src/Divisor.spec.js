import { Divisor } from './Divisor.js'

describe('Divisor identifiers lookup', () => {
  xit('extracts called object', () => {
    const actual = Divisor.parse('f.y()', (ast) => ast.body)
    expect(actual.identifiers()).toEqual(['f'])
  })
})
