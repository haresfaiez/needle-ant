import { Surface } from './Surface.js'

describe('Surface identifiers lookup', () => {
  it('extracts called object', () => {
    const actual = Surface.parse('f.y()', (ast) => ast.body)
    expect(actual.identifiers().raws()).toEqual(['f'])
  })
})
