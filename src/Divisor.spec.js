import { Divisor } from './Divisor.js'

describe('Divisor identifiers lookup', () => {
  it('extracts called object', () => {
    const actual = Divisor.parse('f.y()', (ast) => ast.body)
    expect(actual.identifiers()).toEqual(['f'])
  })

  it('extracts called object property', () => {
    const actual =
      Divisor
        .parse('f.y()', (ast) => ast.body)
        .unfold('f')
    expect(actual.identifiers()).toEqual(['y'])
  })
})
