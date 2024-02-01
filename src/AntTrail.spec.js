import AntTrail from './AntTrail.js'

describe('Expresson factors', () => {
  it('of "a + b + c" are a, b, and c', () => {
    const subject = AntTrail.parse('a + b + c')
    expect(subject.identifiers()).toEqual(['a', 'b', 'c'])
  })
})
