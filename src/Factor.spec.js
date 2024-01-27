import Factor from './Factor.js'

describe('Expresson factors', () => {
  it('of "a + b + c" are a, b, and c', () => {
    const subject = Factor.parse('a + b + c')
    expect(subject.identifiers()).toEqual(['a', 'b', 'c'])
  })
})
